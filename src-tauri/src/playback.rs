use std::collections::VecDeque;
use std::fs::File;
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};
use std::sync::mpsc::{self, Receiver, Sender};
use std::sync::Arc;
use std::thread::{self, JoinHandle};
use std::time::{Duration, Instant};

use parking_lot::{Condvar, Mutex};
use rodio::Source;
use symphonia::core::audio::SampleBuffer;
use symphonia::core::codecs::{Decoder, DecoderOptions};
use symphonia::core::errors::Error;
use symphonia::core::formats::{FormatReader, SeekMode, SeekTo};
use symphonia::core::io::MediaSourceStream;
use symphonia::core::meta::MetadataOptions;
use symphonia::core::probe::Hint;
use symphonia::core::units::Time;

use crate::seek_index::{default_index, nearest_keyframe, SeekKeyframe};

/// Initial PCM after open/seek (~370 ms at 44.1 kHz).
const PCM_PREFILL_FRAMES: usize = 16_384;
/// Decode thread fills up to this (~740 ms at 44.1 kHz).
const PCM_HIGH_WATER_FRAMES: usize = 32_768;
const POP_CHUNK_SAMPLES: usize = 4096;

enum DecodeCommand {
    Seek(u64),
    SetSeekIndex(Vec<SeekKeyframe>),
    Shutdown,
}

struct PipelineInner {
    pcm: Mutex<VecDeque<f32>>,
    ready: Condvar,
    eof: AtomicBool,
    playback_frame: AtomicU64,
    sample_rate: AtomicU64,
    channels: AtomicU64,
    samples_in_frame: Mutex<u16>,
}

impl PipelineInner {
    fn new() -> Self {
        Self {
            pcm: Mutex::new(VecDeque::new()),
            ready: Condvar::new(),
            eof: AtomicBool::new(false),
            playback_frame: AtomicU64::new(0),
            sample_rate: AtomicU64::new(44_100),
            channels: AtomicU64::new(2),
            samples_in_frame: Mutex::new(0),
        }
    }

    fn buffered_frames(&self) -> usize {
        let channels = self.channels.load(Ordering::Acquire).max(1) as usize;
        self.pcm.lock().len() / channels
    }

    fn sync_decode_position(&self, session: &TrackSession) {
        self.playback_frame
            .store(session.playback_frame(), Ordering::Release);
        self.sample_rate
            .store(session.sample_rate() as u64, Ordering::Release);
        self.channels
            .store(session.channels().max(1) as u64, Ordering::Release);
        *self.samples_in_frame.lock() = 0;
    }
}

pub struct TrackPipeline {
    inner: Arc<PipelineInner>,
    duration_ms: u64,
    cmd_tx: Sender<DecodeCommand>,
    thread: Mutex<Option<JoinHandle<()>>>,
}

impl Drop for TrackPipeline {
    fn drop(&mut self) {
        let _ = self.cmd_tx.send(DecodeCommand::Shutdown);
        if let Some(handle) = self.thread.lock().take() {
            let _ = handle.join();
        }
    }
}

impl TrackPipeline {
    pub fn sample_rate(&self) -> u32 {
        self.inner.sample_rate.load(Ordering::Acquire) as u32
    }

    pub fn channels(&self) -> u16 {
        self.inner.channels.load(Ordering::Acquire) as u16
    }

    pub fn position_ms(&self) -> u64 {
        let rate = self.inner.sample_rate.load(Ordering::Acquire).max(1);
        let frame = self.inner.playback_frame.load(Ordering::Acquire);
        (frame.saturating_mul(1000) / rate).min(self.duration_ms)
    }

    pub fn is_eof(&self) -> bool {
        self.inner.eof.load(Ordering::Acquire)
    }

    pub fn set_seek_index(&self, seek_index: Vec<SeekKeyframe>) {
        let _ = self.cmd_tx.send(DecodeCommand::SetSeekIndex(seek_index));
    }

    pub fn seek_and_wait(&self, target_ms: u64) -> Result<(), String> {
        self.inner.eof.store(false, Ordering::Release);
        self.cmd_tx
            .send(DecodeCommand::Seek(target_ms))
            .map_err(|e| e.to_string())?;
        self.wait_prefill(Duration::from_secs(120))
    }

    fn wait_prefill(&self, timeout: Duration) -> Result<(), String> {
        let deadline = Instant::now() + timeout;
        let mut pcm = self.inner.pcm.lock();
        loop {
            let frames = {
                let channels = self.inner.channels.load(Ordering::Acquire).max(1) as usize;
                pcm.len() / channels
            };
            if frames >= PCM_PREFILL_FRAMES
                || self.inner.eof.load(Ordering::Acquire)
            {
                return Ok(());
            }
            if Instant::now() >= deadline {
                if frames > 0 || self.inner.eof.load(Ordering::Acquire) {
                    return Ok(());
                }
                return Err("Timed out waiting for audio decode".into());
            }
            self.inner
                .ready
                .wait_for(&mut pcm, Duration::from_millis(25));
        }
    }

    fn pop_chunk(&self, max_samples: usize) -> Option<Vec<f32>> {
        let mut pcm = self.inner.pcm.lock();
        while pcm.is_empty() {
            if self.inner.eof.load(Ordering::Acquire) {
                return None;
            }
            self.inner
                .ready
                .wait_for(&mut pcm, Duration::from_millis(25));
        }
        let take = max_samples.min(pcm.len());
        let chunk: Vec<f32> = pcm.drain(..take).collect();
        drop(pcm);
        self.inner.ready.notify_one();

        let channels = self.inner.channels.load(Ordering::Acquire).max(1) as u16;
        let mut samples_in_frame = self.inner.samples_in_frame.lock();
        let mut frame = self.inner.playback_frame.load(Ordering::Acquire);
        for _ in 0..take {
            *samples_in_frame += 1;
            if *samples_in_frame >= channels {
                *samples_in_frame = 0;
                frame = frame.saturating_add(1);
            }
        }
        self.inner.playback_frame.store(frame, Ordering::Release);

        Some(chunk)
    }
}

struct TrackSession {
    path: PathBuf,
    seek_index: Vec<SeekKeyframe>,
    duration_ms: u64,
    sample_rate: u32,
    channels: u16,
    track_id: u32,
    frame_cursor: u64,
    playback_frame: u64,
    eof: bool,
    format: Option<Box<dyn FormatReader>>,
    decoder: Option<Box<dyn Decoder>>,
    codec_params: Option<symphonia::core::codecs::CodecParameters>,
}

impl TrackSession {
    fn open(
        path: PathBuf,
        duration_ms: u64,
        seek_index: Vec<SeekKeyframe>,
    ) -> Result<Self, String> {
        let index = if seek_index.is_empty() {
            default_index(duration_ms)
        } else {
            seek_index
        };

        Ok(Self {
            path,
            seek_index: index,
            duration_ms,
            sample_rate: 44_100,
            channels: 2,
            track_id: 0,
            frame_cursor: 0,
            playback_frame: 0,
            eof: false,
            format: None,
            decoder: None,
            codec_params: None,
        })
    }

    fn set_seek_index(&mut self, seek_index: Vec<SeekKeyframe>) {
        self.seek_index = if seek_index.is_empty() {
            default_index(self.duration_ms)
        } else {
            seek_index
        };
    }

    fn sample_rate(&self) -> u32 {
        self.sample_rate
    }

    fn channels(&self) -> u16 {
        self.channels
    }

    fn playback_frame(&self) -> u64 {
        self.playback_frame
    }

    fn is_eof(&self) -> bool {
        self.eof
    }

    fn seek_to(&mut self, target_ms: u64, pcm_out: &mut VecDeque<f32>) -> Result<(), String> {
        let target_ms = target_ms.min(self.duration_ms);
        let keyframe = nearest_keyframe(&self.seek_index, target_ms).clone();

        self.reopen()?;

        let target_frame = ms_to_frames(target_ms, self.sample_rate);
        let keyframe_frame = ms_to_frames(keyframe.ts_ms, self.sample_rate);

        if keyframe.ts_ms > 0 {
            let seek_to = SeekTo::Time {
                time: ms_to_time(keyframe.ts_ms),
                track_id: Some(self.track_id),
            };
            let seek_ok = self
                .format
                .as_mut()
                .map(|format| format.seek(SeekMode::Accurate, seek_to).is_ok())
                .unwrap_or(false);
            if let Some(decoder) = self.decoder.as_mut() {
                decoder.reset();
            }
            if seek_ok {
                self.frame_cursor = keyframe_frame;
            } else {
                self.frame_cursor = 0;
                self.decode_until_frame(keyframe_frame, false, pcm_out)?;
            }
        } else {
            self.frame_cursor = 0;
        }

        self.decode_until_frame(target_frame, false, pcm_out)?;
        self.playback_frame = target_frame;
        pcm_out.clear();
        self.prefill_buffer(pcm_out)?;
        Ok(())
    }

    fn reopen(&mut self) -> Result<(), String> {
        let file = File::open(&self.path).map_err(|e| e.to_string())?;
        let mss = MediaSourceStream::new(Box::new(file), Default::default());
        let hint = Hint::new();
        let probed = symphonia::default::get_probe()
            .format(
                &hint,
                mss,
                &symphonia::core::formats::FormatOptions::default(),
                &MetadataOptions::default(),
            )
            .map_err(|e| e.to_string())?;

        let track = probed
            .format
            .default_track()
            .ok_or("No default audio track")?
            .clone();

        self.track_id = track.id;
        self.sample_rate = track
            .codec_params
            .sample_rate
            .unwrap_or(self.sample_rate);
        self.channels = track
            .codec_params
            .channels
            .map(|c| c.count())
            .unwrap_or(self.channels as usize) as u16;

        let decoder = symphonia::default::get_codecs()
            .make(&track.codec_params, &DecoderOptions::default())
            .map_err(|e| e.to_string())?;

        self.codec_params = Some(track.codec_params);
        self.format = Some(probed.format);
        self.decoder = Some(decoder);
        self.frame_cursor = 0;
        self.eof = false;
        Ok(())
    }

    fn prefill_buffer(&mut self, pcm_out: &mut VecDeque<f32>) -> Result<(), String> {
        while self.buffered_frames(pcm_out) < PCM_PREFILL_FRAMES && !self.eof {
            self.decode_one_packet(pcm_out)?;
        }
        Ok(())
    }

    fn buffered_frames(&self, pcm_out: &VecDeque<f32>) -> usize {
        pcm_out.len() / self.channels.max(1) as usize
    }

    fn decode_until_frame(
        &mut self,
        target_frame: u64,
        emit_pcm: bool,
        pcm_out: &mut VecDeque<f32>,
    ) -> Result<(), String> {
        while self.frame_cursor < target_frame && !self.eof {
            self.decode_one_packet_with_target(target_frame, emit_pcm, pcm_out)?;
        }
        Ok(())
    }

    fn decode_one_packet(&mut self, pcm_out: &mut VecDeque<f32>) -> Result<(), String> {
        self.decode_one_packet_with_target(u64::MAX, true, pcm_out)
    }

    fn decode_one_packet_with_target(
        &mut self,
        target_frame: u64,
        emit_pcm: bool,
        pcm_out: &mut VecDeque<f32>,
    ) -> Result<(), String> {
        loop {
            let packet = match self
                .format
                .as_mut()
                .ok_or("Audio format not initialized")?
                .next_packet()
            {
                Ok(packet) => packet,
                Err(Error::ResetRequired) => {
                    if let Some(decoder) = self.decoder.as_mut() {
                        decoder.reset();
                    }
                    continue;
                }
                Err(Error::IoError(_)) | Err(_) => {
                    self.eof = true;
                    return Ok(());
                }
            };

            let decoder = self.decoder.as_mut().ok_or("Decoder not initialized")?;

            match decoder.decode(&packet) {
                Ok(audio_buf) => {
                    if packet.track_id() != self.track_id {
                        continue;
                    }

                    self.sample_rate = audio_buf.spec().rate;
                    self.channels = audio_buf.spec().channels.count() as u16;
                    let channel_count = self.channels as usize;

                    let mut sample_buf = SampleBuffer::<f32>::new(
                        audio_buf.capacity() as u64,
                        *audio_buf.spec(),
                    );
                    sample_buf.copy_interleaved_ref(audio_buf);

                    for frame in sample_buf.samples().chunks(channel_count) {
                        if self.frame_cursor >= target_frame {
                            return Ok(());
                        }

                        if emit_pcm {
                            for &sample in frame {
                                pcm_out.push_back(sample);
                            }
                        }

                        self.frame_cursor += 1;
                    }

                    return Ok(());
                }
                Err(Error::DecodeError(_)) => continue,
                Err(Error::IoError(_)) => {
                    self.eof = true;
                    return Ok(());
                }
                Err(_) => {
                    self.eof = true;
                    return Ok(());
                }
            }
        }
    }
}

fn handle_decode_command(
    cmd: DecodeCommand,
    session: &mut TrackSession,
    inner: &PipelineInner,
) -> bool {
    match cmd {
        DecodeCommand::Shutdown => false,
        DecodeCommand::SetSeekIndex(index) => {
            session.set_seek_index(index);
            true
        }
        DecodeCommand::Seek(target_ms) => {
            inner.eof.store(false, Ordering::Release);
            let mut pcm = inner.pcm.lock();
            pcm.clear();
            let seek_result = session.seek_to(target_ms, &mut pcm);
            drop(pcm);

            if seek_result.is_ok() {
                inner.sync_decode_position(session);
            } else if let Err(error) = seek_result {
                eprintln!("Seek decode error: {error}");
            }
            inner.eof.store(session.is_eof(), Ordering::Release);
            inner.ready.notify_all();
            true
        }
    }
}

fn run_decode_loop(
    mut session: TrackSession,
    rx: Receiver<DecodeCommand>,
    inner: Arc<PipelineInner>,
) {
    loop {
        match rx.recv_timeout(Duration::from_millis(8)) {
            Ok(cmd) => {
                if !handle_decode_command(cmd, &mut session, &inner) {
                    return;
                }
            }
            Err(mpsc::RecvTimeoutError::Disconnected) => return,
            Err(mpsc::RecvTimeoutError::Timeout) => {}
        }

        while let Ok(cmd) = rx.try_recv() {
            if !handle_decode_command(cmd, &mut session, &inner) {
                return;
            }
        }

        if inner.buffered_frames() >= PCM_HIGH_WATER_FRAMES || session.is_eof() {
            continue;
        }

        let mut pcm = inner.pcm.lock();
        if let Err(error) = session.decode_one_packet(&mut pcm) {
            eprintln!("Decode error: {error}");
            session.eof = true;
        }
        inner.eof.store(session.is_eof(), Ordering::Release);
        drop(pcm);
        inner.ready.notify_all();
    }
}

pub struct SymphoniaSource {
    pipeline: Arc<TrackPipeline>,
    sample_rate: u32,
    channels: u16,
    chunk: Vec<f32>,
    chunk_idx: usize,
}

impl SymphoniaSource {
    pub fn new(pipeline: Arc<TrackPipeline>) -> Self {
        Self {
            sample_rate: pipeline.sample_rate(),
            channels: pipeline.channels(),
            chunk: Vec::new(),
            chunk_idx: 0,
            pipeline,
        }
    }
}

impl Iterator for SymphoniaSource {
    type Item = f32;

    fn next(&mut self) -> Option<Self::Item> {
        loop {
            if self.chunk_idx < self.chunk.len() {
                let sample = self.chunk[self.chunk_idx];
                self.chunk_idx += 1;
                return Some(sample);
            }

            self.chunk = self.pipeline.pop_chunk(POP_CHUNK_SAMPLES)?;
            self.chunk_idx = 0;
        }
    }
}

impl Source for SymphoniaSource {
    fn current_frame_len(&self) -> Option<usize> {
        None
    }

    fn sample_rate(&self) -> u32 {
        self.sample_rate
    }

    fn channels(&self) -> u16 {
        self.channels
    }

    fn total_duration(&self) -> Option<Duration> {
        None
    }
}

pub fn open_track_session(
    path: &Path,
    duration_ms: u64,
    seek_index: Vec<SeekKeyframe>,
    start_ms: u64,
) -> Result<(Arc<TrackPipeline>, SymphoniaSource), String> {
    let path_buf = path.to_path_buf();
    let start = start_ms.min(duration_ms);
    let inner = Arc::new(PipelineInner::new());
    let (cmd_tx, cmd_rx) = mpsc::channel();

    let inner_for_thread = Arc::clone(&inner);
    let seek_index_for_session = seek_index.clone();
    let handle = thread::spawn(move || {
        let mut session = match TrackSession::open(path_buf, duration_ms, seek_index_for_session)
        {
            Ok(session) => session,
            Err(error) => {
                eprintln!("Failed to open track session: {error}");
                return;
            }
        };

        {
            let mut pcm = inner_for_thread.pcm.lock();
            if let Err(error) = session.seek_to(start, &mut pcm) {
                eprintln!("Failed to seek track session: {error}");
                return;
            }
            inner_for_thread.sync_decode_position(&session);
            inner_for_thread
                .eof
                .store(session.is_eof(), Ordering::Release);
        }
        inner_for_thread.ready.notify_all();

        run_decode_loop(session, cmd_rx, inner_for_thread);
    });

    let pipeline = Arc::new(TrackPipeline {
        inner,
        duration_ms,
        cmd_tx,
        thread: Mutex::new(Some(handle)),
    });

    pipeline.wait_prefill(Duration::from_secs(120))?;

    let source = SymphoniaSource::new(Arc::clone(&pipeline));
    Ok((pipeline, source))
}

fn ms_to_frames(ms: u64, sample_rate: u32) -> u64 {
    ms.saturating_mul(sample_rate as u64) / 1000
}

fn ms_to_time(ms: u64) -> Time {
    Time {
        seconds: ms / 1000,
        frac: (ms % 1000) as f64 / 1000.0,
    }
}

#[cfg(test)]
mod tests {
    use super::ms_to_frames;

    #[test]
    fn ms_to_frames_at_48khz() {
        assert_eq!(ms_to_frames(60_000, 48_000), 2_880_000);
    }

    #[test]
    fn ms_to_frames_at_44_1khz() {
        assert_eq!(ms_to_frames(60_000, 44_100), 2_646_000);
    }

    #[test]
    fn stale_sample_rate_causes_early_seek_at_48khz() {
        let target_ms = 60_000u64;
        let stale_frame = ms_to_frames(target_ms, 44_100);
        let correct_frame = ms_to_frames(target_ms, 48_000);
        let early_ms = stale_frame * 1000 / 48_000;
        assert_eq!(early_ms, 55_125);
        assert!(correct_frame > stale_frame);
        assert_eq!(correct_frame - stale_frame, 234_000);
    }
}
