import { useEffect } from "react";

import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import {
  bindingFromKeyboardEvent,
  formatBindingParts,
  SHORTCUT_ACTIONS,
} from "../lib/keyboardShortcuts";

function KeyLabel({ label }: { label: string }) {
  if (label === "Disabled") {
    return (
      <span className="text-xs italic text-muted">Disabled</span>
    );
  }
  return (
    <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-foreground">
      {label}
    </kbd>
  );
}

interface KeyboardShortcutsModalProps {
  onClose: () => void;
}

export function KeyboardShortcutsModal({ onClose }: KeyboardShortcutsModalProps) {
  const {
    bindings,
    recordingActionId,
    duplicateError,
    assignError,
    startRecording,
    cancelRecording,
    applyRecordedBinding,
    setBinding,
    resetAction,
    resetAll,
  } = useKeyboardShortcuts();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (recordingActionId != null) {
          event.preventDefault();
          event.stopPropagation();
          cancelRecording();
          return;
        }
        onClose();
        return;
      }

      if (recordingActionId == null) return;

      event.preventDefault();
      event.stopPropagation();

      if (event.key === "Backspace" || event.key === "Delete") {
        applyRecordedBinding(null);
        return;
      }

      const binding = bindingFromKeyboardEvent(event);
      if (binding) {
        applyRecordedBinding(binding);
      }
    };

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [
    applyRecordedBinding,
    cancelRecording,
    onClose,
    recordingActionId,
  ]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-lg border border-border bg-surface shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-dialog-title"
      >
        <div className="border-b border-border px-4 py-3">
          <h2
            id="shortcuts-dialog-title"
            className="text-sm font-semibold text-foreground"
          >
            Keyboard shortcuts
          </h2>
          <p className="mt-1 text-xs text-muted">
            Customize shortcuts or disable actions. Changes are saved
            automatically.
          </p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          {duplicateError ?? assignError ? (
            <p className="mb-3 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
              {duplicateError ?? assignError}
            </p>
          ) : null}
          {recordingActionId != null ? (
            <p className="mb-3 rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-xs text-foreground">
              Press a key combination to assign, Backspace or Delete to disable,
              or Esc to cancel.
            </p>
          ) : null}
          <ul className="space-y-2">
            {SHORTCUT_ACTIONS.map((action) => {
              const binding = bindings[action.id];
              const parts = formatBindingParts(binding);
              const isRecording = recordingActionId === action.id;

              return (
                <li
                  key={action.id}
                  className="flex flex-wrap items-center gap-2 border-b border-border/50 pb-2 text-sm text-foreground last:border-0"
                >
                  <span className="min-w-0 flex-1 leading-5">{action.label}</span>
                  <div className="flex shrink-0 flex-wrap items-center gap-1">
                    {parts.map((part) => (
                      <KeyLabel key={part} label={part} />
                    ))}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        isRecording
                          ? cancelRecording()
                          : startRecording(action.id)
                      }
                      className={`rounded-md px-2 py-1 text-xs ${
                        isRecording
                          ? "bg-accent text-accent-foreground"
                          : "bg-surface-hover text-foreground hover:bg-border"
                      }`}
                    >
                      {isRecording ? "Cancel" : "Change"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setBinding(action.id, null)}
                      disabled={binding == null}
                      className="rounded-md bg-surface-hover px-2 py-1 text-xs text-foreground hover:bg-border disabled:opacity-40"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={() => resetAction(action.id)}
                      className="rounded-md bg-surface-hover px-2 py-1 text-xs text-foreground hover:bg-border"
                    >
                      Reset
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-xs text-muted">
            Shortcuts are ignored while typing in a text field.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-3">
          <button
            type="button"
            onClick={() => resetAll()}
            className="rounded-md bg-surface-hover px-3 py-1.5 text-sm text-foreground hover:bg-border"
          >
            Reset all to defaults
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-surface-hover px-3 py-1.5 text-sm text-foreground hover:bg-border"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
