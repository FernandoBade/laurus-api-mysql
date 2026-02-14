import { StorageKey } from "@shared/enums/storage.enums";
import { ThemeMode } from "@shared/enums/theme.enums";
import { storage } from "@/platform/storage/storage";

let currentTheme: ThemeMode = ThemeMode.LIGHT;
let initialized = false;

function isThemeMode(value: string | null): value is ThemeMode {
    return value === ThemeMode.LIGHT || value === ThemeMode.DARK;
}

function applyTheme(theme: ThemeMode): void {
    document.documentElement.setAttribute("data-theme", theme);
}

function loadPersistedTheme(): ThemeMode {
    const value = storage.get<string>(StorageKey.THEME);
    return isThemeMode(value) ? value : ThemeMode.LIGHT;
}

/**
 * @summary Initializes theme state from persisted storage and applies it to the document root.
 * @returns No return value.
 */
export function initializeThemeStore(): void {
    if (initialized || typeof window === "undefined") {
        return;
    }

    currentTheme = loadPersistedTheme();
    applyTheme(currentTheme);
    initialized = true;
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
 * @summary Toggles between light and dark themes.
 * @returns No return value.
 */
export function toggleTheme(): void {
    const nextTheme = currentTheme === ThemeMode.LIGHT ? ThemeMode.DARK : ThemeMode.LIGHT;
    setTheme(nextTheme);
}
