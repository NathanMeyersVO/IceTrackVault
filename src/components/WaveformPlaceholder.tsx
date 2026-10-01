import { useMemo } from "react";

const BAR_COUNT = 56;

function placeholderHeights(trackId: number): number[] {
  return Array.from({ length: BAR_COUNT }, (_, i) => {
    const t = Math.sin(i * 0.7 + trackId) * 0.5 + 0.5;
    return t * 0.35 + 0.08;
  });
}

interface WaveformPlaceholderProps {
  trackId: number;
  durationMs: number;
  positionMs: number;
  waveColor: string;
  cursorColor: string;
}

export function WaveformPlaceholder({
  trackId,
  durationMs,
  positionMs,
  waveColor,
  cursorColor,
}: WaveformPlaceholderProps) {
  const heights = useMemo(() => placeholderHeights(trackId), [trackId]);
  const cursorPercent =
    durationMs > 0 ? Math.min(100, (positionMs / durationMs) * 100) : null;

  return (
    <div
      className="relative h-[72px] w-full overflow-hidden rounded-md border border-dashed border-border/60 bg-surface"
      role="status"
      aria-live="polite"
      aria-label="Preparing waveform"
    >
      <div
        className="flex h-full items-end gap-px px-1 pb-2 pt-2 opacity-35"
        aria-hidden
      >
        {heights.map((h, i) => (
          <div
            key={i}
            className="min-w-0 flex-1 rounded-sm"
            style={{ height: `${h * 100}%`, backgroundColor: waveColor }}
          />
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1.5">
        <span className="text-xs text-muted">Preparing waveform (you can still play the track while it loads)…</span>
        <div className="h-0.5 w-24 overflow-hidden rounded-full bg-surface-hover">
          <div className="tv-indeterminate-bar h-full w-1/3 bg-accent" />
        </div>
      </div>
      {cursorPercent != null ? (
        <div
          className="pointer-events-none absolute bottom-0 top-0 w-0.5 -translate-x-1/2 opacity-70"
          style={{ left: `${cursorPercent}%`, backgroundColor: cursorColor }}
        />
      ) : null}
    </div>
  );
}
