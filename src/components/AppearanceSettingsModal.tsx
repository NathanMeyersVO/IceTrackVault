import { useEffect } from "react";

import {
  getSchemesByMode,
  type ColorScheme,
  type ColorSchemeMode,
} from "../lib/colorSchemes";
import {
  DEFAULT_BRIGHTNESS,
  DEFAULT_CONTRAST,
} from "../lib/appearanceAdjust";
import { useAppearance } from "../hooks/useAppearance";

interface AppearanceSettingsModalProps {
  onClose: () => void;
}

function ThemeCard({
  scheme,
  selected,
  selectedAccent,
  onSelect,
}: {
  scheme: ColorScheme;
  selected: boolean;
  selectedAccent: string;
  onSelect: () => void;
}) {
  const { colors } = scheme;

  return (
    <button
      type="button"
      onClick={onSelect}
      className="rounded-lg border-2 p-3 text-left transition-shadow hover:shadow-md"
      style={{
        backgroundColor: colors.surface,
        borderColor: selected ? selectedAccent : colors.border,
        boxShadow: selected ? `0 0 0 1px ${selectedAccent}` : undefined,
      }}
    >
      <div className="mb-2 flex gap-1">
        {[
          colors.background,
          colors.surface,
          colors.accent,
          colors.playingText,
          colors.waveformProgress,
        ].map((color) => (
          <span
            key={color}
            className="h-5 flex-1 rounded-sm"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      <div className="text-sm font-medium" style={{ color: colors.foreground }}>
        {scheme.name}
        {selected ? " ✓" : ""}
      </div>
      <div
        className="mt-0.5 text-xs leading-snug"
        style={{ color: colors.muted }}
      >
        {scheme.description}
      </div>
    </button>
  );
}

function ThemeSection({
  mode,
  label,
  themeId,
  selectedAccent,
  onSelect,
  labelColor,
}: {
  mode: ColorSchemeMode;
  label: string;
  themeId: string;
  selectedAccent: string;
  onSelect: (id: string) => void;
  labelColor: string;
}) {
  const schemes = getSchemesByMode(mode);

  return (
    <section className="mb-4 last:mb-0">
      <h3
        className="mb-2 text-xs font-medium uppercase tracking-wide"
        style={{ color: labelColor }}
      >
        {label}
      </h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {schemes.map((scheme) => (
          <ThemeCard
            key={scheme.id}
            scheme={scheme}
            selected={themeId === scheme.id}
            selectedAccent={selectedAccent}
            onSelect={() => onSelect(scheme.id)}
          />
        ))}
      </div>
    </section>
  );
}

function AdjustmentSlider({
  label,
  value,
  onChange,
  mutedColor,
  foregroundColor,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  mutedColor: string;
  foregroundColor: string;
}) {
  return (
    <label
      className="flex items-center gap-2 text-xs"
      style={{ color: mutedColor }}
    >
      <span className="w-20 shrink-0">{label}</span>
      <input
        type="range"
        min={50}
        max={150}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-1 min-w-0 flex-1 cursor-pointer accent-accent"
        aria-label={label}
        title={`${label} ${value}%`}
      />
      <span
        className="w-10 shrink-0 tabular-nums text-right"
        style={{ color: foregroundColor }}
      >
        {value}%
      </span>
    </label>
  );
}

export function AppearanceSettingsModal({ onClose }: AppearanceSettingsModalProps) {
  const {
    themeId,
    brightness,
    contrast,
    settings,
    selectTheme,
    setBrightness,
    setContrast,
    resetAdjustments,
  } = useAppearance();
  const adjustmentsDefault =
    brightness === DEFAULT_BRIGHTNESS && contrast === DEFAULT_CONTRAST;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-lg border shadow-xl"
        style={{
          backgroundColor: settings.surface,
          borderColor: settings.border,
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="appearance-dialog-title"
      >
        <div
          className="border-b px-4 py-3"
          style={{ borderColor: settings.border }}
        >
          <h2
            id="appearance-dialog-title"
            className="text-sm font-semibold"
            style={{ color: settings.foreground }}
          >
            Color scheme
          </h2>
          <p className="mt-1 text-xs" style={{ color: settings.muted }}>
            Choose a curated theme. Brightness and contrast apply globally on top of
            the selected scheme.
          </p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          <section className="mb-4 border-b pb-4" style={{ borderColor: settings.border }}>
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3
                className="text-xs font-medium uppercase tracking-wide"
                style={{ color: settings.muted }}
              >
                Adjustments
              </h3>
              {!adjustmentsDefault ? (
                <button
                  type="button"
                  onClick={resetAdjustments}
                  className="text-xs underline-offset-2 hover:underline"
                  style={{ color: settings.accent }}
                >
                  Reset
                </button>
              ) : null}
            </div>
            <div className="flex flex-col gap-2">
              <AdjustmentSlider
                label="Brightness"
                value={brightness}
                onChange={setBrightness}
                mutedColor={settings.muted}
                foregroundColor={settings.foreground}
              />
              <AdjustmentSlider
                label="Contrast"
                value={contrast}
                onChange={setContrast}
                mutedColor={settings.muted}
                foregroundColor={settings.foreground}
              />
            </div>
          </section>
          <ThemeSection
            mode="dark"
            label="Dark"
            themeId={themeId}
            selectedAccent={settings.accent}
            onSelect={selectTheme}
            labelColor={settings.muted}
          />
          <ThemeSection
            mode="light"
            label="Light"
            themeId={themeId}
            selectedAccent={settings.accent}
            onSelect={selectTheme}
            labelColor={settings.muted}
          />
        </div>
        <div
          className="flex justify-end border-t px-4 py-3"
          style={{ borderColor: settings.border }}
        >
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-1.5 text-sm"
            style={{
              backgroundColor: settings.surfaceHover,
              color: settings.foreground,
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
