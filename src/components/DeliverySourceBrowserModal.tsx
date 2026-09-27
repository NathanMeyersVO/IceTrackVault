import { useCallback, useEffect, useMemo, useState } from "react";

import { api, type DeliveryBrowseEntry, type DeliveryEntryKind, type DeliveryFolderBrowseResult } from "../lib/tauri";

export interface DeliverySourceBrowserModalProps {
  title: string;
  supportsScheduleDelivery: boolean;
  deliveryOnlyLabel: string;
  showAllLabel: string;
  continueLabel: string;
  systemFolderPickerLabel: string;
  importFolderHint: string;
  initialPath?: string | null;
  onClose: () => void;
  onContinue: (sourcePaths: string[]) => void;
  onPickSystemFolder: () => Promise<string | null>;
}

const TYPE_LABEL: Record<DeliveryEntryKind, string> = {
  folder: "Folder",
  archive: "Archive",
  schedule: "Schedule",
  audio: "Audio",
  other: "File",
};

function isDeliveryKind(kind: DeliveryEntryKind, supportsSchedule: boolean): boolean {
  if (kind === "folder" || kind === "archive" || kind === "audio") return true;
  if (kind === "schedule" && supportsSchedule) return true;
  return false;
}

function formatModified(ms?: number): string {
  if (ms == null) return "—";
  return new Date(ms).toLocaleString(undefined, {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function formatSize(bytes?: number): string {
  if (bytes == null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Windows canonicalize() often returns \\?\ extended paths; strip for display. */
function stripWindowsExtendedPath(path: string): string {
  if (path.startsWith("\\\\?\\UNC\\")) {
    return `\\\\${path.slice("\\\\?\\UNC\\".length)}`;
  }
  if (path.startsWith("\\\\?\\")) {
    return path.slice(4);
  }
  return path;
}

function entryIcon(kind: DeliveryEntryKind): string {
  switch (kind) {
    case "folder":
      return "📁";
    case "archive":
      return "🗜";
    case "schedule":
      return "📊";
    case "audio":
      return "🎵";
    default:
      return "📄";
  }
}

function formatTopLevelSummary(
  summary: DeliveryFolderBrowseResult["summary"],
  supportsScheduleDelivery: boolean,
): string {
  const parts: string[] = [];
  if (summary.archives.length > 0) {
    parts.push(`${summary.archives.length} archive(s) at top level`);
  }
  if (supportsScheduleDelivery && summary.schedules.length > 0) {
    parts.push(`${summary.schedules.length} schedule file(s) at top level`);
  }
  if (summary.audio_files.length > 0) {
    parts.push(`${summary.audio_files.length} loose audio file(s) at top level`);
  }
  if (parts.length === 0) {
    return "No delivery files at top level (subfolders may contain content).";
  }
  return parts.join(" · ");
}

export function DeliverySourceBrowserModal({
  title,
  supportsScheduleDelivery,
  deliveryOnlyLabel,
  showAllLabel,
  continueLabel,
  systemFolderPickerLabel,
  importFolderHint,
  initialPath = null,
  onClose,
  onContinue,
  onPickSystemFolder,
}: DeliverySourceBrowserModalProps) {
  const [browse, setBrowse] = useState<DeliveryFolderBrowseResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [deliveryOnly, setDeliveryOnly] = useState(true);

  const loadPath = useCallback(async (path: string | null) => {
    setLoading(true);
    setError(null);
    try {
      setBrowse(await api.browseDeliveryFolder(path));
    } catch (e) {
      setError(String(e));
      setBrowse(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPath(initialPath);
  }, [initialPath, loadPath]);

  const visibleEntries = useMemo(() => {
    if (!browse) return [];
    if (!deliveryOnly) return browse.entries;
    return browse.entries.filter((e) => isDeliveryKind(e.kind, supportsScheduleDelivery));
  }, [browse, deliveryOnly, supportsScheduleDelivery]);

  const navigateTo = useCallback(
    (path: string, pushHistory: boolean) => {
      if (pushHistory && browse?.path) {
        setHistory((h) => [...h, browse.path]);
      }
      void loadPath(path);
    },
    [browse?.path, loadPath],
  );

  const goBack = useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const next = [...h];
      const prev = next.pop()!;
      void loadPath(prev);
      return next;
    });
  }, [loadPath]);

  const goUp = useCallback(() => {
    if (browse?.parent_path) {
      navigateTo(browse.parent_path, true);
    }
  }, [browse?.parent_path, navigateTo]);

  const openEntry = useCallback(
    (entry: DeliveryBrowseEntry) => {
      if (entry.kind === "folder") {
        navigateTo(entry.path, true);
      }
    },
    [navigateTo],
  );

  const handleSystemFolder = useCallback(async () => {
    const folder = await onPickSystemFolder();
    if (folder) {
      setHistory([]);
      void loadPath(folder);
    }
  }, [loadPath, onPickSystemFolder]);

  const canContinue = Boolean(browse?.path) && !loading && !error;

  const displayPath = useMemo(
    () => (browse?.path ? stripWindowsExtendedPath(browse.path) : null),
    [browse?.path],
  );

  const handleContinue = useCallback(() => {
    if (!browse?.path) return;
    onContinue([browse.path]);
  }, [browse?.path, onContinue]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col rounded-lg border border-border bg-surface shadow-xl">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-border bg-surface-hover/30 px-3 py-2">
          <button
            type="button"
            disabled={history.length === 0 || loading}
            onClick={goBack}
            className="rounded px-2 py-1 text-sm hover:bg-surface-hover disabled:opacity-40"
            title="Back"
          >
            ← Back
          </button>
          <button
            type="button"
            disabled={!browse?.parent_path || loading}
            onClick={goUp}
            className="rounded px-2 py-1 text-sm hover:bg-surface-hover disabled:opacity-40"
            title="Up one folder"
          >
            ↑ Up
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => void loadPath(browse?.path ?? null)}
            className="rounded px-2 py-1 text-sm hover:bg-surface-hover disabled:opacity-40"
            title="Refresh"
          >
            ↻
          </button>
          <div
            className="min-w-0 flex-1 truncate rounded border border-border/80 bg-background px-2 py-1 font-mono text-xs text-foreground"
            title={displayPath ?? undefined}
          >
            {displayPath ?? "…"}
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-xs text-muted">
            <input
              type="checkbox"
              checked={deliveryOnly}
              onChange={(e) => setDeliveryOnly(e.target.checked)}
              className="rounded border-border"
            />
            {deliveryOnlyLabel}
          </label>
          {!deliveryOnly ? (
            <span className="text-xs text-muted">({showAllLabel})</span>
          ) : null}
        </div>

        <div className="min-h-[14rem] flex-1 overflow-auto">
          {loading ? (
            <div className="space-y-2 p-4">
              <p className="text-sm text-muted">Reading folder…</p>
              <div className="h-1 overflow-hidden rounded-full bg-surface-hover">
                <div className="tv-indeterminate-bar h-full w-1/3 bg-accent" />
              </div>
            </div>
          ) : error ? (
            <p className="p-4 text-sm text-red-400">{error}</p>
          ) : (
            <table className="w-full border-collapse text-sm">
              <thead className="sticky top-0 bg-surface text-left text-xs text-muted">
                <tr className="border-b border-border">
                  <th className="px-2 py-2 font-medium">Name</th>
                  <th className="hidden w-28 px-2 py-2 font-medium sm:table-cell">Type</th>
                  <th className="hidden w-36 px-2 py-2 font-medium md:table-cell">Date modified</th>
                  <th className="hidden w-24 px-2 py-2 font-medium lg:table-cell">Size</th>
                </tr>
              </thead>
              <tbody>
                {visibleEntries.map((entry) => {
                  const delivery = isDeliveryKind(entry.kind, supportsScheduleDelivery);
                  const isFolder = entry.kind === "folder";
                  return (
                    <tr
                      key={entry.path}
                      className={`border-b border-border/60 hover:bg-surface-hover/60 ${
                        delivery ? "" : "opacity-70"
                      } ${isFolder ? "cursor-pointer" : ""}`}
                      onDoubleClick={() => openEntry(entry)}
                    >
                      <td className="max-w-0 px-2 py-1.5">
                        {isFolder ? (
                          <button
                            type="button"
                            className="flex min-w-0 max-w-full items-center gap-2 text-left text-sm text-foreground hover:underline"
                            title={entry.path}
                            onClick={() => openEntry(entry)}
                          >
                            <span className="shrink-0 text-base leading-none" aria-hidden>
                              {entryIcon(entry.kind)}
                            </span>
                            <span className="truncate">{entry.name}</span>
                          </button>
                        ) : (
                          <div
                            className="flex min-w-0 max-w-full items-center gap-2 text-sm text-foreground"
                            title={entry.path}
                          >
                            <span className="shrink-0 text-base leading-none" aria-hidden>
                              {entryIcon(entry.kind)}
                            </span>
                            <span className="truncate">{entry.name}</span>
                          </div>
                        )}
                      </td>
                      <td className="hidden px-2 py-1.5 text-muted sm:table-cell">
                        {TYPE_LABEL[entry.kind]}
                      </td>
                      <td className="hidden px-2 py-1.5 text-muted md:table-cell">
                        {formatModified(entry.modified_ms)}
                      </td>
                      <td className="hidden px-2 py-1.5 text-muted lg:table-cell">
                        {formatSize(entry.size_bytes)}
                      </td>
                    </tr>
                  );
                })}
                {visibleEntries.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-sm text-muted">
                      {deliveryOnly
                        ? "No delivery files in this folder. Turn off the filter to see all files, or open a subfolder."
                        : "This folder is empty."}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          )}
        </div>

        <div className="border-t border-border bg-surface-hover/20 px-4 py-2">
          <p className="text-xs text-muted">{importFolderHint}</p>
          {browse && !loading && !error ? (
            <p className="mt-1 text-xs text-muted">
              {formatTopLevelSummary(browse.summary, supportsScheduleDelivery)}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-3">
          <button
            type="button"
            disabled={loading}
            onClick={() => void handleSystemFolder()}
            className="text-xs text-muted hover:text-accent disabled:opacity-40"
          >
            {systemFolderPickerLabel}
          </button>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-md px-3 py-1.5 text-sm hover:bg-surface-hover disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!canContinue}
              onClick={handleContinue}
              className="rounded-md bg-accent px-3 py-1.5 text-sm text-accent-foreground disabled:opacity-40"
            >
              {continueLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
