import { NumericInputValidationError } from "@shared/enums/input-validation.enums";
import { Language } from "@shared/enums/language.enums";
import {
    compareCanonicalDecimal,
    formatCanonicalDecimal,
    getLocaleDecimalSeparator,
    parseLocaleDecimalDraft,
    parseLocaleDecimalToCanonical,
    toCanonicalWithFixedFraction,
    validateCanonicalDecimal,
} from "@/utils/intl/decimalInput";

describe("decimalInput locale parser and canonical behavior", () => {
    it("parses pt-BR decimals and pads to money blur precision", () => {
        const canonical = parseLocaleDecimalToCanonical("12,3", Language.PT_BR, {
            maxFractionDigits: 2,
        });
        const canonicalOnBlur = toCanonicalWithFixedFraction(canonical ?? "", 2);

        expect(canonical).toBe("12.3");
        expect(canonicalOnBlur).toBe("12.30");
    });

    it("truncates pt-BR fraction while typing without rounding", () => {
        const canonical = parseLocaleDecimalToCanonical("12,345", Language.PT_BR, {
            maxFractionDigits: 2,
        });

        expect(canonical).toBe("12.34");
    });

    it("preserves trailing zeros for money canonical on blur", () => {
        const typedCanonical = parseLocaleDecimalToCanonical("120,2", Language.PT_BR, {
            maxFractionDigits: 2,
        });
        const canonicalOnBlur = toCanonicalWithFixedFraction(typedCanonical ?? "", 2);

        expect(canonicalOnBlur).toBe("120.20");
    });

    it("applies the same rules for en-US locale", () => {
        const canonical = parseLocaleDecimalToCanonical("120.2", Language.EN_US, {
            maxFractionDigits: 2,
        });
        const canonicalOnBlur = toCanonicalWithFixedFraction(canonical ?? "", 2);

        expect(canonical).toBe("120.2");
        expect(canonicalOnBlur).toBe("120.20");
    });

    it("normalizes thousand separators and ignores currency symbols", () => {
        const ptBrCanonical = parseLocaleDecimalToCanonical("R$ 1.234,56", Language.PT_BR, {
            maxFractionDigits: 2,
        });
        const enUsCanonical = parseLocaleDecimalToCanonical("$1,234.56", Language.EN_US, {
            maxFractionDigits: 2,
        });

        expect(ptBrCanonical).toBe("1234.56");
        expect(enUsCanonical).toBe("1234.56");
    });

    it("keeps NumberInput canonical with dot and locale display separator", () => {
        const parsedDraft = parseLocaleDecimalDraft("98,7654", Language.PT_BR, {
            maxFractionDigits: 4,
        });

        expect(parsedDraft.canonicalValue).toBe("98.7654");
        expect(formatCanonicalDecimal("98.7654", Language.PT_BR)).toBe("98,7654");
    });

    it("returns locale decimal separator tokens", () => {
        expect(getLocaleDecimalSeparator(Language.PT_BR)).toBe(",");
        expect(getLocaleDecimalSeparator(Language.EN_US)).toBe(".");
        expect(getLocaleDecimalSeparator(Language.ES_ES)).toBe(",");
    });

    it("validates canonical values and compares without float conversion", () => {
        expect(compareCanonicalDecimal("12.34", "12.3400")).toBe(0);
        expect(compareCanonicalDecimal("12.35", "12.3400")).toBe(1);
        expect(compareCanonicalDecimal("12.33", "12.3400")).toBe(-1);
        expect(compareCanonicalDecimal("invalid", "12.3400")).toBeNull();

        expect(
            validateCanonicalDecimal("", {
                required: true,
            })
        ).toBe(NumericInputValidationError.REQUIRED);

        expect(
            validateCanonicalDecimal("invalid", {
                required: false,
            })
        ).toBe(NumericInputValidationError.INVALID);

        expect(
            validateCanonicalDecimal("0", {
                greaterThanZero: true,
            })
        ).toBe(NumericInputValidationError.GREATER_THAN_ZERO);

        expect(
            validateCanonicalDecimal("9.99", {
                min: "10",
            })
        ).toBe(NumericInputValidationError.MIN);

        expect(
            validateCanonicalDecimal("10.01", {
                max: "10",
            })
        ).toBe(NumericInputValidationError.MAX);
    });

    it("covers edge parser branches and wrapper compatibility", () => {
        const emptyDraft = parseLocaleDecimalDraft("abc", Language.EN_US, {
            maxFractionDigits: 2,
        });
        const separatorOnlyDraft = parseLocaleDecimalDraft(",", Language.PT_BR, {
            maxFractionDigits: 2,
        });
        const cappedDraft = parseLocaleDecimalDraft("1.12345678901234567890123", Language.EN_US, {
            maxFractionDigits: 99,
        });
        const parsedDraft = parseLocaleDecimalDraft("12,34", Language.PT_BR, {
            maxFractionDigits: 12,
        });

        expect(emptyDraft.canonicalValue).toBeNull();
        expect(emptyDraft.displayValue).toBe("");
        expect(separatorOnlyDraft.canonicalValue).toBeNull();
        expect(separatorOnlyDraft.displayValue).toBe("0,");
        expect(separatorOnlyDraft.hasTrailingDecimalSeparator).toBe(true);
        expect(cappedDraft.canonicalValue).toBe("1.12345678901234567890");
        expect(parsedDraft.canonicalValue).toBe("12.34");
    });

    it("handles canonical formatting options and fixed-fraction normalization guards", () => {
        expect(
            formatCanonicalDecimal("12.3", Language.EN_US, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })
        ).toBe("12.30");
        expect(
            formatCanonicalDecimal("12.3456", Language.EN_US, {
                minimumFractionDigits: 1,
                maximumFractionDigits: 3,
            })
        ).toBe("12.345");
        expect(formatCanonicalDecimal("invalid", Language.EN_US)).toBe("");
        expect(toCanonicalWithFixedFraction("12.3", 0)).toBe("12");
        expect(toCanonicalWithFixedFraction("12.3", 2)).toBe("12.30");
        expect(toCanonicalWithFixedFraction("invalid", 2)).toBeNull();
    });
});
