import { NumericInputValidationError } from "@shared/enums/input-validation.enums";
import { Language } from "@shared/enums/language.enums";
import { getCachedNumberFormatter } from "@/utils/intl/cache";

const CANONICAL_DECIMAL_PATTERN = /^-?\d+(?:\.\d+)?$/;
const DEFAULT_MAX_FRACTION_DIGITS = 12;
const MAX_ALLOWED_FRACTION_DIGITS = 20;

type DecimalSeparator = "." | ",";

interface CanonicalDecimalParts {
    readonly isNegative: boolean;
    readonly integerPart: string;
    readonly fractionPart: string;
}

export interface DecimalValidationRules {
    readonly required?: boolean;
    readonly min?: string;
    readonly max?: string;
    readonly greaterThanZero?: boolean;
}

export interface ParseLocaleDecimalOptions {
    readonly maxFractionDigits?: number;
}

export interface LocaleDecimalDraft {
    readonly displayValue: string;
    readonly canonicalValue: string | null;
    readonly hasDigits: boolean;
    readonly hasTrailingDecimalSeparator: boolean;
}

export interface FormatCanonicalDecimalOptions {
    readonly minimumFractionDigits?: number;
    readonly maximumFractionDigits?: number;
}

/**
 * @summary Normalizes integer part.
 */
function normalizeIntegerPart(value: string): string {
    const trimmed = value.replace(/^0+(?=\d)/, "");
    return trimmed.length > 0 ? trimmed : "0";
}

/**
 * @summary Clamps fraction digits.
 */
function clampFractionDigits(value: number | undefined, fallback: number): number {
    if (typeof value !== "number" || Number.isNaN(value) || value < 0) {
        return fallback;
    }

    return Math.min(Math.trunc(value), MAX_ALLOWED_FRACTION_DIGITS);
}

/**
 * @summary Parses canonical decimal parts.
 */
function parseCanonicalDecimalParts(value: string): CanonicalDecimalParts | null {
    const trimmedValue = value.trim();
    if (!CANONICAL_DECIMAL_PATTERN.test(trimmedValue)) {
        return null;
    }

    const isNegative = trimmedValue.startsWith("-");
    const unsignedValue = isNegative ? trimmedValue.slice(1) : trimmedValue;
    const [integerPartRaw, fractionPart = ""] = unsignedValue.split(".");
    const integerPart = normalizeIntegerPart(integerPartRaw);
    const fractionIsZero = fractionPart.length > 0 && /^0+$/.test(fractionPart);
    const shouldKeepNegative = isNegative && !(integerPart === "0" && fractionPart.length === 0)
        && !(integerPart === "0" && fractionIsZero);

    return {
        isNegative: shouldKeepNegative,
        integerPart,
        fractionPart,
    };
}

/**
 * @summary Normalizes canonical with fraction digits.
 */
function normalizeCanonicalWithFractionDigits(
    canonicalValue: string,
    fractionDigits: number
): string | null {
    const parsedValue = parseCanonicalDecimalParts(canonicalValue);
    if (parsedValue === null) {
        return null;
    }

    const normalizedFractionDigits = clampFractionDigits(fractionDigits, 0);
    const normalizedFraction = parsedValue.fractionPart
        .slice(0, normalizedFractionDigits)
        .padEnd(normalizedFractionDigits, "0");
    const signPrefix = parsedValue.isNegative ? "-" : "";

    if (normalizedFractionDigits === 0) {
        return `${signPrefix}${parsedValue.integerPart}`;
    }

    return `${signPrefix}${parsedValue.integerPart}.${normalizedFraction}`;
}

/**
 * @summary Resolves the decimal separator for a locale used by numeric masks.
 * @param locale Locale used to parse user input.
 * @returns Locale decimal separator token (`.` or `,`).
 */
export function getLocaleDecimalSeparator(locale: Language): DecimalSeparator {
    if (locale === Language.PT_BR || locale === Language.ES_ES) {
        return ",";
    }

    return ".";
}

/**
 * @summary Parses a locale-formatted decimal string into sanitized display and canonical values.
 * @param input Raw typed input value.
 * @param locale Active locale for decimal separator behavior.
 * @param options Parser options with fraction truncation.
 * @returns Sanitized draft payload.
 */
export function parseLocaleDecimalDraft(
    input: string,
    locale: Language,
    options: ParseLocaleDecimalOptions = {}
): LocaleDecimalDraft {
    const decimalSeparator = getLocaleDecimalSeparator(locale);
    const groupSeparator: DecimalSeparator = decimalSeparator === "." ? "," : ".";
    const maxFractionDigits = clampFractionDigits(
        options.maxFractionDigits,
        DEFAULT_MAX_FRACTION_DIGITS
    );

    let integerDigits = "";
    let fractionDigits = "";
    let hasDecimalSeparator = false;
    let hasTrailingDecimalSeparator = false;

    for (const character of input) {
        if (character >= "0" && character <= "9") {
            if (hasDecimalSeparator) {
                if (fractionDigits.length < maxFractionDigits) {
                    fractionDigits += character;
                }
            } else {
                integerDigits += character;
            }
            hasTrailingDecimalSeparator = false;
            continue;
        }

        if (character === decimalSeparator) {
            if (!hasDecimalSeparator) {
                hasDecimalSeparator = true;
                hasTrailingDecimalSeparator = true;
            }
            continue;
        }

        if (
            character === groupSeparator
            || character === " "
            || character === "\u00A0"
            || character === "\u202F"
            || character === "\t"
            || character === "\n"
            || character === "\r"
        ) {
            continue;
        }
    }

    const hasDigits = integerDigits.length > 0 || fractionDigits.length > 0;
    if (!hasDigits && !hasDecimalSeparator) {
        return {
            displayValue: "",
            canonicalValue: null,
            hasDigits: false,
            hasTrailingDecimalSeparator: false,
        };
    }

    const normalizedInteger = normalizeIntegerPart(integerDigits.length > 0 ? integerDigits : "0");
    const displayValue = hasDecimalSeparator
        ? `${normalizedInteger}${decimalSeparator}${fractionDigits}`
        : normalizedInteger;

    if (!hasDigits) {
        return {
            displayValue,
            canonicalValue: null,
            hasDigits: false,
            hasTrailingDecimalSeparator,
        };
    }

    const canonicalValue = fractionDigits.length > 0
        ? `${normalizedInteger}.${fractionDigits}`
        : normalizedInteger;

    return {
        displayValue,
        canonicalValue,
        hasDigits: true,
        hasTrailingDecimalSeparator,
    };
}

/**
 * @summary Parses locale decimal input into canonical decimal format.
 * @param input Raw typed input value.
 * @param locale Active locale for decimal separator behavior.
 * @param options Parser options with fraction truncation.
 * @returns Canonical decimal string with dot separator or null when no digits exist.
 */
export function parseLocaleDecimalToCanonical(
    input: string,
    locale: Language,
    options: ParseLocaleDecimalOptions = {}
): string | null {
    return parseLocaleDecimalDraft(input, locale, options).canonicalValue;
}

/**
 * @summary Pads or truncates canonical decimals to an exact fraction size.
 * @param value Canonical decimal value.
 * @param fractionDigits Target number of fraction digits.
 * @returns Canonical decimal with exact fraction length, or null when input is invalid.
 */
export function toCanonicalWithFixedFraction(
    value: string,
    fractionDigits: number
): string | null {
    return normalizeCanonicalWithFractionDigits(value, fractionDigits);
}

/**
 * @summary Checks whether a value matches canonical decimal format.
 * @param value Candidate decimal string.
 * @returns True when value is canonical.
 */
export function isCanonicalDecimal(value: string): boolean {
    return parseCanonicalDecimalParts(value) !== null;
}

/**
 * @summary Formats canonical decimal strings using locale separators while preserving precision.
 * @param value Canonical decimal value.
 * @param locale Active locale.
 * @param options Optional minimum/maximum fraction constraints for display.
 * @returns Localized decimal display value.
 */
export function formatCanonicalDecimal(
    value: string,
    locale: Language,
    options: FormatCanonicalDecimalOptions = {}
): string {
    const parsedValue = parseCanonicalDecimalParts(value);
    if (parsedValue === null) {
        return "";
    }

    const minimumFractionDigits = clampFractionDigits(options.minimumFractionDigits, 0);
    const hasMaximumFractionDigits = typeof options.maximumFractionDigits === "number";
    const maximumFractionDigits = clampFractionDigits(
        options.maximumFractionDigits,
        parsedValue.fractionPart.length
    );
    const boundedMaximumFractionDigits = hasMaximumFractionDigits
        ? Math.max(minimumFractionDigits, maximumFractionDigits)
        : undefined;

    const normalizedFractionPart = (() => {
        if (boundedMaximumFractionDigits === undefined) {
            return parsedValue.fractionPart.padEnd(minimumFractionDigits, "0");
        }

        return parsedValue.fractionPart
            .slice(0, boundedMaximumFractionDigits)
            .padEnd(minimumFractionDigits, "0");
    })();

    const integerAsBigInt = BigInt(parsedValue.integerPart);
    const signedInteger = parsedValue.isNegative ? -integerAsBigInt : integerAsBigInt;
    const integerParts = getCachedNumberFormatter(locale, {
        style: "decimal",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).formatToParts(signedInteger);

    if (normalizedFractionPart.length === 0) {
        return integerParts.map((part) => part.value).join("");
    }

    const decimalSeparator = getLocaleDecimalSeparator(locale);
    const lastNumericPartIndex = integerParts.reduce((lastIndex, part, index) => {
        return part.type === "integer" || part.type === "group" ? index : lastIndex;
    }, -1);

    if (lastNumericPartIndex === -1) {
        return integerParts.map((part) => part.value).join("");
    }

    return integerParts
        .map((part, index) =>
            index === lastNumericPartIndex
                ? `${part.value}${decimalSeparator}${normalizedFractionPart}`
                : part.value
        )
        .join("");
}

/**
 * @summary Compares two canonical decimal values without float precision loss.
 * @param left Left canonical value.
 * @param right Right canonical value.
 * @returns 1 when left > right, -1 when left < right, 0 when equal, null when invalid input.
 */
export function compareCanonicalDecimal(left: string, right: string): -1 | 0 | 1 | null {
    const leftParts = parseCanonicalDecimalParts(left);
    const rightParts = parseCanonicalDecimalParts(right);
    if (leftParts === null || rightParts === null) {
        return null;
    }

    const scale = Math.max(leftParts.fractionPart.length, rightParts.fractionPart.length);
    const leftDigits = `${leftParts.integerPart}${leftParts.fractionPart.padEnd(scale, "0")}`;
    const rightDigits = `${rightParts.integerPart}${rightParts.fractionPart.padEnd(scale, "0")}`;
    const leftValue = BigInt(leftDigits) * (leftParts.isNegative ? -1n : 1n);
    const rightValue = BigInt(rightDigits) * (rightParts.isNegative ? -1n : 1n);

    if (leftValue > rightValue) {
        return 1;
    }

    if (leftValue < rightValue) {
        return -1;
    }

    return 0;
}

/**
 * @summary Validates canonical decimal values against required/min/max/greater-than-zero rules.
 * @param value Canonical decimal value.
 * @param rules Validation rule set.
 * @returns Matching validation error code or null when valid.
 */
export function validateCanonicalDecimal(
    value: string,
    rules: DecimalValidationRules
): NumericInputValidationError | null {
    const trimmedValue = value.trim();

    if (rules.required && trimmedValue.length === 0) {
        return NumericInputValidationError.REQUIRED;
    }

    if (trimmedValue.length === 0) {
        return null;
    }

    if (!isCanonicalDecimal(trimmedValue)) {
        return NumericInputValidationError.INVALID;
    }

    if (rules.greaterThanZero) {
        const comparison = compareCanonicalDecimal(trimmedValue, "0");
        if (comparison !== null && comparison <= 0) {
            return NumericInputValidationError.GREATER_THAN_ZERO;
        }
    }

    if (typeof rules.min === "string" && rules.min.trim().length > 0) {
        const comparison = compareCanonicalDecimal(trimmedValue, rules.min.trim());
        if (comparison !== null && comparison < 0) {
            return NumericInputValidationError.MIN;
        }
    }

    if (typeof rules.max === "string" && rules.max.trim().length > 0) {
        const comparison = compareCanonicalDecimal(trimmedValue, rules.max.trim());
        if (comparison !== null && comparison > 0) {
            return NumericInputValidationError.MAX;
        }
    }

    return null;
}
