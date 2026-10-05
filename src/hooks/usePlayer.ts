import { useCallback, useEffect } from "react";

import { listen } from "@tauri-apps/api/event";



import {
  api,
  type ArchiveExportProgress,
  type AudioCacheProgress,
  type DeliveryProgress,
  type ProjectLoadProgress,
} from "../lib/tauri";

import { playerController } from "../playerController";
import { reconcileProjectView } from "../lib/reconcileProjectView";

import { usePlayerStore } from "../store/playerStore";



export function useProject() {

  const {
    setTracks,
    setPlaylists,
    setTaglists,
    setCollections,
    setProjectFolder,
    setActiveProject,
    setView,
    setTaglistNav,
    setProjectSearchQuery,
    setPendingPartitionFocus,
    setProjectScanProgress,
    setDeliveryProgress,
    setArchiveExportProgress,
    setProjectLoadProgress,
    markProjectLoadChecked,
  } = usePlayerStore();

  const refresh = useCallback(async () => {
    const snapshot = usePlayerStore.getState();
    const previousProjectId = snapshot.activeProject?.id ?? null;
    const previousView = snapshot.view;
    const previousTaglists = snapshot.taglists;
    const previousPlaylists = snapshot.playlists;

    const [tracks, playlists, taglists, collections, projectFolder, activeProject] =
      await Promise.all([
        api.listTracks(),
        api.listPlaylists(),
        api.listTaglists(),
        api.listCollections(),
        api.getProjectFolder(),
        api.getActiveProject(),
      ]);

    setTracks(tracks);
    setPlaylists(playlists);
    setTaglists(taglists);
    setCollections(collections);
    setProjectFolder(projectFolder);
    setActiveProject(activeProject);

    const nextProjectId = activeProject?.id ?? null;
    if (
      previousProjectId != null &&
      nextProjectId != null &&
      previousProjectId !== nextProjectId
    ) {
      setProjectSearchQuery("");
      setTaglistNav(null);
      setPendingPartitionFocus(null);
      const nextView = reconcileProjectView({
        view: previousView,
        previousTaglists,
        previousPlaylists,
        nextTaglists: taglists,
        nextPlaylists: playlists,
      });
      if (nextView != null) {
        setView(nextView);
      }
    }
  }, [
    setTracks,
    setPlaylists,
    setTaglists,
    setCollections,
    setProjectFolder,
    setActiveProject,
    setView,
    setTaglistNav,
    setProjectSearchQuery,
    setPendingPartitionFocus,
  ]);



  useEffect(() => {

    refresh().catch(console.error);



    const unlisten = listen("project-updated", () => {

      refresh().catch(console.error);

    });



    return () => {

      unlisten.then((fn) => fn());

    };

  }, [refresh]);



  useEffect(() => {
    let cancelled = false;
    api
      .getProjectLoadProgress()
      .then((progress) => {
        if (!cancelled) {
          if (progress != null) {
            setProjectLoadProgress(progress);
          } else {
            markProjectLoadChecked(null);
          }
        }
      })
      .catch((error) => {
        console.error(error);
        if (!cancelled) {
          markProjectLoadChecked(null);
        }
      });

    const unlisten = listen<ProjectLoadProgress>("project-load-progress", (event) => {
      setProjectLoadProgress(event.payload);
    });

    return () => {
      cancelled = true;
      unlisten.then((fn) => fn());
    };
  }, [markProjectLoadChecked, setProjectLoadProgress]);

  useEffect(() => {
    let cancelled = false;
    let intervalId: number | undefined;

    const poll = async () => {
      const { projectLoadProgress, projectLoadChecked } = usePlayerStore.getState();
      const active =
        projectLoadProgress != null && !projectLoadProgress.finished;
      if (projectLoadChecked && !active) {
        if (intervalId != null) {
          window.clearInterval(intervalId);
          intervalId = undefined;
        }
        return;
      }
      try {
        const progress = await api.getProjectLoadProgress();
        if (cancelled || progress == null) return;
        setProjectLoadProgress(progress);
      } catch (error) {
        console.error(error);
      }
    };

    intervalId = window.setInterval(() => void poll(), 500);
    void poll();

    return () => {
      cancelled = true;
      if (intervalId != null) {
        window.clearInterval(intervalId);
      }
    };
  }, [setProjectLoadProgress]);

  useEffect(() => {

    const unlisten = listen<AudioCacheProgress>("project-scan-progress", (event) => {

      setProjectScanProgress(event.payload);

    });



    return () => {

      unlisten.then((fn) => fn());

    };

  }, [setProjectScanProgress]);



  useEffect(() => {

    const unlisten = listen<DeliveryProgress>("delivery-progress", (event) => {

      setDeliveryProgress(event.payload);

    });



    return () => {

      unlisten.then((fn) => fn());

    };

  }, [setDeliveryProgress]);

  useEffect(() => {
    const unlisten = listen<ArchiveExportProgress>("archive-export-progress", (event) => {
      if (event.payload.finished) {
        setArchiveExportProgress(null);
      } else {
        setArchiveExportProgress(event.payload);
      }
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, [setArchiveExportProgress]);

  return { refresh };

}



export const VOLUME_STEP = 0.05;



export function usePlayer() {

  const { playback, cursorTrackId } = usePlayerStore();



  return {

    playback,

    playTrack: playerController.playTrack,

    selectTrack: playerController.selectTrack,

    togglePlayPause: playerController.togglePlayPause,

    setVolume: playerController.setVolume,

    adjustVolume: playerController.adjustVolume,

    seek: playerController.seek,

    stop: playerController.stop,

    seekToStart: playerController.seekToStart,

    seekToEnd: playerController.seekToEnd,

    cursorTrackId,

  };

}


