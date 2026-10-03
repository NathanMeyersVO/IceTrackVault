import type { Playlist, Taglist } from "./tauri";
import { viewsEqual, type View } from "../store/playerStore";

export interface ReconcileProjectViewInput {
  view: View;
  previousTaglists: Taglist[];
  previousPlaylists: Playlist[];
  nextTaglists: Taglist[];
  nextPlaylists: Playlist[];
}

/** Remap taglist/playlist views to the new project's ids (matched by name). */
export function reconcileProjectView({
  view,
  previousTaglists,
  previousPlaylists,
  nextTaglists,
  nextPlaylists,
}: ReconcileProjectViewInput): View | null {
  if (view === "project_tracks") {
    return null;
  }
  if (typeof view === "object" && "collectionId" in view) {
    return null;
  }

  if (typeof view === "object" && "playlistId" in view) {
    const name = previousPlaylists.find((p) => p.id === view.playlistId)?.name;
    if (!name) {
      return "project_tracks";
    }
    const next = nextPlaylists.find((p) => p.name === name);
    if (!next) {
      return "project_tracks";
    }
    const nextView: View = { playlistId: next.id };
    return viewsEqual(view, nextView) ? null : nextView;
  }

  if (typeof view === "object" && "taglistId" in view) {
    const name = previousTaglists.find((t) => t.id === view.taglistId)?.name;
    if (!name) {
      return "project_tracks";
    }
    const next = nextTaglists.find((t) => t.name === name);
    if (!next) {
      return "project_tracks";
    }
    const nextView: View = { taglistId: next.id, value: view.value };
    return viewsEqual(view, nextView) ? null : nextView;
  }

  return null;
}
