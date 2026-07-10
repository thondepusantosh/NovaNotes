import { DEFAULT_THEME } from "./themes.js";

const KEY = "nova:settings";

const DEFAULTS = {
  theme: DEFAULT_THEME,
  fontSize: "md", // sm | md | lg
  sidebarWidth: "md", // sm | md | lg
  reduceMotion: false,
};

export function loadSettings() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveSettings(settings) {
  localStorage.setItem(KEY, JSON.stringify(settings));
}
