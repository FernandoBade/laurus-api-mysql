import { StorageKey } from "@shared/enums/storage.enums";
import { Theme } from "@shared/enums/theme.enums";
import { storage } from "@/platform/storage/storage";

let currentTheme: Theme = Theme.LIGHT;
let initialized = false;


function isTheme(value: string | null): value is Theme {
    return value === Theme.LIGHT || value === Theme.DARK;
}


function applyTheme(theme: Theme): void {
    document.documentElement.setAttribute("data-theme", theme);
}


function loadPersistedTheme(): Theme {
    const value = storage.get<string>(StorageKey.THEME);
    return isTheme(value) ? value : Theme.LIGHT;
}

/**
 * @summary Loads persisted theme and applies it to the document root.
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
 * @summary Returns the current UI theme from store state.
 * @returns Active theme mode.
 */

export function getTheme(): Theme {
    return currentTheme;
}

/**
 * @summary Persists and applies the requested UI theme.
 * @param theme Target theme mode.
 * @returns No return value.
 */

export function setTheme(theme: Theme): void {
    currentTheme = theme;
    applyTheme(theme);
    storage.set<string>(StorageKey.THEME, theme);
}

/**
 * @summary Switches between light and dark theme values.
 * @returns No return value.
 */

export function toggleTheme(): void {
    const nextTheme = currentTheme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT;
    setTheme(nextTheme);
}
