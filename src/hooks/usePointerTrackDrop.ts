import { useEffect, useRef, type RefObject } from "react";

import { resolveTrackDropTarget } from "../lib/pointerDrag";
import {
  setTrackDragPointer,
  trackDragPointerRef,
} from "../lib/trackDragPointer";
import type { Taglist, TaglistValue } from "../lib/tauri";
import { usePlayerStore } from "../store/playerStore";
import { usePointerDragAutoScroll } from "./usePointerDragAutoScroll";

export function usePointerTrackDrop(options: {
  scrollContainerRef: RefObject<HTMLElement | null>;
  taglists: Taglist[];
  onTagDrop: (trackId: number, taglist: Taglist, entry: TaglistValue) => void;
  onPlaylistDrop: (trackId: number, playlistId: number) => void;
  enabled?: boolean;
  allowTagDrop?: boolean;
  allowPlaylistDrop?: boolean;
}) {
  const {
    scrollContainerRef,
    taglists,
    onTagDrop,
    onPlaylistDrop,
    enabled = true,
    allowTagDrop = true,
    allowPlaylistDrop = true,
  } = options;

  const draggingTrackId = usePlayerStore((state) => state.draggingTrackId);
  const setTrackDropPointerValid = usePlayerStore(
    (state) => state.setTrackDropPointerValid,
  );
  const cancelTrackDrag = usePlayerStore((state) => state.cancelTrackDrag);
  const setDraggingTrackId = usePlayerStore((state) => state.setDraggingTrackId);

  const allowTagDropRef = useRef(allowTagDrop);
  allowTagDropRef.current = allowTagDrop;
  const allowPlaylistDropRef = useRef(allowPlaylistDrop);
  allowPlaylistDropRef.current = allowPlaylistDrop;

  const taglistsRef = useRef(taglists);
  taglistsRef.current = taglists;
  const onTagDropRef = useRef(onTagDrop);
  onTagDropRef.current = onTagDrop;
  const onPlaylistDropRef = useRef(onPlaylistDrop);
  onPlaylistDropRef.current = onPlaylistDrop;

  const pointerRef = useRef({ clientX: 0, clientY: 0 });
  const draggingTrackIdRef = useRef(draggingTrackId);
  draggingTrackIdRef.current = draggingTrackId;

  const updateHover = (clientX: number, clientY: number) => {
    setTrackDragPointer(clientX, clientY);
    const resolved = resolveTrackDropTarget(clientX, clientY, {
      allowTagDrop: allowTagDropRef.current,
      allowPlaylistDrop: allowPlaylistDropRef.current,
    });
    setTrackDropPointerValid(resolved != null);
  };

  const updateHoverRef = useRef(updateHover);
  updateHoverRef.current = updateHover;

  const { startAutoScroll, stopAutoScroll, resetScrollEl } =
    usePointerDragAutoScroll({
      scrollContainerRef,
      getPointer: () => pointerRef.current,
      isActive: () => draggingTrackIdRef.current != null,
      onTick: () => {
        const { clientX, clientY } = pointerRef.current;
        updateHoverRef.current(clientX, clientY);
      },
    });

  const startAutoScrollRef = useRef(startAutoScroll);
  startAutoScrollRef.current = startAutoScroll;
  const stopAutoScrollRef = useRef(stopAutoScroll);
  stopAutoScrollRef.current = stopAutoScroll;

  useEffect(() => {
    if (!enabled) {
      stopAutoScrollRef.current();
      resetScrollEl();
      return;
    }
    if (draggingTrackId == null) {
      stopAutoScrollRef.current();
      resetScrollEl();
      return;
    }

    pointerRef.current = {
      clientX: trackDragPointerRef.clientX,
      clientY: trackDragPointerRef.clientY,
    };
    updateHoverRef.current(
      trackDragPointerRef.clientX,
      trackDragPointerRef.clientY,
    );

    const onPointerMove = (event: PointerEvent) => {
      event.preventDefault();
      pointerRef.current = {
        clientX: event.clientX,
        clientY: event.clientY,
      };
      updateHoverRef.current(event.clientX, event.clientY);
      startAutoScrollRef.current();
    };

    const finishDrag = () => {
      stopAutoScrollRef.current();
      setTrackDropPointerValid(false);
      setDraggingTrackId(null);
    };

    const onPointerUp = (event: PointerEvent) => {
      stopAutoScrollRef.current();
      const trackId = draggingTrackIdRef.current;
      const resolved = resolveTrackDropTarget(event.clientX, event.clientY, {
        allowTagDrop: allowTagDropRef.current,
        allowPlaylistDrop: allowPlaylistDropRef.current,
      });
      finishDrag();

      if (!resolved || trackId == null) return;

      if (resolved.kind === "taglist") {
        const taglist = taglistsRef.current.find(
          (entry) => entry.id === resolved.taglistId,
        );
        if (!taglist) return;
        const entry: TaglistValue = {
          value: resolved.value,
          display_title: resolved.displayTitle,
          track_count: 0,
        };
        onTagDropRef.current(trackId, taglist, entry);
        return;
      }

      onPlaylistDropRef.current(trackId, resolved.playlistId);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      stopAutoScrollRef.current();
      cancelTrackDrag();
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    window.addEventListener("keydown", onKeyDown, true);

    return () => {
      stopAutoScrollRef.current();
      resetScrollEl();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      window.removeEventListener("keydown", onKeyDown, true);
    };
  }, [
    draggingTrackId,
    cancelTrackDrag,
    enabled,
    resetScrollEl,
    setDraggingTrackId,
    setTrackDropPointerValid,
  ]);
}
