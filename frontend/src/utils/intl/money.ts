import { Currency, Language } from "@shared/enums/user.enums";
import { getCachedNumberFormatter } from "@/utils/intl/cache";

interface ParsedCanonicalNumber {
    readonly isNegative: boolean;
    readonly integerPart: string;
    readonly fractionPart: string;
}

export interface FormatMoneyInput {
    readonly locale: Language;
    readonly currency: Currency;
    readonly options?: Omit<Intl.NumberFormatOptions, "style" | "currency">;
}

const CANONICAL_NUMBER_PATTERN = /^-?\d+(?:\.\d+)?$/;

/**
 * @summary Parses canonical decimal strings into sign, integer, and fraction parts.
 */
function parseCanonicalNumber(value: string): ParsedCanonicalNumber | null {
    const normalizedValue = value.trim();
    if (!CANONICAL_NUMBER_PATTERN.test(normalizedValue)) {
        return null;
    }

    const isNegative = normalizedValue.startsWith("-");
    const unsignedValue = isNegative ? normalizedValue.slice(1) : normalizedValue;
    const [integerPart, fractionPart = ""] = unsignedValue.split(".");

    return {
        isNegative,
        integerPart,
        fractionPart,
    };
}

/**
 * @summary Resolves the locale decimal separator using Intl format parts.
 */
function resolveDecimalSeparator(locale: Language): string {
    const parts = getCachedNumberFormatter(locale, {
        style: "decimal",
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    }).formatToParts(1.1);

    return parts.find((part) => part.type === "decimal")?.value ?? ".";
}

/**
 * @summary Resolves minimum fraction digits from options or currency defaults.
 */
function getDefaultMinimumFractionDigits(
    locale: Language,
    currency: Currency,
    options: Omit<Intl.NumberFormatOptions, "style" | "currency"> | undefined
): number {
    const configuredMinimumFractionDigits = options?.minimumFractionDigits;
    if (typeof configuredMinimumFractionDigits === "number") {
        return configuredMinimumFractionDigits;
    }

    return getCachedNumberFormatter(locale, {
        style: "currency",
        currency,
        ...options,
    }).resolvedOptions().minimumFractionDigits ?? 0;
}

/**
 * @summary Pads or preserves fractional digits according to minimum fraction requirements.
 */
function buildFractionPart(fractionPart: string, minimumFractionDigits: number): string {
    if (fractionPart.length === 0 && minimumFractionDigits === 0) {
        return "";
    }

    if (fractionPart.length >= minimumFractionDigits) {
        return fractionPart;
    }

    return fractionPart.padEnd(minimumFractionDigits, "0");
}

/**
 * @summary Formats only the integer/currency scaffold used for safe fraction injection.
 */
function formatCurrencyIntegerParts(
    parsedValue: ParsedCanonicalNumber,
    input: FormatMoneyInput
): Intl.NumberFormatPart[] {
    const integerAsBigInt = BigInt(parsedValue.integerPart);
    const signedInteger = parsedValue.isNegative ? -integerAsBigInt : integerAsBigInt;
    const restOptions: Intl.NumberFormatOptions = { ...(input.options ?? {}) };
    delete restOptions.minimumFractionDigits;
    delete restOptions.maximumFractionDigits;

    return getCachedNumberFormatter(input.locale, {
        style: "currency",
        currency: input.currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        ...restOptions,
    }).formatToParts(signedInteger);
}

/**
 * @summary Injects the computed fractional part into localized currency parts.
 */
function injectFractionPart(
    parts: readonly Intl.NumberFormatPart[],
    fractionPart: string,
    decimalSeparator: string
): string {
    if (fractionPart.length === 0) {
        return parts.map((part) => part.value).join("");
    }

    const lastNumericPartIndex = parts.reduce((lastIndex, part, index) => {
        return part.type === "integer" || part.type === "group" ? index : lastIndex;
    }, -1);

    if (lastNumericPartIndex === -1) {
        return parts.map((part) => part.value).join("");
    }

    return parts
        .map((part, index) =>
            index === lastNumericPartIndex
                ? `${part.value}${decimalSeparator}${fractionPart}`
                : part.value
        )
        .join("");
}

/**
 * @summary Formats canonical decimal strings as localized money values without float parsing.
 * @param value Canonical decimal string (e.g. "1234.56").
 * @param input Locale/currency context and optional Intl overrides.
 * @returns Localized currency string or empty output for invalid input.
 */
export function formatMoney(value: string, input: FormatMoneyInput): string {
    const parsedValue = parseCanonicalNumber(value);
    if (parsedValue === null) {
        return "";
    }

    const minimumFractionDigits = getDefaultMinimumFractionDigits(
        input.locale,
        input.currency,
        input.options
    );
    const formattedFractionPart = buildFractionPart(
        parsedValue.fractionPart,
        minimumFractionDigits
    );
    const decimalSeparator = resolveDecimalSeparator(input.locale);
    const currencyIntegerParts = formatCurrencyIntegerParts(parsedValue, input);

    return injectFractionPart(currencyIntegerParts, formattedFractionPart, decimalSeparator);
}
