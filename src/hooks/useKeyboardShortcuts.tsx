import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  defaultKeyboardShortcutBindings,
  findDuplicateBindings,
  normalizeKeyboardShortcutBindings,
  type KeyBinding,
  type KeyboardShortcutBindings,
  type ShortcutActionId,
} from "../lib/keyboardShortcuts";
import { api } from "../lib/tauri";

interface KeyboardShortcutsContextValue {
  bindings: KeyboardShortcutBindings;
  loaded: boolean;
  recordingActionId: ShortcutActionId | null;
  duplicateError: string | null;
  assignError: string | null;
  setBinding: (actionId: ShortcutActionId, binding: KeyBinding | null) => void;
  startRecording: (actionId: ShortcutActionId) => void;
  cancelRecording: () => void;
  applyRecordedBinding: (binding: KeyBinding | null) => void;
  resetAction: (actionId: ShortcutActionId) => void;
  resetAll: () => void;
}

const KeyboardShortcutsContext =
  createContext<KeyboardShortcutsContextValue | null>(null);

function bindingsToPersist(
  bindings: KeyboardShortcutBindings,
): Record<string, KeyBinding | null> {
  return { ...bindings };
}

function duplicateErrorMessage(
  bindings: KeyboardShortcutBindings,
): string | null {
  const dupes = findDuplicateBindings(bindings);
  if (dupes.size === 0) return null;
  const first = [...dupes.keys()][0];
  return `Shortcut "${first}" is assigned to more than one action.`;
}

export function KeyboardShortcutsProvider({ children }: { children: ReactNode }) {
  const [bindings, setBindings] = useState(defaultKeyboardShortcutBindings);
  const [loaded, setLoaded] = useState(false);
  const [recordingActionId, setRecordingActionId] =
    useState<ShortcutActionId | null>(null);
  const [assignError, setAssignError] = useState<string | null>(null);
  const bindingsRef = useRef(bindings);
  const saveTimerRef = useRef<number | null>(null);

  bindingsRef.current = bindings;

  const duplicateError = useMemo(
    () => duplicateErrorMessage(bindings),
    [bindings],
  );

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const stored = await api.getKeyboardShortcuts();
        if (cancelled) return;
        setBindings(normalizeKeyboardShortcutBindings(stored));
      } catch {
        setBindings(defaultKeyboardShortcutBindings());
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback((next: KeyboardShortcutBindings) => {
    if (duplicateErrorMessage(next)) return;
    if (saveTimerRef.current != null) {
      window.clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = window.setTimeout(() => {
      void api
        .setKeyboardShortcuts(bindingsToPersist(next))
        .catch(() => {
          /* keep local bindings even if save fails */
        });
    }, 300);
  }, []);

  const setBinding = useCallback(
    (actionId: ShortcutActionId, binding: KeyBinding | null) => {
      setBindings((prev) => {
        const next = { ...prev, [actionId]: binding };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const startRecording = useCallback((actionId: ShortcutActionId) => {
    setAssignError(null);
    setRecordingActionId(actionId);
  }, []);

  const cancelRecording = useCallback(() => {
    setRecordingActionId(null);
  }, []);

  const applyRecordedBinding = useCallback(
    (binding: KeyBinding | null) => {
      if (recordingActionId == null) return;
      const actionId = recordingActionId;
      const next = { ...bindingsRef.current, [actionId]: binding };
      const conflict = duplicateErrorMessage(next);
      if (conflict) {
        setAssignError(conflict);
        return;
      }
      setAssignError(null);
      setRecordingActionId(null);
      setBindings(next);
      persist(next);
    },
    [persist, recordingActionId],
  );

  const resetAction = useCallback(
    (actionId: ShortcutActionId) => {
      const defaults = defaultKeyboardShortcutBindings();
      setBinding(actionId, defaults[actionId]);
    },
    [setBinding],
  );

  const resetAll = useCallback(() => {
    const defaults = defaultKeyboardShortcutBindings();
    setBindings(defaults);
    persist(defaults);
  }, [persist]);

  const value = useMemo(
    (): KeyboardShortcutsContextValue => ({
      bindings,
      loaded,
      recordingActionId,
      duplicateError,
      assignError,
      setBinding,
      startRecording,
      cancelRecording,
      applyRecordedBinding,
      resetAction,
      resetAll,
    }),
    [
      applyRecordedBinding,
      bindings,
      cancelRecording,
      assignError,
      duplicateError,
      loaded,
      recordingActionId,
      resetAction,
      resetAll,
      setBinding,
      startRecording,
    ],
  );

  return (
    <KeyboardShortcutsContext.Provider value={value}>
      {children}
    </KeyboardShortcutsContext.Provider>
  );
}

export function useKeyboardShortcuts(): KeyboardShortcutsContextValue {
  const ctx = useContext(KeyboardShortcutsContext);
  if (!ctx) {
    throw new Error(
      "useKeyboardShortcuts must be used within KeyboardShortcutsProvider",
    );
  }
  return ctx;
}
