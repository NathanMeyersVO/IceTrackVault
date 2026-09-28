import { describe, expect, it } from "vitest";

import type { AppearanceSettings } from "./appearance";
import {
  adjustAppearanceSettings,
  adjustHexColor,
  clampAdjustment,
  DEFAULT_BRIGHTNESS,
  DEFAULT_CONTRAST,
} from "./appearanceAdjust";

const sample: AppearanceSettings = {
  background: "#0a0a0a",
  surface: "#171717",
  surfaceHover: "#262626",
  border: "#262626",
  foreground: "#f5f5f5",
  muted: "#a3a3a3",
  accent: "#2563eb",
  accentHover: "#3b82f6",
  accentSubtle: "#172554",
  dropIndicator: "#38bdf8",
  playingText: "#93c5fd",
  cursorBackground: "#262626",
  cursorBackgroundPlaying: "#1e3a5f",
  waveformWave: "#525252",
  waveformProgress: "#60a5fa",
  waveformCursor: "#ffffff",
};

describe("clampAdjustment", () => {
  it("clamps to 50–150", () => {
    expect(clampAdjustment(40)).toBe(50);
    expect(clampAdjustment(160)).toBe(150);
    expect(clampAdjustment(100.4)).toBe(100);
  });
});

describe("adjustHexColor", () => {
  it("returns unchanged at defaults", () => {
    expect(adjustHexColor("#2563eb", DEFAULT_BRIGHTNESS, DEFAULT_CONTRAST)).toBe(
      "#2563eb",
    );
  });

  it("lightens with brightness above 100", () => {
    const lighter = adjustHexColor("#808080", 120, DEFAULT_CONTRAST);
    expect(lighter).not.toBe("#808080");
    const [, , lBase] = hexToLightness("#808080");
    const [, , lAdj] = hexToLightness(lighter);
    expect(lAdj).toBeGreaterThan(lBase);
  });

  it("increases separation with contrast above 100", () => {
    const dark = adjustHexColor("#333333", DEFAULT_BRIGHTNESS, 130);
    const light = adjustHexColor("#cccccc", DEFAULT_BRIGHTNESS, 130);
    const [, , lDark] = hexToLightness(dark);
    const [, , lLight] = hexToLightness(light);
    const [, , lDarkBase] = hexToLightness("#333333");
    const [, , lLightBase] = hexToLightness("#cccccc");
    expect(lDark).toBeLessThan(lDarkBase);
    expect(lLight).toBeGreaterThan(lLightBase);
  });
});

describe("adjustAppearanceSettings", () => {
  it("returns the same object reference at defaults", () => {
    expect(adjustAppearanceSettings(sample, 100, 100)).toBe(sample);
  });

  it("adjusts every key", () => {
    const adjusted = adjustAppearanceSettings(sample, 110, 110);
    for (const key of Object.keys(sample) as (keyof AppearanceSettings)[]) {
      expect(adjusted[key]).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});

function hexToLightness(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  const s = max === min ? 0 : l > 0.5 ? d / (2 - max - min) : d / (max + min);
  return [0, s, l];
}
