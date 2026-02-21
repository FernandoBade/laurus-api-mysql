import { Language } from "@shared/enums/language.enums";
import { formatNumber } from "@/utils/intl/number";

describe("formatNumber", () => {
    it("formats thousand and decimal separators for pt-BR", () => {
        const result = formatNumber(1234567.89, {
            locale: Language.PT_BR,
            options: { minimumFractionDigits: 2, maximumFractionDigits: 2 },
        });

        expect(result).toBe("1.234.567,89");
    });

    it("formats thousand and decimal separators for en-US", () => {
        const result = formatNumber(1234567.89, {
            locale: Language.EN_US,
            options: { minimumFractionDigits: 2, maximumFractionDigits: 2 },
        });

        expect(result).toBe("1,234,567.89");
    });

    it("formats large numbers consistently", () => {
        const result = formatNumber(9876543210123, {
            locale: Language.EN_US,
        });

        expect(result).toBe("9,876,543,210,123");
    });

    it("formats negative numbers", () => {
        const result = formatNumber(-1543.21, {
            locale: Language.PT_BR,
            options: { minimumFractionDigits: 2, maximumFractionDigits: 2 },
        });

        expect(result).toBe("-1.543,21");
    });
});
