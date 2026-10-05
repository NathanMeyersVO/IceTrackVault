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
  applyAppearance,
  type AppearanceSettings,
} from "../lib/appearance";
import {
  adjustAppearanceSettings,
  clampAdjustment,
  DEFAULT_BRIGHTNESS,
  DEFAULT_CONTRAST,
} from "../lib/appearanceAdjust";
import {
  DEFAULT_SCHEME_ID,
  getScheme,
  getSchemeColors,
  isValidSchemeId,
} from "../lib/colorSchemes";
import { api, type ThemeSettings } from "../lib/tauri";

interface AppearanceContextValue {
  themeId: string;
  brightness: number;
  contrast: number;
  settings: AppearanceSettings;
  loaded: boolean;
  selectTheme: (themeId: string) => void;
  setBrightness: (value: number) => void;
  setContrast: (value: number) => void;
  resetAdjustments: () => void;
}

const AppearanceContext = createContext<AppearanceContextValue | null>(null);

function resolveThemeId(raw: ThemeSettings): string {
  const themeId = raw.theme_id?.trim();
  return themeId && isValidSchemeId(themeId) ? themeId : DEFAULT_SCHEME_ID;
}

function resolveAdjustment(raw: number | undefined, fallback: number): number {
  if (raw == null || Number.isNaN(raw)) return fallback;
  return clampAdjustment(raw);
}

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState(DEFAULT_SCHEME_ID);
  const [brightness, setBrightnessState] = useState(DEFAULT_BRIGHTNESS);
  const [contrast, setContrastState] = useState(DEFAULT_CONTRAST);
  const [loaded, setLoaded] = useState(false);
  const themeIdRef = useRef(themeId);
  const brightnessRef = useRef(brightness);
  const contrastRef = useRef(contrast);
  const saveTimerRef = useRef<number | null>(null);

  themeIdRef.current = themeId;
  brightnessRef.current = brightness;
  contrastRef.current = contrast;

  const settings = useMemo(
    () =>
      adjustAppearanceSettings(getSchemeColors(themeId), brightness, contrast),
    [themeId, brightness, contrast],
  );

  useEffect(() => {
    applyAppearance(settings);
    document.documentElement.style.colorScheme =
      getScheme(themeId).mode === "light" ? "light" : "dark";
  }, [settings, themeId]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const raw = await api.getAppSettings();
        if (cancelled) return;
        const resolvedThemeId = resolveThemeId(raw);
        const resolvedBrightness = resolveAdjustment(
          raw.brightness,
          DEFAULT_BRIGHTNESS,
        );
        const resolvedContrast = resolveAdjustment(raw.contrast, DEFAULT_CONTRAST);
        setThemeId(resolvedThemeId);
        setBrightnessState(resolvedBrightness);
        setContrastState(resolvedContrast);
        themeIdRef.current = resolvedThemeId;
        brightnessRef.current = resolvedBrightness;
        contrastRef.current = resolvedContrast;
      } catch {
        applyAppearance(
          adjustAppearanceSettings(
            getSchemeColors(DEFAULT_SCHEME_ID),
            DEFAULT_BRIGHTNESS,
            DEFAULT_CONTRAST,
          ),
        );
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(() => {
    if (saveTimerRef.current != null) {
      window.clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = window.setTimeout(() => {
      void api
        .setAppSettings({
          theme_id: themeIdRef.current,
          brightness: brightnessRef.current,
          contrast: contrastRef.current,
        })
        .catch(() => {
          /* keep local theme even if save fails */
        });
    }, 300);
  }, []);

  const selectTheme = useCallback(
    (nextThemeId: string) => {
      if (!isValidSchemeId(nextThemeId)) return;
      setThemeId(nextThemeId);
      themeIdRef.current = nextThemeId;
      persist();
    },
    [persist],
  );

  const setBrightness = useCallback(
    (value: number) => {
      const next = clampAdjustment(value);
      setBrightnessState(next);
      brightnessRef.current = next;
      persist();
    },
    [persist],
  );

  const setContrast = useCallback(
    (value: number) => {
      const next = clampAdjustment(value);
      setContrastState(next);
      contrastRef.current = next;
      persist();
    },
    [persist],
  );

  const resetAdjustments = useCallback(() => {
    setBrightnessState(DEFAULT_BRIGHTNESS);
    setContrastState(DEFAULT_CONTRAST);
    brightnessRef.current = DEFAULT_BRIGHTNESS;
    contrastRef.current = DEFAULT_CONTRAST;
    persist();
  }, [persist]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current != null) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  const value = useMemo(
    () => ({
      themeId,
      brightness,
      contrast,
      settings,
      loaded,
      selectTheme,
      setBrightness,
      setContrast,
      resetAdjustments,
    }),
    [
      themeId,
      brightness,
      contrast,
      settings,
      loaded,
      selectTheme,
      setBrightness,
      setContrast,
      resetAdjustments,
    ],
  );

  return (
    <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>
  );
}

export function useAppearance(): AppearanceContextValue {
  const context = useContext(AppearanceContext);
  if (!context) {
    throw new Error("useAppearance must be used within AppearanceProvider");
  }
  return context;
}

export { getScheme };
