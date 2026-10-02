import { useCallback, useEffect, useState } from "react";
import { ConfirmDialog } from "./ConfirmDialog";
import { ImportProjectArchiveModal } from "./ImportProjectArchiveModal";
import { NewProjectModal } from "./NewProjectModal";
import { useProjectUiReset } from "../hooks/useProjectUiReset";
import { useProject } from "../hooks/usePlayer";
import { usePlayerStore } from "../store/playerStore";
import { APPLICATION_OPTIONS, getApplicationLabel } from "../lib/applicationLabels";
import { formatProjectOriginLine } from "../lib/formatProjectTimestamp";
import { api, type ApplicationId, type ProjectSummary } from "../lib/tauri";

export interface ProjectHubModalProps {
  onClose: () => void;
}

export function ProjectHubModal({ onClose }: ProjectHubModalProps) {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProjectSummary | null>(null);
  const [renameTarget, setRenameTarget] = useState<ProjectSummary | null>(null);
  const [renameName, setRenameName] = useState("");
  const [busy, setBusy] = useState(false);
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [importArchiveOpen, setImportArchiveOpen] = useState(false);
  const { refresh } = useProject();
  const { resetProjectUi } = useProjectUiReset();

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setProjects(await api.listProjects());
      setError(null);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const openProject = async (id: string) => {
    setBusy(true);
    try {
      await api.openProject(id);
      onClose();
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  };

  const activeProjectId = usePlayerStore((s) => s.activeProject?.id);

  const changeProjectChangesLocked = async (
    project: ProjectSummary,
    changesLocked: boolean,
  ) => {
    if (project.changes_locked === changesLocked) return;
    setBusy(true);
    setError(null);
    try {
      await api.updateProjectChangesLocked(project.id, changesLocked);
      await reload();
      if (project.id === activeProjectId) {
        await refresh();
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  };

  const changeProjectApplication = async (project: ProjectSummary, next: ApplicationId) => {
    if (project.application_id === next) return;
    setBusy(true);
    setError(null);
    try {
      await api.updateProjectApplication(project.id, next);
      await reload();
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  };

  const openRename = (project: ProjectSummary) => {
    setRenameTarget(project);
    setRenameName(project.name);
    setError(null);
  };

  const confirmRename = async () => {
    if (!renameTarget) return;
    const trimmed = renameName.trim();
    if (!trimmed) return;
    const renamedId = renameTarget.id;
    setBusy(true);
    setError(null);
    try {
      await api.renameProject(renamedId, trimmed);
      setRenameTarget(null);
      setRenameName("");
      await reload();
      if (renamedId === activeProjectId) {
        await refresh();
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const deletedId = deleteTarget.id;
    const wasActive = deletedId === activeProjectId;
    setBusy(true);
    try {
      const playback = await api.deleteProject(deletedId);
      if (wasActive) {
        resetProjectUi(playback);
      }
      setDeleteTarget(null);
      await refresh();
      await reload();
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <div className="flex max-h-[90vh] w-full max-w-xl flex-col rounded-lg border border-border bg-surface shadow-xl">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold text-foreground">Open project</h2>
          </div>

          <div className="flex min-h-0 flex-1 flex-col px-4 py-3">
            <div className="min-h-0 flex-1 overflow-y-auto">
              {loading ? (
                <p className="text-xs text-muted">Loading…</p>
              ) : projects.length === 0 ? (
                <p className="text-xs text-muted">No projects yet.</p>
              ) : (
                <ul className="space-y-1">
                  {projects.map((p) => (
                    <li
                      key={p.id}
                      className="flex flex-col gap-2 rounded border border-border px-2 py-2 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-foreground">
                          {p.name}
                          {p.changes_locked ? (
                            <span className="ml-1.5 text-xs font-normal text-muted">(locked)</span>
                          ) : null}
                          {activeProjectId === p.id ? (
                            <span className="ml-1.5 text-xs font-normal text-muted">(open)</span>
                          ) : null}
                        </div>
                        <div className="text-xs text-muted">
                          {formatProjectOriginLine(p.origin, p.created_at)}
                          {" · "}
                          {p.track_count} tracks ·{" "}
                          {getApplicationLabel(
                            p.application_id === "usfs_ems" ? "usfs_ems" : "none",
                          )}
                        </div>
                        <label className="mt-1.5 flex items-center gap-2 text-xs text-muted">
                          <input
                            type="checkbox"
                            checked={p.changes_locked}
                            disabled={busy}
                            onChange={(e) =>
                              void changeProjectChangesLocked(p, e.target.checked)
                            }
                            className="rounded border-border"
                          />
                          Lock against changes
                        </label>
                        <label className="mt-1.5 block text-xs text-muted">
                          Application
                          <select
                            value={p.application_id === "usfs_ems" ? "usfs_ems" : "none"}
                            disabled={busy || p.changes_locked}
                            title={
                              p.changes_locked
                                ? "Unlock the project to change application."
                                : undefined
                            }
                            onChange={(e) =>
                              void changeProjectApplication(
                                p,
                                e.target.value as ApplicationId,
                              )
                            }
                            className="mt-0.5 w-full max-w-xs rounded border border-border bg-background px-2 py-1 text-xs text-foreground"
                          >
                            {APPLICATION_OPTIONS.map((opt) => (
                              <option key={opt.id} value={opt.id}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                      <div className="flex shrink-0 gap-1 self-end sm:self-center">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void openProject(p.id)}
                          className="rounded px-2 py-1 text-xs text-accent hover:bg-surface-hover"
                        >
                          Open
                        </button>
                        <button
                          type="button"
                          disabled={busy || p.changes_locked}
                          title={
                            p.changes_locked
                              ? "Unlock the project to rename."
                              : undefined
                          }
                          onClick={() => openRename(p)}
                          className="rounded px-2 py-1 text-xs text-foreground hover:bg-surface-hover disabled:opacity-40"
                        >
                          Rename
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => setDeleteTarget(p)}
                          className="rounded px-2 py-1 text-xs text-red-400 hover:bg-surface-hover"
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="flex shrink-0 gap-2 border-t border-border px-4 py-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => setNewProjectOpen(true)}
              className="flex-1 rounded-md bg-accent px-3 py-2 text-sm text-accent-foreground disabled:opacity-40"
            >
              New project…
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setImportArchiveOpen(true)}
              className="flex-1 rounded-md border border-border px-3 py-2 text-sm text-foreground hover:bg-surface-hover disabled:opacity-40"
            >
              Import from archive…
            </button>
          </div>

          {error && (
            <p className="border-t border-border px-4 py-2 text-xs text-red-400">{error}</p>
          )}

          <div className="flex justify-end border-t border-border px-4 py-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-3 py-1.5 text-sm hover:bg-surface-hover"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {newProjectOpen && (
        <NewProjectModal
          onClose={() => setNewProjectOpen(false)}
          onProjectCreated={onClose}
        />
      )}

      {importArchiveOpen && (
        <ImportProjectArchiveModal
          onClose={() => setImportArchiveOpen(false)}
          onProjectsChanged={reload}
          onProjectOpened={onClose}
        />
      )}

      {renameTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div
            className="w-full max-w-md rounded-lg border border-border bg-surface shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="rename-project-title"
          >
            <div className="border-b border-border px-4 py-3">
              <h2
                id="rename-project-title"
                className="text-sm font-semibold text-foreground"
              >
                Rename project
              </h2>
            </div>
            <div className="px-4 py-3">
              <label className="block text-xs text-muted">
                Project name
                <input
                  type="text"
                  value={renameName}
                  disabled={busy}
                  autoFocus
                  onChange={(e) => setRenameName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && renameName.trim() && !busy) {
                      void confirmRename();
                    }
                    if (e.key === "Escape") {
                      setRenameTarget(null);
                      setRenameName("");
                    }
                  }}
                  className="mt-1 w-full rounded border border-border bg-background px-2 py-1.5 text-sm text-foreground"
                />
              </label>
            </div>
            <div className="flex justify-end gap-2 border-t border-border px-4 py-3">
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setRenameTarget(null);
                  setRenameName("");
                }}
                className="rounded-md px-3 py-1.5 text-sm hover:bg-surface-hover disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy || !renameName.trim()}
                onClick={() => void confirmRename()}
                className="rounded-md bg-accent px-3 py-1.5 text-sm text-accent-foreground disabled:opacity-40"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete project"
          message={`Delete "${deleteTarget.name}" and all its audio and playlists from this computer? This cannot be undone.`}
          confirmLabel="Delete"
          destructive
          busy={busy}
          overlayClassName="z-[60]"
          onConfirm={() => void confirmDelete()}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
