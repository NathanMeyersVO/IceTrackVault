import type { ProjectChangesLockMode } from "./tauri";

export function projectContentLocked(
  mode: ProjectChangesLockMode | undefined,
): boolean {
  return mode != null && mode !== "unlocked";
}

export function projectPlaylistLocked(
  mode: ProjectChangesLockMode | undefined,
): boolean {
  return mode === "all";
}

export function projectLockModeStatusSuffix(
  mode: ProjectChangesLockMode | undefined,
): string {
  if (mode === "all") return " (locked)";
  if (mode === "all_except_playlists") return " (playlists editable)";
  return "";
}

export const PROJECT_LOCK_MODE_OPTIONS: {
  value: ProjectChangesLockMode;
  label: string;
}[] = [
  { value: "unlocked", label: "Unlocked" },
  { value: "all", label: "Lock all against changes" },
  {
    value: "all_except_playlists",
    label: "Lock all except playlists against changes",
  },
];
