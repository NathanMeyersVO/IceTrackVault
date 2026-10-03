import {
  useCallback,
  useEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
} from "react";

import {
  lockDocumentTextSelection,
  unlockDocumentTextSelection,
} from "../lib/documentTextSelectionLock";
import { pointerExceededDragThreshold } from "../lib/pointerDrag";
import { setTrackDragPointer } from "../lib/trackDragPointer";
import { usePlayerStore } from "../store/playerStore";

type Session = {
  pointerId: number;
  trackId: number;
  startX: number;
  startY: number;
  dragging: boolean;
};

export function usePointerTrackDragRow(trackId: number, enabled: boolean) {
  const draggingTrackId = usePlayerStore((state) => state.draggingTrackId);
  const setDraggingTrackId = usePlayerStore((state) => state.setDraggingTrackId);
  const sessionRef = useRef<Session | null>(null);

  const onWindowPointerMove = useCallback(
    (event: PointerEvent) => {
      const session = sessionRef.current;
      if (!session || event.pointerId !== session.pointerId) return;

      if (
        !session.dragging &&
        pointerExceededDragThreshold(
          session.startX,
          session.startY,
          event.clientX,
          event.clientY,
        )
      ) {
        session.dragging = true;
        setTrackDragPointer(event.clientX, event.clientY);
        setDraggingTrackId(session.trackId);
      }

      if (session.dragging) {
        event.preventDefault();
      }
    },
    [setDraggingTrackId],
  );

  const onWindowPointerUp = useCallback(
    (event: PointerEvent) => {
      const session = sessionRef.current;
      if (!session || event.pointerId !== session.pointerId) return;
      sessionRef.current = null;
      unlockDocumentTextSelection();
      window.removeEventListener("pointermove", onWindowPointerMove);
      window.removeEventListener("pointerup", onWindowPointerUp);
      window.removeEventListener("pointercancel", onWindowPointerUp);
    },
    [onWindowPointerMove],
  );

  const clearSession = useCallback(
    (clearStore: boolean) => {
      if (sessionRef.current) {
        unlockDocumentTextSelection();
        window.removeEventListener("pointermove", onWindowPointerMove);
        window.removeEventListener("pointerup", onWindowPointerUp);
        window.removeEventListener("pointercancel", onWindowPointerUp);
      }
      sessionRef.current = null;
      if (clearStore) {
        setDraggingTrackId(null);
      }
    },
    [onWindowPointerMove, onWindowPointerUp, setDraggingTrackId],
  );

  useEffect(() => {
    if (draggingTrackId == null && sessionRef.current?.dragging) {
      clearSession(false);
    }
  }, [draggingTrackId, clearSession]);

  const onRowPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLTableRowElement>) => {
      if (!enabled || event.button !== 0) return;
      const target = event.target as HTMLElement;
      if (target.closest("[data-reorder-grip]")) return;
      if (target.closest("button")) return;

      lockDocumentTextSelection();
      sessionRef.current = {
        pointerId: event.pointerId,
        trackId,
        startX: event.clientX,
        startY: event.clientY,
        dragging: false,
      };
      window.addEventListener("pointermove", onWindowPointerMove);
      window.addEventListener("pointerup", onWindowPointerUp);
      window.addEventListener("pointercancel", onWindowPointerUp);
    },
    [enabled, onWindowPointerMove, onWindowPointerUp, trackId],
  );

  return { onRowPointerDown, clearSession };
}

