import { describe, expect, it } from "vitest";

import {
  bindingsEqual,
  defaultKeyboardShortcutBindings,
  eventMatchesBinding,
  findDuplicateBindings,
  formatBindingLabel,
  normalizeKeyboardShortcutBindings,
} from "./keyboardShortcuts";

function keyEvent(
  key: string,
  modifiers: Partial<
    Pick<KeyboardEvent, "ctrlKey" | "altKey" | "shiftKey" | "metaKey">
  > = {},
): KeyboardEvent {
  return {
    key,
    ctrlKey: modifiers.ctrlKey ?? false,
    altKey: modifiers.altKey ?? false,
    shiftKey: modifiers.shiftKey ?? false,
    metaKey: modifiers.metaKey ?? false,
  } as KeyboardEvent;
}

describe("eventMatchesBinding", () => {
  it("matches letter keys case-insensitively", () => {
    const binding = { key: "p" };
    expect(eventMatchesBinding(keyEvent("P"), binding)).toBe(true);
    expect(eventMatchesBinding(keyEvent("p"), binding)).toBe(true);
  });

  it("requires modifier match", () => {
    const binding = { key: "p", ctrl: true };
    expect(eventMatchesBinding(keyEvent("p", { ctrlKey: true }), binding)).toBe(
      true,
    );
    expect(eventMatchesBinding(keyEvent("p"), binding)).toBe(false);
  });

  it("returns false for disabled bindings", () => {
    expect(eventMatchesBinding(keyEvent("Enter"), null)).toBe(false);
  });
});

describe("normalizeKeyboardShortcutBindings", () => {
  it("uses defaults when raw is empty", () => {
    const resolved = normalizeKeyboardShortcutBindings({});
    expect(resolved.togglePlayPause).toEqual({ key: "p" });
  });

  it("allows disabling an action", () => {
    const resolved = normalizeKeyboardShortcutBindings({
      togglePlayPause: null,
    });
    expect(resolved.togglePlayPause).toBe(null);
    expect(resolved.volumeDown).toEqual({ key: "ArrowLeft" });
  });
});

describe("findDuplicateBindings", () => {
  it("detects two actions sharing the same binding", () => {
    const bindings = defaultKeyboardShortcutBindings();
    bindings.volumeUp = { key: "ArrowLeft" };
    bindings.volumeDown = { key: "ArrowLeft" };
    const dupes = findDuplicateBindings(bindings);
    expect(dupes.size).toBe(1);
    expect(dupes.get("←")?.sort()).toEqual(["volumeDown", "volumeUp"].sort());
  });
});

describe("formatBindingLabel", () => {
  it("formats modifiers and arrow keys", () => {
    expect(
      formatBindingLabel({ key: "ArrowUp", ctrl: true, shift: true }),
    ).toBe("Ctrl+Shift+↑");
  });
});

describe("bindingsEqual", () => {
  it("treats letter case as equivalent", () => {
    expect(bindingsEqual({ key: "p" }, { key: "P" })).toBe(true);
  });
});
