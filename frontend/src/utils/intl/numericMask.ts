import { Language } from "@shared/enums/language.enums";
import IMask, { type InputMask, type MaskedNumberOptions } from "imask";
import { getCachedNumberFormatter } from "@/utils/intl/cache";
import { formatCanonicalDecimal, parseLocaleDecimalToCanonical } from "@/utils/intl/decimalInput";

const DEFAULT_SCALE = 4;
const MAX_SCALE = 20;

type NumericRadix = "." | ",";

export interface NumericMaskConfig {
    readonly language: Language;
    readonly scale?: number;
    readonly padFractionalZeros?: boolean;
    readonly normalizeZeros?: boolean;
    readonly useThousandsSeparator?: boolean;
}

export interface NumericMaskLocaleTokens {
    readonly radix: NumericRadix;
    readonly thousandsSeparator: string;
    readonly mapToRadix: readonly string[];
}

export interface CanonicalMaskFormatOptions {
    readonly minimumFractionDigits?: number;
    readonly maximumFractionDigits?: number;
}

export type NumericMaskInstance = InputMask<MaskedNumberOptions>;


function clampScale(scale: number | undefined): number {
    if (typeof scale !== "number" || Number.isNaN(scale) || scale < 0) {
        return DEFAULT_SCALE;
    }

    return Math.min(Math.trunc(scale), MAX_SCALE);
}


function normalizeThousandsSeparator(value: string): string {
    if (value.trim().length === 0) {
        return ",";
    }

    if (/\s/.test(value)) {
        return " ";
    }

    return value;
}

/**
 * @summary Resolves radix and thousands separators used by numeric masks for a locale.
 * @param language Active locale language.
 * @returns Locale numeric mask token set.
 */

export function getNumericMaskLocaleTokens(language: Language): NumericMaskLocaleTokens {
    const parts = getCachedNumberFormatter(language, {
        useGrouping: true,
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    }).formatToParts(1234.5);

    const decimalSeparatorPart = parts.find((part) => part.type === "decimal")?.value;
    const groupSeparatorPart = parts.find((part) => part.type === "group")?.value;
    const radix: NumericRadix = decimalSeparatorPart === "," ? "," : ".";
    const fallbackGroupSeparator = radix === "," ? "." : ",";
    const thousandsSeparator = normalizeThousandsSeparator(
        groupSeparatorPart ?? fallbackGroupSeparator
    );
    const mapToRadix = (radix === "," ? ["."] : [","])
        .filter((separator) => separator !== radix && separator !== thousandsSeparator);

    return {
        radix,
        thousandsSeparator,
        mapToRadix,
    };
}

/**
 * @summary Builds IMask numeric options from typed numeric mask configuration.
 * @param config Numeric mask configuration.
 * @returns Typed IMask options for numeric masks.
 */

export function createNumericMaskOptions(config: NumericMaskConfig): MaskedNumberOptions {
    const scale = clampScale(config.scale);
    const tokens = getNumericMaskLocaleTokens(config.language);

    return {
        mask: Number,
        scale,
        radix: tokens.radix,
        mapToRadix: [...tokens.mapToRadix],
        thousandsSeparator: config.useThousandsSeparator === false ? "" : tokens.thousandsSeparator,
        padFractionalZeros: config.padFractionalZeros ?? false,
        normalizeZeros: config.normalizeZeros ?? true,
        min: 0,
    };
}

/**
 * @summary Creates an IMask numeric instance bound to the provided input element.
 * @param element Input element target.
 * @param config Numeric mask configuration.
 * @returns Numeric mask instance.
 */

export function createNumericMask(
    element: HTMLInputElement,
    config: NumericMaskConfig
): NumericMaskInstance {
    return IMask(element, createNumericMaskOptions(config));
}

/**
 * @summary Converts a masked numeric string into canonical dot-decimal representation.
 * @param maskedValue Current masked display value.
 * @param language Active locale language.
 * @param scale Maximum fraction scale accepted by the mask.
 * @returns Canonical decimal value with dot separator.
 */

export function maskedValueToCanonical(
    maskedValue: string,
    language: Language,
    scale: number
): string {
    return parseLocaleDecimalToCanonical(maskedValue, language, {
        maxFractionDigits: clampScale(scale),
    }) ?? "";
}

/**
 * @summary Formats canonical numeric values into locale-aware masked display strings.
 * @param canonicalValue Canonical decimal value.
 * @param language Active locale language.
 * @param options Optional fraction constraints for display rendering.
 * @returns Locale-aware display string for masked inputs.
 */

export function canonicalToMaskedValue(
    canonicalValue: string,
    language: Language,
    options: CanonicalMaskFormatOptions = {}
): string {
    if (canonicalValue.trim().length === 0) {
        return "";
    }

    return formatCanonicalDecimal(canonicalValue, language, {
        minimumFractionDigits: options.minimumFractionDigits,
        maximumFractionDigits: options.maximumFractionDigits,
    });
}
