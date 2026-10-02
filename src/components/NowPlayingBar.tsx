import { useCallback, useEffect, useRef, useState } from "react";

import { listen } from "@tauri-apps/api/event";

import { api, formatDuration, type AudioCacheTrackReady } from "../lib/tauri";
import { usePlayer } from "../hooks/usePlayer";
import {
  formatReturnToPlayingTooltip,
  returnToPlaybackOrigin,
} from "../lib/returnToPlaybackOrigin";
import {
  getDisplayPositionMs,
  shouldShowReturnToPlaying,
  usePlayerStore,
} from "../store/playerStore";
import { TransportControls } from "./TransportControls";
import { VolumeControl } from "./VolumeControl";
import { SeekIndicator } from "./SeekIndicator";
import { Waveform, type WaveformPeaksStatus } from "./Waveform";

export function NowPlayingBar() {
  const store = usePlayerStore();
  const {
    tracks,
    playback,
    cursorTrackId,
    cursorTaglistFooter,
    playbackOrigin,
    taglists,
    playlists,
    collections,
    transportBusy,
    transportMode,
    volume,
    previewPositionMs,
    setPreviewPositionMs,
  } = store;
  const {
    togglePlayPause,
    setVolume,
    seek,
    stop,
    seekToStart,
    seekToEnd,
  } = usePlayer();
  const [peaks, setPeaks] = useState<number[]>([]);
  const [peakDurationMs, setPeakDurationMs] = useState(0);
  const [peaksStatus, setPeaksStatus] = useState<WaveformPeaksStatus>("loading");
  const [trackFetchFailed, setTrackFetchFailed] = useState(false);
  const [fetchedTrack, setFetchedTrack] = useState<Awaited<
    ReturnType<typeof api.getTrack>
  > | null>(null);

  const hasLoadedTrack = playback.track_id !== null;
  const isPlaying = playback.is_playing;
  const displayTrackId =
    transportMode === "load" && cursorTrackId != null
      ? cursorTrackId
      : playback.track_id ?? cursorTrackId;
  const displayTrackIdRef = useRef(displayTrackId);
  displayTrackIdRef.current = displayTrackId;
  const libraryTrack = tracks.find((t) => t.id === displayTrackId);
  const libraryHasTrack = libraryTrack != null;
  const trackResolved =
    libraryHasTrack || fetchedTrack?.id === displayTrackId;
  const displayTrack =
    libraryTrack ??
    (fetchedTrack?.id === displayTrackId ? fetchedTrack : null);

  useEffect(() => {
    if (displayTrackId == null) {
      setFetchedTrack(null);
      setTrackFetchFailed(false);
      return;
    }
    if (libraryTrack != null) {
      setFetchedTrack(null);
      setTrackFetchFailed(false);
      return;
    }

    setTrackFetchFailed(false);
    let cancelled = false;
    api
      .getTrack(displayTrackId)
      .then((track) => {
        if (!cancelled) {
          setFetchedTrack(track);
          setTrackFetchFailed(false);
        }
      })
      .catch((error) => {
        console.error(error);
        if (!cancelled) {
          setFetchedTrack(null);
          setTrackFetchFailed(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [displayTrackId, libraryTrack]);

  const durationMs =
    transportMode === "load" && displayTrack
      ? displayTrack.duration_ms
      : hasLoadedTrack
        ? playback.duration_ms || peakDurationMs
        : displayTrack?.duration_ms || peakDurationMs;

  const displayPositionMs = hasLoadedTrack
    ? getDisplayPositionMs(store)
    : previewPositionMs;

  useEffect(() => {
    if (!displayTrackId) {
      setPeaks([]);
      setPeakDurationMs(0);
      setPeaksStatus("loading");
      setPreviewPositionMs(0);
      return;
    }

    if (transportMode === "load") {
      return;
    }

    if (!trackResolved) {
      setPeaks([]);
      setPeakDurationMs(0);
      setPeaksStatus(trackFetchFailed ? "unavailable" : "loading");
      return;
    }

    setPeaks([]);
    setPeakDurationMs(0);
    setPeaksStatus("loading");

    let cancelled = false;
    const trackId = displayTrackId;
    api
      .getTrackPeaks(trackId)
      .then((data) => {
        if (!cancelled && displayTrackIdRef.current === trackId) {
          setPeaks(data.peaks);
          setPeakDurationMs(data.duration_ms);
        }
      })
      .catch((error) => {
        console.error(error);
        if (!cancelled && displayTrackIdRef.current === trackId) {
          setPeaks([]);
          setPeakDurationMs(0);
          setPeaksStatus("unavailable");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    displayTrackId,
    transportMode,
    trackResolved,
    trackFetchFailed,
    setPreviewPositionMs,
  ]);

  useEffect(() => {
    const unlistenPromise = listen<AudioCacheTrackReady>(
      "audio-cache-track-ready",
      (event) => {
        const readyId = event.payload.track_id;
        const currentId = displayTrackIdRef.current;
        if (currentId == null || readyId !== currentId) {
          return;
        }
        void api
          .getTrackPeaks(currentId)
          .then((data) => {
            if (displayTrackIdRef.current !== currentId) {
              return;
            }
            setPeaks(data.peaks);
            setPeakDurationMs(data.duration_ms);
          })
          .catch((error) => {
            console.error(error);
            if (displayTrackIdRef.current === currentId) {
              setPeaks([]);
              setPeakDurationMs(0);
              setPeaksStatus("unavailable");
            }
          });
      },
    );

    return () => {
      void unlistenPromise.then((fn) => fn());
    };
  }, []);

  useEffect(() => {
    if (hasLoadedTrack) {
      setPreviewPositionMs(0);
    }
  }, [hasLoadedTrack, playback.track_id]);

  const handleSeek = useCallback(
    async (positionMs: number) => {
      if (transportBusy) return;
      if (hasLoadedTrack) {
        await seek(positionMs);
      } else if (cursorTrackId) {
        setPreviewPositionMs(positionMs);
      }
    },
    [transportBusy, hasLoadedTrack, cursorTrackId, seek],
  );

  const handleSeekToStart = useCallback(async () => {
    if (transportBusy) return;
    if (hasLoadedTrack) {
      await seekToStart();
    } else if (cursorTrackId) {
      setPreviewPositionMs(0);
    }
  }, [transportBusy, hasLoadedTrack, cursorTrackId, seekToStart]);

  const handleSeekToEnd = useCallback(async () => {
    if (transportBusy) return;
    if (hasLoadedTrack) {
      await seekToEnd();
    } else if (cursorTrackId && durationMs > 0) {
      setPreviewPositionMs(Math.max(0, durationMs - 1000));
    }
  }, [transportBusy, hasLoadedTrack, cursorTrackId, durationMs, seekToEnd]);

  const handleTogglePlayPause = useCallback(async () => {
    if (transportBusy) return;
    await togglePlayPause(previewPositionMs);
  }, [transportBusy, togglePlayPause, previewPositionMs]);

  const handleStop = useCallback(async () => {
    if (transportBusy) return;
    await stop();
  }, [transportBusy, stop]);

  const canSeek = (hasLoadedTrack || cursorTrackId !== null) && !transportBusy;

  const showReturnToPlaying = shouldShowReturnToPlaying({
    playback,
    playbackOrigin,
    view: store.view,
    cursorTrackId,
    cursorTaglistFooter,
  });

  const returnToPlayingTooltip =
    showReturnToPlaying && playbackOrigin
      ? formatReturnToPlayingTooltip(
          playbackOrigin,
          displayTrack?.title ?? null,
          { taglists, playlists, collections },
        )
      : null;

  return (
    <footer className="border-t border-border bg-surface px-4 py-3">
      <div className="mb-3 flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-surface-hover text-lg text-muted">
          ♪
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-foreground">
            {displayTrack?.title ?? "Not playing"}
          </div>
          <div className="truncate text-xs text-muted">
            {displayTrack ? (
              <>
                {displayTrack.artist || "Unknown artist"}
                {" — "}
                {displayTrack.album || "Unknown album"}
              </>
            ) : (
              "Choose a track to play"
            )}
          </div>
        </div>
        {showReturnToPlaying && (
          <button
            type="button"
            onClick={() => returnToPlaybackOrigin()}
            disabled={transportBusy}
            className="flex h-9 shrink-0 items-center gap-1 rounded-md px-2 text-xs font-medium text-foreground hover:bg-surface-hover disabled:opacity-40"
            aria-label={returnToPlayingTooltip ?? "Return to playing track"}
            title={returnToPlayingTooltip ?? undefined}
          >
            <span aria-hidden="true">↩</span>
            <span>Playing track</span>
          </button>
        )}
        <TransportControls
          isPlaying={isPlaying}
          hasLoadedTrack={hasLoadedTrack}
          hasCursor={cursorTrackId !== null}
          transportBusy={transportBusy}
          onStop={handleStop}
          onSeekToStart={handleSeekToStart}
          onTogglePlayPause={handleTogglePlayPause}
          onSeekToEnd={handleSeekToEnd}
        />
        <VolumeControl volume={volume} onChange={setVolume} />
        <div className="flex w-36 shrink-0 items-center justify-end gap-1.5 text-xs tabular-nums text-muted">
          {transportBusy && <SeekIndicator />}
          <span>
            {formatDuration(displayPositionMs)} / {formatDuration(durationMs)}
          </span>
        </div>
      </div>

      <div className="relative">
        <div className={transportBusy ? "opacity-60" : ""}>
          <Waveform
            trackId={displayTrackId}
            peaks={peaks}
            peaksStatus={peaksStatus}
            durationMs={durationMs}
            positionMs={displayPositionMs}
            transportBusy={transportBusy}
            interactive={canSeek}
            onSeek={handleSeek}
          />
        </div>
        {transportBusy && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-md bg-background/40">
            <SeekIndicator className="text-2xl" />
          </div>
        )}
      </div>
    </footer>
  );
}
