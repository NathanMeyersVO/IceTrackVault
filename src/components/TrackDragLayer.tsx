import { useEffect, useRef } from "react";

import {
  subscribeTrackDragPointer,
  trackDragPointerRef,
} from "../lib/trackDragPointer";
import { usePlayerStore } from "../store/playerStore";

const PREVIEW_OFFSET_X = 12;
const PREVIEW_OFFSET_Y = 16;

export function TrackDragLayer() {
  const draggingTrackId = usePlayerStore((state) => state.draggingTrackId);
  const trackDropPointerValid = usePlayerStore(
    (state) => state.trackDropPointerValid,
  );
  const tracks = usePlayerStore((state) => state.tracks);

  const previewRef = useRef<HTMLDivElement>(null);

  const title =
    draggingTrackId != null
      ? (tracks.find((t) => t.id === draggingTrackId)?.title ?? "Track")
      : "";

  useEffect(() => {
    if (draggingTrackId == null) return;

    const applyPointer = (clientX: number, clientY: number) => {
      const el = previewRef.current;
      if (!el) return;
      el.style.transform = `translate(${clientX + PREVIEW_OFFSET_X}px, ${clientY + PREVIEW_OFFSET_Y}px)`;
    };

    applyPointer(trackDragPointerRef.clientX, trackDragPointerRef.clientY);
    return subscribeTrackDragPointer(applyPointer);
  }, [draggingTrackId]);

  useEffect(() => {
    const body = document.body;
    if (draggingTrackId == null) {
      body.classList.remove(
        "tv-track-drag-active",
        "tv-track-drop-valid",
        "tv-track-drop-invalid",
      );
      return;
    }

    body.classList.add("tv-track-drag-active");
    body.classList.toggle("tv-track-drop-valid", trackDropPointerValid);
    body.classList.toggle("tv-track-drop-invalid", !trackDropPointerValid);

    return () => {
      body.classList.remove(
        "tv-track-drag-active",
        "tv-track-drop-valid",
        "tv-track-drop-invalid",
      );
    };
  }, [draggingTrackId, trackDropPointerValid]);

  if (draggingTrackId == null) return null;

  return (
    <div
      ref={previewRef}
      className="pointer-events-none fixed left-0 top-0 z-[9999] max-w-[min(20rem,calc(100vw-2rem))] truncate rounded-md border border-border bg-surface px-2.5 py-1 text-sm font-medium text-foreground shadow-md"
      style={{ transform: "translate(-9999px, -9999px)" }}
      aria-hidden
    >
      {title}
    </div>
  );
}
