import { Language } from "@shared/enums/language.enums";

type NumberFormatterOptions = Intl.NumberFormatOptions | undefined;
type DateFormatterOptions = Intl.DateTimeFormatOptions | undefined;

const numberFormatterCache = new Map<string, Intl.NumberFormat>();
const dateFormatterCache = new Map<string, Intl.DateTimeFormat>();


function createOptionsCacheKey(
    options: Intl.NumberFormatOptions | Intl.DateTimeFormatOptions | undefined
): string {
    if (!options) {
        return "";
    }

    const sortedEntries = Object.entries(options as Record<string, unknown>).sort(
        ([leftKey], [rightKey]) => leftKey.localeCompare(rightKey)
    );
    return JSON.stringify(sortedEntries);
}


function createFormatterKey(
    locale: Language,
    options: Intl.NumberFormatOptions | Intl.DateTimeFormatOptions | undefined
): string {
    return `${locale}::${createOptionsCacheKey(options)}`;
}

/**
 * @summary Returns a cached Intl.NumberFormat instance for the requested locale and options.
 * @param locale Language enum used as locale.
 * @param options Optional Intl number format options.
 * @returns Cached or newly created number formatter.
 */

export function getCachedNumberFormatter(
    locale: Language,
    options?: NumberFormatterOptions
): Intl.NumberFormat {
    const key = createFormatterKey(locale, options);
    const cachedFormatter = numberFormatterCache.get(key);
    if (cachedFormatter !== undefined) {
        return cachedFormatter;
    }

    const formatter = new Intl.NumberFormat(locale, options);
    numberFormatterCache.set(key, formatter);
    return formatter;
}

/**
 * @summary Returns a cached Intl.DateTimeFormat instance for the requested locale and options.
 * @param locale Language enum used as locale.
 * @param options Optional Intl date format options.
 * @returns Cached or newly created date formatter.
 */

export function getCachedDateFormatter(
    locale: Language,
    options?: DateFormatterOptions
): Intl.DateTimeFormat {
    const key = createFormatterKey(locale, options);
    const cachedFormatter = dateFormatterCache.get(key);
    if (cachedFormatter !== undefined) {
        return cachedFormatter;
    }

    const formatter = new Intl.DateTimeFormat(locale, options);
    dateFormatterCache.set(key, formatter);
    return formatter;
}
