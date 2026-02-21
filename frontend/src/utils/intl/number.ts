import { Language } from "@shared/enums/language.enums";
import { getCachedNumberFormatter } from "@/utils/intl/cache";

export interface FormatNumberInput {
    readonly locale: Language;
    readonly options?: Intl.NumberFormatOptions;
}

/**
 * @summary Formats numeric values using locale-specific grouping and fraction rules.
 * @param value Number or bigint value to format.
 * @param input Locale and optional Intl number format options.
 * @returns Localized numeric output.
 */

export function formatNumber(value: number | bigint, input: FormatNumberInput): string {
    const formatter = getCachedNumberFormatter(input.locale, input.options);
    return formatter.format(value);
}
