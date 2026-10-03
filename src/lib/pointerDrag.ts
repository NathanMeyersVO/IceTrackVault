export const DRAG_THRESHOLD_PX = 4;

export const REORDER_INDEX_ATTR = "data-reorder-index";

export function dropPosition(
  clientY: number,
  rect: DOMRect,
): "before" | "after" {
  return clientY < rect.top + rect.height / 2 ? "before" : "after";
}

export function pointerExceededDragThreshold(
  startX: number,
  startY: number,
  x: number,
  y: number,
  threshold = DRAG_THRESHOLD_PX,
): boolean {
  return (
    Math.abs(x - startX) >= threshold || Math.abs(y - startY) >= threshold
  );
}

export function findReorderIndexFromPoint(
  clientX: number,
  clientY: number,
  container: Element | null,
  attr = REORDER_INDEX_ATTR,
): { index: number; position: "before" | "after"; element: Element } | null {
  if (!container) return null;
  const hit = document.elementFromPoint(clientX, clientY);
  if (!hit || !container.contains(hit)) return null;
  const row = hit.closest(`[${attr}]`);
  if (!row || !container.contains(row)) return null;
  const raw = row.getAttribute(attr);
  if (raw == null) return null;
  const index = Number.parseInt(raw, 10);
  if (!Number.isFinite(index)) return null;
  const rect = row.getBoundingClientRect();
  return { index, position: dropPosition(clientY, rect), element: row };
}

export const AUTO_SCROLL_EDGE_PX = 32;
export const AUTO_SCROLL_MIN_PX = 2;
export const AUTO_SCROLL_MAX_PX = 14;

export type ScrollViewportRect = {
  top: number;
  bottom: number;
};

export function scrollDeltaForPointer(
  clientY: number,
  containerRect: ScrollViewportRect,
  options?: { edgeSize?: number; minDelta?: number; maxDelta?: number },
): number {
  const edgeSize = options?.edgeSize ?? AUTO_SCROLL_EDGE_PX;
  const minDelta = options?.minDelta ?? AUTO_SCROLL_MIN_PX;
  const maxDelta = options?.maxDelta ?? AUTO_SCROLL_MAX_PX;
  const topEdge = containerRect.top + edgeSize;
  const bottomEdge = containerRect.bottom - edgeSize;

  const scaled = (depth: number) => {
    const t = edgeSize <= 0 ? 1 : Math.min(1, depth / edgeSize);
    return minDelta + t * (maxDelta - minDelta);
  };

  if (clientY < topEdge) {
    return -scaled(topEdge - clientY);
  }
  if (clientY > bottomEdge) {
    return scaled(clientY - bottomEdge);
  }
  return 0;
}

export function applyPointerAutoScrollStep(
  scrollEl: HTMLElement,
  clientY: number,
): void {
  const delta = scrollDeltaForPointer(
    clientY,
    scrollEl.getBoundingClientRect(),
  );
  if (delta === 0) return;
  const maxScroll = scrollEl.scrollHeight - scrollEl.clientHeight;
  scrollEl.scrollTop = Math.min(
    maxScroll,
    Math.max(0, scrollEl.scrollTop + delta),
  );
}

export function findScrollableAncestor(el: Element | null): HTMLElement | null {
  let current: Element | null = el;
  while (current) {
    if (current instanceof HTMLElement) {
      const overflowY = getComputedStyle(current).overflowY;
      if (
        (overflowY === "auto" || overflowY === "scroll") &&
        current.scrollHeight > current.clientHeight
      ) {
        return current;
      }
    }
    current = current.parentElement;
  }
  return null;
}

export const TRACK_DROP_ATTR = "data-track-drop";

export function findTrackDropTargetFromPoint(
  clientX: number,
  clientY: number,
): Element | null {
  const hit = document.elementFromPoint(clientX, clientY);
  if (!hit) return null;
  return hit.closest(`[${TRACK_DROP_ATTR}]`);
}

export type TrackDropKind = "taglist" | "playlist";

export type ResolvedTrackDropTarget =
  | {
      kind: "taglist";
      taglistId: number;
      value: string | null;
      displayTitle: string | null;
      element: Element;
    }
  | {
      kind: "playlist";
      playlistId: number;
      element: Element;
    };

function parseTagDropValue(raw: string | null): string | null {
  if (raw == null || raw === "none") return null;
  return raw;
}

export function resolveTrackDropTarget(
  clientX: number,
  clientY: number,
  options?: { allowTagDrop?: boolean; allowPlaylistDrop?: boolean },
): ResolvedTrackDropTarget | null {
  const allowTagDrop = options?.allowTagDrop ?? true;
  const allowPlaylistDrop = options?.allowPlaylistDrop ?? true;
  const target = findTrackDropTargetFromPoint(clientX, clientY);
  if (!target) return null;

  const kind = target.getAttribute(TRACK_DROP_ATTR);
  if (kind === "taglist") {
    if (!allowTagDrop) return null;
    const taglistId = Number.parseInt(
      target.getAttribute("data-taglist-id") ?? "",
      10,
    );
    if (!Number.isFinite(taglistId)) return null;
    const displayRaw = target.getAttribute("data-tag-display-title");
    return {
      kind: "taglist",
      taglistId,
      value: parseTagDropValue(target.getAttribute("data-tag-value")),
      displayTitle: displayRaw ? displayRaw : null,
      element: target,
    };
  }

  if (kind === "playlist") {
    if (!allowPlaylistDrop) return null;
    const playlistId = Number.parseInt(
      target.getAttribute("data-playlist-id") ?? "",
      10,
    );
    if (!Number.isFinite(playlistId)) return null;
    return { kind: "playlist", playlistId, element: target };
  }

  return null;
}
