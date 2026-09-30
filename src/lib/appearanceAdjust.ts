import type { AppearanceSettings } from "./appearance";

export const DEFAULT_BRIGHTNESS = 100;
export const DEFAULT_CONTRAST = 100;
export const MIN_ADJUSTMENT = 50;
export const MAX_ADJUSTMENT = 150;

export function clampAdjustment(value: number): number {
  return Math.min(MAX_ADJUSTMENT, Math.max(MIN_ADJUSTMENT, Math.round(value)));
}

function parseHex(hex: string): [number, number, number] {
  const normalized = hex.trim();
  if (!/^#[0-9a-fA-F]{6}$/.test(normalized)) {
    throw new Error(`Expected #RRGGBB hex color, got ${hex}`);
  }
  const r = parseInt(normalized.slice(1, 3), 16) / 255;
  const g = parseInt(normalized.slice(3, 5), 16) / 255;
  const b = parseInt(normalized.slice(5, 7), 16) / 255;
  return [r, g, b];
}

function formatHex(r: number, g: number, b: number): string {
  const toByte = (channel: number) =>
    Math.min(255, Math.max(0, Math.round(channel * 255)));
  const rr = toByte(r).toString(16).padStart(2, "0");
  const gg = toByte(g).toString(16).padStart(2, "0");
  const bb = toByte(b).toString(16).padStart(2, "0");
  return `#${rr}${gg}${bb}`;
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) {
    return [0, 0, l];
  }
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  switch (max) {
    case r:
      h = (g - b) / d + (g < b ? 6 : 0);
      break;
    case g:
      h = (b - r) / d + 2;
      break;
    default:
      h = (r - g) / d + 4;
      break;
  }
  h /= 6;
  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) {
    return [l, l, l];
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [hue2rgb(p, q, h + 1 / 3), hue2rgb(p, q, h), hue2rgb(p, q, h - 1 / 3)];
}

export function adjustHexColor(
  hex: string,
  brightness: number,
  contrast: number,
): string {
  const b = clampAdjustment(brightness);
  const c = clampAdjustment(contrast);
  if (b === DEFAULT_BRIGHTNESS && c === DEFAULT_CONTRAST) {
    return hex;
  }

  const [r, g, bChannel] = parseHex(hex);
  let [h, s, l] = rgbToHsl(r, g, bChannel);

  l *= b / DEFAULT_BRIGHTNESS;
  l = 0.5 + (l - 0.5) * (c / DEFAULT_CONTRAST);
  l = Math.min(1, Math.max(0, l));

  const [nr, ng, nb] = hslToRgb(h, s, l);
  return formatHex(nr, ng, nb);
}

export function adjustAppearanceSettings(
  base: AppearanceSettings,
  brightness: number,
  contrast: number,
): AppearanceSettings {
  const b = clampAdjustment(brightness);
  const c = clampAdjustment(contrast);
  if (b === DEFAULT_BRIGHTNESS && c === DEFAULT_CONTRAST) {
    return base;
  }

  const result = { ...base };
  for (const key of Object.keys(base) as (keyof AppearanceSettings)[]) {
    result[key] = adjustHexColor(base[key], b, c);
  }
  return result;
}
