import { Language } from "@shared/enums/language.enums";
import { toCanonicalWithFixedFraction } from "@/utils/intl/decimalInput";
import {
    canonicalToMaskedValue,
    createNumericMaskOptions,
    getNumericMaskLocaleTokens,
    maskedValueToCanonical,
} from "@/utils/intl/numericMask";

describe("numericMask locale-aware canonical flow", () => {
    it("keeps money canonical with dot and closes to 2 decimals on blur", () => {
        const typedCanonical = maskedValueToCanonical("12,3", Language.PT_BR, 2);
        const canonicalOnBlur = toCanonicalWithFixedFraction(typedCanonical, 2);
        const maskedDisplay = canonicalToMaskedValue(canonicalOnBlur ?? "", Language.PT_BR, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

        expect(typedCanonical).toBe("12.3");
        expect(canonicalOnBlur).toBe("12.30");
        expect(maskedDisplay).toBe("12,30");
    });

    it("respects en-US separators with money canonical normalized to dot", () => {
        const typedCanonical = maskedValueToCanonical("1,234.5", Language.EN_US, 2);
        const canonicalOnBlur = toCanonicalWithFixedFraction(typedCanonical, 2);
        const maskedDisplay = canonicalToMaskedValue(canonicalOnBlur ?? "", Language.EN_US, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

        expect(typedCanonical).toBe("1234.5");
        expect(canonicalOnBlur).toBe("1234.50");
        expect(maskedDisplay).toBe("1,234.50");
    });

    it("truncates NumberInput scale without float conversion", () => {
        const canonical = maskedValueToCanonical("12,34567", Language.PT_BR, 4);

        expect(canonical).toBe("12.3456");
    });

    it("keeps Integer canonical as digits only", () => {
        const canonicalFromIntegerMask = maskedValueToCanonical("1.234", Language.PT_BR, 0);
        const canonicalFromDecimalInput = maskedValueToCanonical("1.234,56", Language.PT_BR, 0);

        expect(canonicalFromIntegerMask).toBe("1234");
        expect(canonicalFromDecimalInput).toBe("1234");
    });

    it("builds locale tokens and options for iMask", () => {
        const ptBrTokens = getNumericMaskLocaleTokens(Language.PT_BR);
        const enUsTokens = getNumericMaskLocaleTokens(Language.EN_US);
        const integerOptions = createNumericMaskOptions({
            language: Language.PT_BR,
            scale: 0,
            useThousandsSeparator: true,
        });

        expect(ptBrTokens.radix).toBe(",");
        expect(enUsTokens.radix).toBe(".");
        expect(integerOptions.scale).toBe(0);
        expect(integerOptions.thousandsSeparator).toBe(".");
    });
});
