import { Language } from "@shared/enums/language.enums";
import { getCachedDateFormatter } from "@/utils/intl/cache";

export interface FormatDateInput {
    readonly locale: Language;
    readonly options?: Intl.DateTimeFormatOptions;
}

/**
 * @summary Formats a date-like value using cached Intl.DateTimeFormat instances.
 * @param value Date value as Date instance, ISO string, or timestamp.
 * @param input Locale and optional date formatter options.
 * @returns Localized date string or empty output when value is invalid.
 */
export function formatDate(
    value: Date | string | number | null | undefined,
    input: FormatDateInput
): string {
    if (value === null || value === undefined) {
        return "";
    }

    const resolvedDate = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(resolvedDate.getTime())) {
        return "";
    }

    const formatter = getCachedDateFormatter(input.locale, input.options);
    return formatter.format(resolvedDate);
}
