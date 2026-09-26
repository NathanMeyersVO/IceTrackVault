import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { api, type DeliveryBrowseEntry, type DeliveryEntryKind, type DeliveryFolderBrowseResult } from "../lib/tauri";

export interface DeliverySourceBrowserModalProps {
  title: string;
  supportsScheduleDelivery: boolean;
  deliveryOnlyLabel: string;
  showAllLabel: string;
  continueLabel: string;
  systemFolderPickerLabel: string;
  emptySelectionHint: string;
  initialPath?: string | null;
  initialSelectedPaths?: string[];
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

function selectionIsImportable(
  selected: Map<string, DeliveryEntryKind>,
  supportsSchedule: boolean,
): boolean {
  for (const kind of selected.values()) {
    if (isDeliveryKind(kind, supportsSchedule)) return true;
  }
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

export function DeliverySourceBrowserModal({
  title,
  supportsScheduleDelivery,
  deliveryOnlyLabel,
  showAllLabel,
  continueLabel,
  systemFolderPickerLabel,
  emptySelectionHint,
  initialPath = null,
  initialSelectedPaths = [],
  onClose,
  onContinue,
  onPickSystemFolder,
}: DeliverySourceBrowserModalProps) {
  const [browse, setBrowse] = useState<DeliveryFolderBrowseResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [deliveryOnly, setDeliveryOnly] = useState(true);
  const [selected, setSelected] = useState<Map<string, DeliveryEntryKind>>(() => new Map());
  const [showBasket, setShowBasket] = useState(false);
  const lastBrowsePathRef = useRef<string | null>(null);
  const initialPreselectAppliedRef = useRef(false);
  const selectAllRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (!browse?.path) return;

    const prevPath = lastBrowsePathRef.current;
    if (prevPath !== null && prevPath !== browse.path) {
      setSelected(new Map());
      initialPreselectAppliedRef.current = true;
    }
    lastBrowsePathRef.current = browse.path;

    if (initialPreselectAppliedRef.current || initialSelectedPaths.length === 0) {
      return;
    }

    const next = new Map<string, DeliveryEntryKind>();
    for (const path of initialSelectedPaths) {
      const entry = browse.entries.find((e) => e.path === path);
      next.set(path, entry?.kind ?? "folder");
    }
    if (next.size > 0) {
      setSelected(next);
    }
    initialPreselectAppliedRef.current = true;
  }, [browse, initialSelectedPaths]);

  const visibleEntries = useMemo(() => {
    if (!browse) return [];
    if (!deliveryOnly) return browse.entries;
    return browse.entries.filter((e) => isDeliveryKind(e.kind, supportsScheduleDelivery));
  }, [browse, deliveryOnly, supportsScheduleDelivery]);

  const allVisibleSelected =
    visibleEntries.length > 0 && visibleEntries.every((e) => selected.has(e.path));
  const someVisibleSelected = visibleEntries.some((e) => selected.has(e.path));

  useEffect(() => {
    const el = selectAllRef.current;
    if (!el) return;
    el.indeterminate = someVisibleSelected && !allVisibleSelected;
  }, [allVisibleSelected, someVisibleSelected]);

  const toggleSelectAllVisible = useCallback(() => {
    if (allVisibleSelected) {
      setSelected((prev) => {
        const next = new Map(prev);
        for (const entry of visibleEntries) {
          next.delete(entry.path);
        }
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Map(prev);
        for (const entry of visibleEntries) {
          next.set(entry.path, entry.kind);
        }
        return next;
      });
    }
  }, [allVisibleSelected, visibleEntries]);

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

  const toggleSelected = useCallback((entry: DeliveryBrowseEntry) => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(entry.path)) {
        next.delete(entry.path);
      } else {
        next.set(entry.path, entry.kind);
      }
      return next;
    });
  }, []);

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

  const canContinue = selectionIsImportable(selected, supportsScheduleDelivery);
  const selectedList = useMemo(() => Array.from(selected.entries()), [selected]);

  const displayPath = useMemo(
    () => (browse?.path ? stripWindowsExtendedPath(browse.path) : null),
    [browse?.path],
  );

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
                  <th className="w-10 px-2 py-2">
                    <input
                      ref={selectAllRef}
                      type="checkbox"
                      checked={allVisibleSelected}
                      disabled={visibleEntries.length === 0}
                      onChange={toggleSelectAllVisible}
                      aria-label="Select all in this folder"
                      className="rounded border-border disabled:opacity-40"
                    />
                  </th>
                  <th className="px-2 py-2 font-medium">Name</th>
                  <th className="hidden w-28 px-2 py-2 font-medium sm:table-cell">Type</th>
                  <th className="hidden w-36 px-2 py-2 font-medium md:table-cell">Date modified</th>
                  <th className="hidden w-24 px-2 py-2 font-medium lg:table-cell">Size</th>
                </tr>
              </thead>
              <tbody>
                {visibleEntries.map((entry) => {
                  const checked = selected.has(entry.path);
                  const delivery = isDeliveryKind(entry.kind, supportsScheduleDelivery);
                  return (
                    <tr
                      key={entry.path}
                      className={`border-b border-border/60 hover:bg-surface-hover/60 ${
                        delivery ? "" : "opacity-70"
                      }`}
                      onDoubleClick={() => openEntry(entry)}
                    >
                      <td className="px-2 py-1.5">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleSelected(entry)}
                          aria-label={`Select ${entry.name}`}
                          className="rounded border-border"
                        />
                      </td>
                      <td className="max-w-0 px-2 py-1.5">
                        <button
                          type="button"
                          className="flex min-w-0 max-w-full items-center gap-2 text-left text-sm text-foreground hover:underline"
                          title={entry.path}
                          onClick={() =>
                            entry.kind === "folder" ? openEntry(entry) : toggleSelected(entry)
                          }
                        >
                          <span className="shrink-0 text-base leading-none" aria-hidden>
                            {entryIcon(entry.kind)}
                          </span>
                          <span className="truncate">{entry.name}</span>
                        </button>
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
                    <td colSpan={5} className="px-4 py-6 text-center text-sm text-muted">
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
          <button
            type="button"
            className="text-xs text-accent hover:underline"
            onClick={() => setShowBasket((v) => !v)}
          >
            {selectedList.length} selected in this folder
            {showBasket ? " ▴" : " ▾"}
          </button>
          {showBasket && selectedList.length > 0 ? (
            <ul className="mt-2 max-h-24 overflow-y-auto text-xs text-muted">
              {selectedList.map(([path, kind]) => (
                <li key={path} className="truncate" title={path}>
                  {TYPE_LABEL[kind]}: {path.replace(/^.*[/\\]/, "")}
                </li>
              ))}
            </ul>
          ) : null}
          {!canContinue && selectedList.length > 0 ? (
            <p className="mt-1 text-xs text-red-400">{emptySelectionHint}</p>
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
              disabled={!canContinue || loading}
              onClick={() => onContinue(Array.from(selected.keys()))}
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
