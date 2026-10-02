import { useCallback } from "react";

import { clearTrackTagsCache } from "../lib/trackTagsCache";
import type { PlaybackState } from "../lib/tauri";
import { isProjectSourcedView, usePlayerStore } from "../store/playerStore";

export function useProjectUiReset() {
  const setPlayback = usePlayerStore((s) => s.setPlayback);
  const setView = usePlayerStore((s) => s.setView);
  const setCursorTrackId = usePlayerStore((s) => s.setCursorTrackId);
  const setActiveTrackIds = usePlayerStore((s) => s.setActiveTrackIds);
  const setTaglistNav = usePlayerStore((s) => s.setTaglistNav);
  const setCursorTaglistFooter = usePlayerStore((s) => s.setCursorTaglistFooter);
  const clearPendingPlayIntent = usePlayerStore((s) => s.clearPendingPlayIntent);
  const clearPendingPausedLoad = usePlayerStore((s) => s.clearPendingPausedLoad);
  const setProjectFolder = usePlayerStore((s) => s.setProjectFolder);
  const setActiveProject = usePlayerStore((s) => s.setActiveProject);
  const setProjectSearchQuery = usePlayerStore(
    (s) => s.setProjectSearchQuery,
  );
  const setPendingPartitionFocus = usePlayerStore((s) => s.setPendingPartitionFocus);
  const releaseTransport = usePlayerStore((s) => s.releaseTransport);
  const setPlaybackOrigin = usePlayerStore((s) => s.setPlaybackOrigin);

  const resetProjectUi = useCallback(
    (playback: PlaybackState) => {
      const currentView = usePlayerStore.getState().view;
      setPlayback(playback);
      releaseTransport();
      setCursorTrackId(null);
      setPlaybackOrigin(null);
      clearPendingPlayIntent();
      setProjectFolder(null);
      setActiveProject(null);
      if (isProjectSourcedView(currentView)) {
        setView("project_tracks");
        setActiveTrackIds([]);
        setTaglistNav(null);
        setCursorTaglistFooter(false);
        setProjectSearchQuery("");
        setPendingPartitionFocus(null);
      }
      clearPendingPausedLoad();
      clearTrackTagsCache();
    },
    [
      clearPendingPausedLoad,
      clearPendingPlayIntent,
      releaseTransport,
      setActiveProject,
      setActiveTrackIds,
      setCursorTaglistFooter,
      setCursorTrackId,
      setPlaybackOrigin,
      setProjectFolder,
      setPendingPartitionFocus,
      setPlayback,
      setProjectSearchQuery,
      setTaglistNav,
      setView,
    ],
  );

  return { resetProjectUi };
}
