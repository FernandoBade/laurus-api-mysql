import { Language } from "@shared/domains/user/user.enums";

const SUPPORTED_LOCALES: readonly Language[] = [Language.EN_US, Language.ES_ES, Language.PT_BR];

function resolveInitialLocale(): Language {
    if (typeof navigator === "undefined") {
        return Language.EN_US;
    }

    const browserLocale = navigator.language;
    const resolved = SUPPORTED_LOCALES.find((locale) => locale === browserLocale);
    return resolved ?? Language.EN_US;
}

let currentLocale: Language = resolveInitialLocale();

/**
 * @summary Reads the active locale used in API Accept-Language headers.
 * @returns Current locale code.
 */
export function getLocale(): Language {
    return currentLocale;
}

/**
 * @summary Updates the active locale value.
 * @param locale Locale code to apply.
 * @returns No return value.
 */
export function setLocale(locale: Language): void {
    currentLocale = locale;
}
