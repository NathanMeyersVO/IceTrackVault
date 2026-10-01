import { useCallback, useEffect, useState } from "react";

import { api, type Taglist, type TaglistValue } from "../lib/tauri";
import { getTaglistValueSingularLabel } from "../lib/taglistLabels";

interface AddTaglistValueModalProps {
  taglist: Taglist;
  existingValues: TaglistValue[];
  onClose: () => void;
  onAdded: (tagValue: string) => void;
}

function normalize(value: string): string {
  return value.trim();
}

export function AddTaglistValueModal({
  taglist,
  existingValues,
  onClose,
  onAdded,
}: AddTaglistValueModalProps) {
  const singularLabel = getTaglistValueSingularLabel(taglist);
  const [tagValue, setTagValue] = useState("");
  const [displayTitle, setDisplayTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, saving]);

  const handleSave = useCallback(async () => {
    const trimmedValue = normalize(tagValue);
    const trimmedTitle = normalize(displayTitle);
    if (!trimmedValue || !trimmedTitle) {
      setError("Tag value and display title are required.");
      return;
    }

    const duplicate = existingValues.some(
      (entry) => entry.value != null && entry.value === trimmedValue,
    );
    if (duplicate) {
      setError(`A ${singularLabel} with that tag value already exists.`);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await api.addTaglistValueDefinition(
        taglist.id,
        trimmedValue,
        trimmedTitle,
      );
      onAdded(trimmedValue);
      onClose();
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(false);
    }
  }, [
    displayTitle,
    existingValues,
    onAdded,
    onClose,
    singularLabel,
    tagValue,
    taglist.id,
  ]);

  const canSave =
    normalize(tagValue).length > 0 && normalize(displayTitle).length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div
        className="flex w-full max-w-md flex-col rounded-lg border border-border bg-surface shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-taglist-value-title"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2
            id="add-taglist-value-title"
            className="text-sm font-semibold text-foreground"
          >
            Add {singularLabel}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-md px-2 py-1 text-muted hover:bg-surface-hover hover:text-foreground disabled:opacity-40"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="space-y-3 px-4 py-3">
          <div>
            <label className="mb-1 block text-xs text-muted">
              Tag value ({taglist.tag_key})
            </label>
            <input
              autoFocus
              value={tagValue}
              onChange={(event) => setTagValue(event.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">Display title</label>
            <input
              value={displayTitle}
              onChange={(event) => setDisplayTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && canSave && !saving) {
                  void handleSave();
                }
              }}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </div>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-border px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-md px-3 py-1.5 text-sm text-muted hover:bg-surface-hover hover:text-foreground disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={!canSave || saving}
            className="rounded-md bg-accent px-3 py-1.5 text-sm text-accent-foreground hover:opacity-90 disabled:opacity-40"
          >
            {saving ? "Adding…" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
