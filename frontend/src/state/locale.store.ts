import { Language } from "@shared/enums/language.enums";
import {
    getUserLocale,
    setUserPreferences,
    subscribeUserPreferences,
} from "@/state/userPreferences.store";

type LocaleListener = (locale: Language) => void;

/**
 * @summary Returns the active locale used by the translation layer.
 * @returns Current locale code.
 */

export function getLocale(): Language {
    return getUserLocale();
}

/**
 * @summary Updates the active locale and notifies locale subscribers.
 * @param locale Locale code to apply.
 * @returns No return value.
 */

export function setLocale(locale: Language): void {
    setUserPreferences({ language: locale });
}

/**
 * @summary Subscribes to locale changes emitted by the locale store.
 * @param listener Callback called when locale changes.
 * @returns Unsubscribe function.
 */

export function subscribeLocale(listener: LocaleListener): () => void {
    return subscribeUserPreferences((state) => {
        listener(state.language);
    });
}
