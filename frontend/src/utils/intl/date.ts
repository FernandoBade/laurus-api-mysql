import { Language } from "@shared/enums/language.enums";

/**
 * @summary Formats a date value using Intl.DateTimeFormat and a locale-derived language.
 * @param value Date value as ISO string, Date instance, or timestamp.
 * @param language Language enum used as locale identifier.
 * @param options Optional Intl formatter options.
 * @returns Localized date string or empty string for invalid input.
 */
export function formatDateByLanguage(
    value: string | number | Date | null | undefined,
    language: Language,
    options?: Intl.DateTimeFormatOptions
): string {
    if (value === null || value === undefined) {
        return "";
    }

    const parsedDate = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
        return "";
    }

    return new Intl.DateTimeFormat(language, options).format(parsedDate);
}
