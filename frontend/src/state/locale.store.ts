import { Language } from "@shared/enums/language.enums";
import {
    getUserLanguage,
    setUserPreferences,
    subscribeUserPreferences,
} from "@/state/userPreferences.store";

type LocaleListener = (locale: Language) => void;

/**
 * @summary Reads the active locale used by i18n and API headers.
 * @returns Current locale code.
 */
export function getLocale(): Language {
    return getUserLanguage();
}

/**
 * @summary Updates the active locale preference.
 * @param locale Locale code to apply.
 * @returns No return value.
 */
export function setLocale(locale: Language): void {
    setUserPreferences({ language: locale });
}

/**
 * @summary Subscribes to locale updates emitted by user preferences state.
 * @param listener Callback called when locale changes.
 * @returns Unsubscribe function.
 */
export function subscribeLocale(listener: LocaleListener): () => void {
    return subscribeUserPreferences((state) => {
        listener(state.language);
    });
}
