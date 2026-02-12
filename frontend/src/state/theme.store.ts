import { StorageKey } from "@shared/enums/storage.enums";
import { ThemeMode } from "@shared/enums/theme.enums";
import { storage } from "@/platform/storage/storage";

let currentTheme: ThemeMode = ThemeMode.LIGHT;

function isThemeMode(value: string | null): value is ThemeMode {
  return value !== null && (value === ThemeMode.LIGHT || value === ThemeMode.DARK);
}

function applyTheme(theme: ThemeMode): void {
  document.documentElement.setAttribute("data-theme", theme);
}

function loadPersistedTheme(): ThemeMode {
  const value = storage.get<string>(StorageKey.THEME);
  return isThemeMode(value) ? value : ThemeMode.LIGHT;
}

if (typeof window !== "undefined") {
  currentTheme = loadPersistedTheme();
  applyTheme(currentTheme);
}

/**
 * @summary Reads the currently active application theme.
 * @returns Active theme mode.
 */
export function getTheme(): ThemeMode {
  return currentTheme;
}

/**
 * @summary Applies and persists a new application theme.
 * @param theme Target theme mode.
 * @returns No return value.
 */
export function setTheme(theme: ThemeMode): void {
  currentTheme = theme;
  applyTheme(theme);
  storage.set<string>(StorageKey.THEME, theme);
}

/**
 * @summary Toggles between light and dark (dracula) themes.
 * @returns No return value.
 */
export function toggleTheme(): void {
  const nextTheme = currentTheme === ThemeMode.LIGHT ? ThemeMode.DARK : ThemeMode.LIGHT;
  setTheme(nextTheme);
}
