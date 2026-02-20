import { StorageKey } from "@shared/enums/storage.enums";
import { Currency, Language } from "@shared/enums/user.enums";
import { storage } from "@/platform/storage/storage";

const DEFAULT_LANGUAGE = Language.PT_BR;
const DEFAULT_CURRENCY = Currency.USD;

type UserPreferencesListener = (state: UserPreferencesState) => void;

export interface UserPreferencesState {
    readonly language: Language;
    readonly currency: Currency;
}

const listeners = new Set<UserPreferencesListener>();

let initialized = false;
let state: UserPreferencesState = {
    language: DEFAULT_LANGUAGE,
    currency: DEFAULT_CURRENCY,
};

function isLanguage(value: unknown): value is Language {
    return value === Language.EN_US || value === Language.ES_ES || value === Language.PT_BR;
}

function isCurrency(value: unknown): value is Currency {
    return (
        value === Currency.ARS
        || value === Currency.BRL
        || value === Currency.COP
        || value === Currency.EUR
        || value === Currency.USD
    );
}

function resolveLanguageFromLocaleTag(locale: string): Language {
    const normalized = locale.trim().toLowerCase();

    if (normalized === Language.EN_US.toLowerCase()) {
        return Language.EN_US;
    }
    if (normalized === Language.ES_ES.toLowerCase()) {
        return Language.ES_ES;
    }
    if (normalized === Language.PT_BR.toLowerCase()) {
        return Language.PT_BR;
    }

    const primarySubtag = normalized.split("-")[0];
    if (primarySubtag === "en") {
        return Language.EN_US;
    }
    if (primarySubtag === "es") {
        return Language.ES_ES;
    }
    if (primarySubtag === "pt") {
        return Language.PT_BR;
    }

    return DEFAULT_LANGUAGE;
}

function resolveBrowserLanguage(): Language {
    if (typeof navigator === "undefined") {
        return DEFAULT_LANGUAGE;
    }

    return resolveLanguageFromLocaleTag(navigator.language);
}

function isUserPreferencesState(value: unknown): value is UserPreferencesState {
    if (typeof value !== "object" || value === null) {
        return false;
    }

    const candidate = value as Partial<UserPreferencesState>;
    return isLanguage(candidate.language) && isCurrency(candidate.currency);
}

function applyLanguageToDocument(language: Language): void {
    if (typeof document === "undefined") {
        return;
    }

    document.documentElement.setAttribute("lang", language);
}

function notifyListeners(): void {
    const snapshot = getUserPreferences();
    listeners.forEach((listener) => listener(snapshot));
}

function loadPersistedPreferences(): UserPreferencesState | null {
    const persisted = storage.get<unknown>(StorageKey.USER_PREFERENCES);
    if (!isUserPreferencesState(persisted)) {
        return null;
    }

    return persisted;
}

function persistPreferences(): void {
    storage.set<UserPreferencesState>(StorageKey.USER_PREFERENCES, state);
}

/**
 * @summary Initializes user preferences using storage cache and browser locale defaults.
 * @returns No return value.
 */
export function initializeUserPreferencesStore(): void {
    if (initialized) {
        return;
    }

    const persisted = loadPersistedPreferences();
    if (persisted !== null) {
        state = persisted;
    } else {
        state = {
            language: resolveBrowserLanguage(),
            currency: DEFAULT_CURRENCY,
        };
        persistPreferences();
    }

    applyLanguageToDocument(state.language);
    initialized = true;
}

/**
 * @summary Returns a snapshot of current user preferences.
 * @returns Immutable user preference values.
 */
export function getUserPreferences(): UserPreferencesState {
    return { ...state };
}

/**
 * @summary Returns current user language preference.
 * @returns Active language enum value.
 */
export function getUserLanguage(): Language {
    return state.language;
}

/**
 * @summary Returns current user currency preference.
 * @returns Active currency enum value.
 */
export function getUserCurrency(): Currency {
    return state.currency;
}

/**
 * @summary Applies a partial user preference update, persists it, and notifies subscribers.
 * @param patch Partial preference values to merge.
 * @returns No return value.
 */
export function setUserPreferences(patch: Partial<UserPreferencesState>): void {
    const nextState: UserPreferencesState = {
        language: patch.language ?? state.language,
        currency: patch.currency ?? state.currency,
    };

    if (nextState.language === state.language && nextState.currency === state.currency) {
        return;
    }

    state = nextState;
    applyLanguageToDocument(state.language);
    persistPreferences();
    notifyListeners();
}

/**
 * @summary Subscribes to preference updates.
 * @param listener Callback invoked with latest preference snapshot.
 * @returns Unsubscribe function.
 */
export function subscribeUserPreferences(listener: UserPreferencesListener): () => void {
    listeners.add(listener);
    listener(getUserPreferences());

    return (): void => {
        listeners.delete(listener);
    };
}
