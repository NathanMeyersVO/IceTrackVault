export type ShortcutActionId =
  | "trackSelectPrevious"
  | "trackSelectNext"
  | "playHighlighted"
  | "togglePlayPause"
  | "volumeDown"
  | "volumeUp"
  | "seekToStart"
  | "seekToEnd"
  | "sidebarGroupPrevious"
  | "sidebarGroupNext";

export interface KeyBinding {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
}

export type KeyboardShortcutBindings = Record<
  ShortcutActionId,
  KeyBinding | null
>;

export interface ShortcutActionDefinition {
  id: ShortcutActionId;
  label: string;
  defaultBinding: KeyBinding | null;
}

export const SHORTCUT_ACTIONS: ShortcutActionDefinition[] = [
  {
    id: "trackSelectPrevious",
    label: "Select previous track",
    defaultBinding: { key: "ArrowUp" },
  },
  {
    id: "trackSelectNext",
    label: "Select next track",
    defaultBinding: { key: "ArrowDown" },
  },
  {
    id: "playHighlighted",
    label: "Start/restart highlighted track",
    defaultBinding: { key: "Enter" },
  },
  {
    id: "togglePlayPause",
    label: "Play / pause",
    defaultBinding: { key: "p" },
  },
  {
    id: "volumeDown",
    label: "Volume down",
    defaultBinding: { key: "ArrowLeft" },
  },
  {
    id: "volumeUp",
    label: "Volume up",
    defaultBinding: { key: "ArrowRight" },
  },
  {
    id: "seekToStart",
    label: "Jump to beginning of track",
    defaultBinding: { key: "Home" },
  },
  {
    id: "seekToEnd",
    label: "Jump to end of track",
    defaultBinding: { key: "End" },
  },
  {
    id: "sidebarGroupPrevious",
    label: "Previous item in current sidebar group",
    defaultBinding: { key: "PageUp" },
  },
  {
    id: "sidebarGroupNext",
    label: "Next item in current sidebar group",
    defaultBinding: { key: "PageDown" },
  },
];

export const SHORTCUT_ACTION_IDS: ShortcutActionId[] = SHORTCUT_ACTIONS.map(
  (action) => action.id,
);

const KEY_DISPLAY: Record<string, string> = {
  ArrowUp: "↑",
  ArrowDown: "↓",
  ArrowLeft: "←",
  ArrowRight: "→",
  Enter: "Enter",
  Home: "Home",
  End: "End",
  PageUp: "PageUp",
  PageDown: "PageDown",
  " ": "Space",
};

export function defaultKeyboardShortcutBindings(): KeyboardShortcutBindings {
  const bindings = {} as KeyboardShortcutBindings;
  for (const action of SHORTCUT_ACTIONS) {
    bindings[action.id] = action.defaultBinding
      ? { ...action.defaultBinding }
      : null;
  }
  return bindings;
}

function normalizeBinding(binding: KeyBinding | null): KeyBinding | null {
  if (binding == null) return null;
  if (binding.key.length === 0) return null;
  const trimmed = binding.key.trim();
  const key = trimmed.length === 0 ? binding.key : trimmed;
  return {
    key,
    ctrl: binding.ctrl === true,
    alt: binding.alt === true,
    shift: binding.shift === true,
    meta: binding.meta === true,
  };
}

export function normalizeKeyboardShortcutBindings(
  raw: Partial<Record<ShortcutActionId, KeyBinding | null>> | null | undefined,
): KeyboardShortcutBindings {
  const defaults = defaultKeyboardShortcutBindings();
  if (!raw) return defaults;

  const resolved = { ...defaults };
  for (const action of SHORTCUT_ACTIONS) {
    if (Object.prototype.hasOwnProperty.call(raw, action.id)) {
      const value = raw[action.id];
      resolved[action.id] =
        value == null ? null : normalizeBinding(value);
    }
  }
  return resolved;
}

function bindingKeyPart(binding: KeyBinding): string {
  return binding.key.length === 1
    ? binding.key.toLowerCase()
    : binding.key;
}

export function bindingsEqual(
  a: KeyBinding | null,
  b: KeyBinding | null,
): boolean {
  if (a == null && b == null) return true;
  if (a == null || b == null) return false;
  return (
    bindingKeyPart(a) === bindingKeyPart(b) &&
    !!a.ctrl === !!b.ctrl &&
    !!a.alt === !!b.alt &&
    !!a.shift === !!b.shift &&
    !!a.meta === !!b.meta
  );
}

export function eventMatchesBinding(
  event: KeyboardEvent,
  binding: KeyBinding | null,
): boolean {
  if (binding == null) return false;
  if (!!binding.ctrl !== event.ctrlKey) return false;
  if (!!binding.alt !== event.altKey) return false;
  if (!!binding.shift !== event.shiftKey) return false;
  if (!!binding.meta !== event.metaKey) return false;

  if (binding.key.length === 1) {
    return event.key.toLowerCase() === binding.key.toLowerCase();
  }
  return event.key === binding.key;
}

export function bindingFromKeyboardEvent(event: KeyboardEvent): KeyBinding | null {
  if (event.key === "Escape") return null;

  const ignored = new Set([
    "Control",
    "Shift",
    "Alt",
    "Meta",
    "OS",
  ]);
  if (ignored.has(event.key)) return null;

  return normalizeBinding({
    key: event.key,
    ctrl: event.ctrlKey,
    alt: event.altKey,
    shift: event.shiftKey,
    meta: event.metaKey,
  });
}

function formatKeyLabel(key: string): string {
  if (KEY_DISPLAY[key]) return KEY_DISPLAY[key];
  if (key.length === 1) return key.toUpperCase();
  return key;
}

export function formatBindingLabel(binding: KeyBinding | null): string {
  if (binding == null) return "Disabled";
  const parts: string[] = [];
  if (binding.ctrl) parts.push("Ctrl");
  if (binding.alt) parts.push("Alt");
  if (binding.shift) parts.push("Shift");
  if (binding.meta) parts.push("Meta");
  parts.push(formatKeyLabel(binding.key));
  return parts.join("+");
}

export function formatBindingParts(
  binding: KeyBinding | null,
): string[] {
  if (binding == null) return ["Disabled"];
  const parts: string[] = [];
  if (binding.ctrl) parts.push("Ctrl");
  if (binding.alt) parts.push("Alt");
  if (binding.shift) parts.push("Shift");
  if (binding.meta) parts.push("Meta");
  parts.push(formatKeyLabel(binding.key));
  return parts;
}

export function findDuplicateBindings(
  bindings: KeyboardShortcutBindings,
): Map<string, ShortcutActionId[]> {
  const bySignature = new Map<string, ShortcutActionId[]>();

  for (const action of SHORTCUT_ACTIONS) {
    const binding = bindings[action.id];
    if (binding == null) continue;
    const signature = formatBindingLabel(binding);
    const list = bySignature.get(signature) ?? [];
    list.push(action.id);
    bySignature.set(signature, list);
  }

  const duplicates = new Map<string, ShortcutActionId[]>();
  for (const [signature, actions] of bySignature) {
    if (actions.length > 1) {
      duplicates.set(signature, actions);
    }
  }
  return duplicates;
}
