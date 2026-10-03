import { create } from "zustand";

import { normalizeApplicationId } from "../lib/applicationConfig";
import type {
  ApplicationId,
  Collection,
  PlaybackState,
  Playlist,
  ProjectSummary,
  Taglist,
  Track,
  AudioCacheProgress,
  ArchiveExportProgress,
  DeliveryProgress,
  ProjectLoadProgress,
} from "../lib/tauri";

export type View =
  | "project_tracks"
  | { playlistId: number }
  | { taglistId: number; value: string | null }
  | { collectionId: number };
export type TransportMode = "idle" | "seek" | "load";

export interface PendingPausedLoad {
  trackId: number;
  startMs: number;
}

export function serializeView(view: View): string {
  if (view === "project_tracks") return "project_tracks";
  if ("playlistId" in view) return `playlist:${view.playlistId}`;
  if ("taglistId" in view) {
    return `taglist:${view.taglistId}:${view.value ?? ""}`;
  }
  if ("collectionId" in view) return `collection:${view.collectionId}`;
  return "unknown";
}

export function viewsEqual(a: View, b: View): boolean {
  return serializeView(a) === serializeView(b);
}

export function isProjectSourcedView(view: View): boolean {
  return (
    view === "project_tracks" ||
    (typeof view === "object" &&
      ("playlistId" in view || "taglistId" in view))
  );
}

export function getContextTrackId(state: {
  playback: PlaybackState;
  cursorTrackId: number | null;
  transportMode: TransportMode;
}): number | null {
  if (state.transportMode === "load" && state.cursorTrackId != null) {
    return state.cursorTrackId;
  }
  return state.playback.track_id ?? state.cursorTrackId;
}

export interface TaglistNav {
  hasPreviousSublist: boolean;
  hasNextSublist: boolean;
  activatePreviousSublist: () => void;
  activateNextSublist: () => void;
}

export interface PendingPartitionFocus {
  taglistId: number;
  value: string | null;
  trackId: number;
}

export interface PlaybackOrigin {
  view: View;
  trackId: number;
}

export type PlaybackOriginState = Pick<
  PlayerStore,
  | "playback"
  | "playbackOrigin"
  | "view"
  | "cursorTrackId"
  | "cursorTaglistFooter"
>;

export function isAtPlaybackOrigin(state: PlaybackOriginState): boolean {
  const playingId = state.playback.track_id;
  if (playingId == null) return false;

  const origin = state.playbackOrigin;
  if (origin == null || origin.trackId !== playingId) return false;
  if (!viewsEqual(state.view, origin.view)) return false;
  if (state.cursorTaglistFooter) return false;

  return state.cursorTrackId === playingId;
}

export function shouldShowReturnToPlaying(state: PlaybackOriginState): boolean {
  const { playback, playbackOrigin: origin } = state;
  if (!playback.is_playing || playback.track_id == null) return false;
  if (origin == null || origin.trackId !== playback.track_id) return false;
  return !isAtPlaybackOrigin(state);
}

export interface PlayIntent {
  trackId: number;
  startMs: number;
  autoplay: boolean;
}

export const SEEK_CONFIRM_TOLERANCE_MS = 50;
const POSITION_GUARD_TOLERANCE_MS = 100;
export const SEEK_FALLBACK_MS = 15_000;

export function shouldClearPositionGuard(
  guardTargetMs: number,
  incoming: PlaybackState,
): boolean {
  const delta = incoming.position_ms - guardTargetMs;
  if (Math.abs(delta) <= POSITION_GUARD_TOLERANCE_MS) {
    return true;
  }
  if (delta < -POSITION_GUARD_TOLERANCE_MS) {
    return false;
  }
  return incoming.is_playing;
}

export function mergeBackendPlaybackState(
  existing: PlaybackState,
  incoming: PlaybackState,
): PlaybackState {
  if (!incoming.is_playing && existing.track_id === incoming.track_id) {
    return {
      ...incoming,
      position_ms: existing.position_ms,
    };
  }
  return incoming;
}

interface PlayerStore {
  tracks: Track[];
  playlists: Playlist[];
  taglists: Taglist[];
  collections: Collection[];
  view: View;
  cursorTrackId: number | null;
  activeTrackIds: number[];
  playback: PlaybackState;
  scanning: boolean;
  deliveryStaging: boolean;
  deliveryStagingApplicationId: ApplicationId | null;
  deliveryProgress: DeliveryProgress | null;
  archiveExportProgress: ArchiveExportProgress | null;
  projectFolder: string | null;
  activeProject: ProjectSummary | null;
  projectScanProgress: AudioCacheProgress;
  projectLoadProgress: ProjectLoadProgress | null;
  projectLoadChecked: boolean;
  transportBusy: boolean;
  transportMode: TransportMode;
  lockedPositionMs: number | null;
  seekGeneration: number;
  positionGuardTargetMs: number | null;
  pendingPausedLoad: PendingPausedLoad | null;
  pendingPlayIntent: PlayIntent | null;
  loadAutoplayRequested: boolean;
  draggingTrackId: number | null;
  trackDropPointerValid: boolean;
  volume: number;
  taglistNav: TaglistNav | null;
  cursorTaglistFooter: boolean;
  projectSearchQuery: string;
  pendingPartitionFocus: PendingPartitionFocus | null;
  playbackOrigin: PlaybackOrigin | null;
  continuousPlaybackCollectionId: number | null;
  continuousPlaybackTrackIds: number[];
  previewPositionMs: number;
  hideEmptyTaglistPartitions: Record<number, boolean>;
  setHideEmptyTaglistPartitions: (taglistId: number, hide: boolean) => void;
  setTracks: (tracks: Track[]) => void;
  setPlaylists: (playlists: Playlist[]) => void;
  setTaglists: (taglists: Taglist[]) => void;
  setCollections: (collections: Collection[]) => void;
  setView: (view: View) => void;
  setCursorTrackId: (id: number | null) => void;
  setActiveTrackIds: (ids: number[]) => void;
  setPlayback: (playback: PlaybackState) => void;
  setScanning: (scanning: boolean) => void;
  setDeliveryStaging: (deliveryStaging: boolean, applicationId?: ApplicationId | null) => void;
  setDeliveryProgress: (deliveryProgress: DeliveryProgress | null) => void;
  setArchiveExportProgress: (archiveExportProgress: ArchiveExportProgress | null) => void;
  setProjectFolder: (projectFolder: string | null) => void;
  setActiveProject: (activeProject: ProjectSummary | null) => void;
  setProjectScanProgress: (progress: AudioCacheProgress) => void;
  setProjectLoadProgress: (progress: ProjectLoadProgress | null) => void;
  markProjectLoadChecked: (progress: ProjectLoadProgress | null) => void;
  beginTransport: (targetMs: number) => void;
  beginTrackLoad: (targetMs: number, autoplay: boolean) => void;
  endTrackLoad: (result: PlaybackState) => void;
  releaseTransport: () => void;
  completeTransport: (result: PlaybackState, targetMs: number) => void;
  forceCompleteTransport: (targetMs: number) => void;
  setPendingPausedLoad: (load: PendingPausedLoad | null) => void;
  clearPendingPausedLoad: () => void;
  setPendingPlayIntent: (intent: PlayIntent | null) => void;
  clearPendingPlayIntent: () => void;
  setDraggingTrackId: (id: number | null) => void;
  setTrackDropPointerValid: (valid: boolean) => void;
  cancelTrackDrag: () => void;
  applyBackendPlayback: (incoming: PlaybackState) => void;
  setVolume: (volume: number) => void;
  patchTrack: (track: Track) => void;
  setTaglistNav: (nav: TaglistNav | null) => void;
  setCursorTaglistFooter: (active: boolean) => void;
  setProjectSearchQuery: (query: string) => void;
  setPendingPartitionFocus: (focus: PendingPartitionFocus | null) => void;
  setPlaybackOrigin: (origin: PlaybackOrigin | null) => void;
  setContinuousPlaybackContext: (
    collectionId: number | null,
    trackIds: number[],
  ) => void;
  setPreviewPositionMs: (positionMs: number) => void;
}

export function getDisplayPositionMs(
  state: Pick<
    PlayerStore,
    "transportBusy" | "lockedPositionMs" | "positionGuardTargetMs" | "playback"
  >,
): number {
  if (state.transportBusy && state.lockedPositionMs != null) {
    return state.lockedPositionMs;
  }
  if (state.positionGuardTargetMs != null) {
    return state.positionGuardTargetMs;
  }
  return state.playback.position_ms;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  tracks: [],
  playlists: [],
  taglists: [],
  collections: [],
  view: "project_tracks",
  cursorTrackId: null,
  activeTrackIds: [],
  playback: {
    track_id: null,
    position_ms: 0,
    duration_ms: 0,
    is_playing: false,
  },
  scanning: false,
  deliveryStaging: false,
  deliveryStagingApplicationId: null,
  deliveryProgress: null,
  archiveExportProgress: null,
  projectFolder: null,
  activeProject: null,
  projectScanProgress: { done: 0, total: 0, finished: true },
  projectLoadProgress: null,
  projectLoadChecked: false,
  transportBusy: false,
  transportMode: "idle",
  lockedPositionMs: null,
  seekGeneration: 0,
  positionGuardTargetMs: null,
  pendingPausedLoad: null,
  pendingPlayIntent: null,
  loadAutoplayRequested: false,
  draggingTrackId: null,
  trackDropPointerValid: false,
  volume: 1,
  taglistNav: null,
  cursorTaglistFooter: false,
  projectSearchQuery: "",
  pendingPartitionFocus: null,
  playbackOrigin: null,
  continuousPlaybackCollectionId: null,
  continuousPlaybackTrackIds: [],
  previewPositionMs: 0,
  hideEmptyTaglistPartitions: {},
  setHideEmptyTaglistPartitions: (taglistId, hide) =>
    set((state) => ({
      hideEmptyTaglistPartitions: {
        ...state.hideEmptyTaglistPartitions,
        [taglistId]: hide,
      },
    })),
  setTracks: (tracks) => set({ tracks }),
  setPlaylists: (playlists) => set({ playlists }),
  setTaglists: (taglists) => set({ taglists }),
  setCollections: (collections) => set({ collections }),
  setView: (view) => set({ view }),
  setCursorTrackId: (cursorTrackId) =>
    set((state) => ({
      cursorTrackId,
      cursorTaglistFooter:
        cursorTrackId != null ? false : state.cursorTaglistFooter,
    })),
  setActiveTrackIds: (activeTrackIds) => set({ activeTrackIds }),
  setPlayback: (playback) => set({ playback }),
  setScanning: (scanning) => set({ scanning }),
  setDeliveryStaging: (deliveryStaging, applicationId) =>
    set((state) => ({
      deliveryStaging,
      deliveryStagingApplicationId: deliveryStaging
        ? normalizeApplicationId(
            applicationId ?? state.activeProject?.application_id,
          )
        : null,
      deliveryProgress: null,
    })),
  setDeliveryProgress: (deliveryProgress) => set({ deliveryProgress }),
  setArchiveExportProgress: (archiveExportProgress) => set({ archiveExportProgress }),
  setProjectFolder: (projectFolder) => set({ projectFolder }),
  setActiveProject: (activeProject) => set({ activeProject }),
  setProjectScanProgress: (projectScanProgress) => set({ projectScanProgress }),
  setProjectLoadProgress: (projectLoadProgress) =>
    set({ projectLoadProgress, projectLoadChecked: true }),
  markProjectLoadChecked: (progress) =>
    set((state) => {
      if (state.projectLoadProgress && !state.projectLoadProgress.finished) {
        return { projectLoadChecked: true };
      }
      return { projectLoadChecked: true, projectLoadProgress: progress };
    }),
  beginTransport: (targetMs) =>
    set((state) => ({
      transportBusy: true,
      transportMode: "seek",
      lockedPositionMs: targetMs,
      seekGeneration: state.seekGeneration + 1,
      positionGuardTargetMs: null,
      playback: { ...state.playback, position_ms: targetMs },
    })),
  beginTrackLoad: (targetMs, autoplay) =>
    set((state) => ({
      transportBusy: true,
      transportMode: "load",
      lockedPositionMs: targetMs,
      seekGeneration: state.seekGeneration + 1,
      positionGuardTargetMs: null,
      loadAutoplayRequested: autoplay,
    })),
  endTrackLoad: (result) =>
    set({
      transportBusy: false,
      transportMode: "idle",
      lockedPositionMs: null,
      loadAutoplayRequested: false,
      playback: result,
    }),
  releaseTransport: () =>
    set({
      transportBusy: false,
      transportMode: "idle",
      lockedPositionMs: null,
      loadAutoplayRequested: false,
    }),
  completeTransport: (result, targetMs) => {
    const positionMs =
      Math.abs(result.position_ms - targetMs) <= SEEK_CONFIRM_TOLERANCE_MS
        ? targetMs
        : result.position_ms;
    set({
      transportBusy: false,
      transportMode: "idle",
      lockedPositionMs: null,
      playback: { ...result, position_ms: positionMs },
      positionGuardTargetMs: result.is_playing ? positionMs : null,
    });
  },
  forceCompleteTransport: (targetMs) => {
    const { playback } = get();
    get().completeTransport(playback, targetMs);
  },
  setPendingPausedLoad: (pendingPausedLoad) => set({ pendingPausedLoad }),
  clearPendingPausedLoad: () => set({ pendingPausedLoad: null }),
  setPendingPlayIntent: (intent) => set({ pendingPlayIntent: intent }),
  clearPendingPlayIntent: () => set({ pendingPlayIntent: null }),
  setDraggingTrackId: (draggingTrackId) =>
    set({
      draggingTrackId,
      ...(draggingTrackId == null ? { trackDropPointerValid: false } : {}),
    }),
  setTrackDropPointerValid: (trackDropPointerValid) =>
    set({ trackDropPointerValid }),
  cancelTrackDrag: () =>
    set({ draggingTrackId: null, trackDropPointerValid: false }),
  applyBackendPlayback: (incoming) => {
    const state = get();

    if (state.transportBusy && state.transportMode === "load") {
      return;
    }

    if (
      state.transportBusy &&
      state.transportMode === "seek" &&
      state.lockedPositionMs != null
    ) {
      const locked = state.lockedPositionMs;
      const withinTolerance =
        Math.abs(incoming.position_ms - locked) <= SEEK_CONFIRM_TOLERANCE_MS;
      const forwardWhilePlaying =
        incoming.is_playing && shouldClearPositionGuard(locked, incoming);
      if (withinTolerance || forwardWhilePlaying) {
        get().completeTransport(incoming, locked);
      }
      return;
    }

    if (state.positionGuardTargetMs != null) {
      if (!shouldClearPositionGuard(state.positionGuardTargetMs, incoming)) {
        return;
      }
      set({
        positionGuardTargetMs: null,
        playback: mergeBackendPlaybackState(state.playback, incoming),
      });
      return;
    }

    set({ playback: mergeBackendPlaybackState(state.playback, incoming) });
  },
  setVolume: (volume) => set({ volume: Math.min(1, Math.max(0, volume)) }),
  patchTrack: (track) =>
    set((state) => ({
      tracks: state.tracks.map((existing) =>
        existing.id === track.id ? track : existing,
      ),
    })),
  setTaglistNav: (taglistNav) => set({ taglistNav }),
  setCursorTaglistFooter: (active) =>
    set((state) => ({
      cursorTaglistFooter: active,
      cursorTrackId: active ? null : state.cursorTrackId,
    })),
  setProjectSearchQuery: (projectSearchQuery) =>
    set({ projectSearchQuery }),
  setPendingPartitionFocus: (pendingPartitionFocus) => set({ pendingPartitionFocus }),
  setPlaybackOrigin: (playbackOrigin) => set({ playbackOrigin }),
  setContinuousPlaybackContext: (continuousPlaybackCollectionId, continuousPlaybackTrackIds) =>
    set({ continuousPlaybackCollectionId, continuousPlaybackTrackIds }),
  setPreviewPositionMs: (previewPositionMs) => set({ previewPositionMs }),
}));

let transportFallbackId = 0;

export function scheduleSeekFallback(seekGeneration: number, targetMs: number) {
  const id = ++transportFallbackId;
  window.setTimeout(() => {
    if (id !== transportFallbackId) return;
    const state = usePlayerStore.getState();
    if (!state.transportBusy || state.transportMode !== "seek") return;
    if (state.seekGeneration !== seekGeneration) return;
    state.forceCompleteTransport(targetMs);
  }, SEEK_FALLBACK_MS);
}

export function scheduleTrackLoadFallback(loadGeneration: number) {
  const id = ++transportFallbackId;
  window.setTimeout(() => {
    if (id !== transportFallbackId) return;
    const state = usePlayerStore.getState();
    if (!state.transportBusy || state.transportMode !== "load") return;
    if (state.seekGeneration !== loadGeneration) return;
    state.releaseTransport();
  }, SEEK_FALLBACK_MS);
}
