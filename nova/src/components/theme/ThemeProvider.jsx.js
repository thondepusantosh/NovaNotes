import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loadSettings, saveSettings } from "../../lib/settings.js";

const FONT_SIZE_PX = { sm: "14px", md: "16px", lg: "18px" };
const SIDEBAR_PX = { sm: "220px", md: "272px", lg: "320px" };

const SettingsContext = createContext(null);

export function ThemeProvider({ children }) {
  const [settings, setSettings] = useState(() => loadSettings());
  const [systemReduceMotion, setSystemReduceMotion] = useState(
    () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false
  );

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e) => setSystemReduceMotion(e.matches);
    mql.addEventListener?.("change", onChange);
    return () => mql.removeEventListener?.("change", onChange);
  }, []);

  useEffect(() => {
    saveSettings(settings);
    const root = document.documentElement;
    root.setAttribute("data-theme", settings.theme);
    root.style.setProperty("--user-font-size", FONT_SIZE_PX[settings.fontSize]);
    root.style.setProperty("--user-sidebar-width", SIDEBAR_PX[settings.sidebarWidth]);
    root.setAttribute(
      "data-reduce-motion",
      String(settings.reduceMotion || systemReduceMotion)
    );
  }, [settings, systemReduceMotion]);

  const value = useMemo(
    () => ({
      theme: settings.theme,
      setTheme: (theme) => setSettings((s) => ({ ...s, theme })),
      fontSize: settings.fontSize,
      setFontSize: (fontSize) => setSettings((s) => ({ ...s, fontSize })),
      sidebarWidth: settings.sidebarWidth,
      setSidebarWidth: (sidebarWidth) => setSettings((s) => ({ ...s, sidebarWidth })),
      reduceMotion: settings.reduceMotion || systemReduceMotion,
      setReduceMotion: (reduceMotion) => setSettings((s) => ({ ...s, reduceMotion })),
    }),
    [settings, systemReduceMotion]
  );

  return React.createElement(SettingsContext.Provider, { value }, children);
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within ThemeProvider");
  return ctx;
}
