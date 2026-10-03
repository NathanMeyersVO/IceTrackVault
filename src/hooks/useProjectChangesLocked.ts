import {
  projectContentLocked,
  projectPlaylistLocked,
} from "../lib/projectLockMode";
import type { ProjectChangesLockMode } from "../lib/tauri";
import { usePlayerStore } from "../store/playerStore";

function useProjectLockMode(): ProjectChangesLockMode {
  return usePlayerStore(
    (s) => s.activeProject?.changes_lock_mode ?? "unlocked",
  );
}

/** True when tracks, taglists, uploads, and delivery edits are blocked. */
export function useProjectChangesLocked(): boolean {
  return projectContentLocked(useProjectLockMode());
}

/** True when playlist create/edit and membership changes are blocked. */
export function useProjectPlaylistLocked(): boolean {
  return projectPlaylistLocked(useProjectLockMode());
}
