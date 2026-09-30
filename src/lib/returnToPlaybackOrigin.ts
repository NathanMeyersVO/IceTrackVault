import { formatTaglistLabel } from "./taglistLabels";
import { playerController } from "../playerController";
import {
  scrollSidebarItem,
  sidebarCollectionId,
  sidebarPlaylistId,
  sidebarSublistId,
} from "./sidebarNavigation";
import { scrollToTrackRowWithRetry } from "../hooks/useProjectSearchNavigation";
import {
  usePlayerStore,
  viewsEqual,
  type PlaybackOrigin,
  type View,
} from "../store/playerStore";

type OriginLabelStore = Pick<
  ReturnType<typeof usePlayerStore.getState>,
  "taglists" | "playlists" | "collections"
>;

export function formatPlaybackOriginLabel(
  originView: View,
  store: OriginLabelStore,
): string {
  if (originView === "project_tracks") {
    return "Project Tracks";
  }
  if (typeof originView === "object" && "playlistId" in originView) {
    const playlist =
      store.playlists.find((entry) => entry.id === originView.playlistId) ??
      null;
    return playlist ? `Playlist · ${playlist.name}` : "Playlist";
  }
  if (typeof originView === "object" && "collectionId" in originView) {
    const collection =
      store.collections.find((entry) => entry.id === originView.collectionId) ??
      null;
    return collection ? `Collection · ${collection.name}` : "Collection";
  }
  if (typeof originView === "object" && "taglistId" in originView) {
    const taglist =
      store.taglists.find((entry) => entry.id === originView.taglistId) ?? null;
    const partition = formatTaglistLabel(originView.value);
    return taglist ? `${taglist.name} · ${partition}` : partition;
  }
  return "Track list";
}

export function formatReturnToPlayingTooltip(
  origin: PlaybackOrigin,
  trackTitle: string | null,
  store: OriginLabelStore,
): string {
  const originLabel = formatPlaybackOriginLabel(origin.view, store);
  const base = `Return to ${originLabel}`;
  if (trackTitle?.trim()) {
    return `${base} — ${trackTitle.trim()}`;
  }
  return base;
}

export function returnToPlaybackOrigin(): void {
  const store = usePlayerStore.getState();
  const origin = store.playbackOrigin;
  const playingId = store.playback.track_id;
  if (origin == null || playingId == null || origin.trackId !== playingId) {
    return;
  }

  const { view, trackId } = origin;

  if (!viewsEqual(store.view, view)) {
    if (typeof view === "object" && "taglistId" in view) {
      store.setPendingPartitionFocus({
        taglistId: view.taglistId,
        value: view.value,
        trackId,
      });
      store.setView(view);
      scrollSidebarItem(sidebarSublistId(view.taglistId, view.value));
    } else if (typeof view === "object" && "playlistId" in view) {
      store.setView(view);
      scrollSidebarItem(sidebarPlaylistId(view.playlistId));
    } else if (typeof view === "object" && "collectionId" in view) {
      store.setView(view);
      scrollSidebarItem(sidebarCollectionId(view.collectionId));
    } else if (view === "project_tracks") {
      store.setView("project_tracks");
    }
  }

  playerController.selectTrack(trackId);
  scrollToTrackRowWithRetry(trackId);
}
