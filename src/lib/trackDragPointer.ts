/** Latest pointer position during an active track drag (updated from the drop hook). */
export const trackDragPointerRef = { clientX: 0, clientY: 0 };

export type TrackDragPointerListener = (clientX: number, clientY: number) => void;

const listeners = new Set<TrackDragPointerListener>();

export function setTrackDragPointer(clientX: number, clientY: number): void {
  trackDragPointerRef.clientX = clientX;
  trackDragPointerRef.clientY = clientY;
  for (const listener of listeners) {
    listener(clientX, clientY);
  }
}

export function subscribeTrackDragPointer(
  listener: TrackDragPointerListener,
): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
