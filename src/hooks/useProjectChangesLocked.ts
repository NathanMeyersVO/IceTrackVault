import { usePlayerStore } from "../store/playerStore";

export function useProjectChangesLocked(): boolean {
  return usePlayerStore((s) => s.activeProject?.changes_locked === true);
}
