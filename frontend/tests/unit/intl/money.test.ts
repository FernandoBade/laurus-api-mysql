import { Currency, Language } from "@shared/enums/user.enums";
import { formatMoney } from "@/utils/intl/money";

function normalizeSpaces(value: string): string {
    return value.replace(/\u00A0/g, " ");
}

describe("formatMoney", () => {
    it("formats BRL under pt-BR", () => {
        const result = normalizeSpaces(
            formatMoney("1234.56", {
                locale: Language.PT_BR,
                currency: Currency.BRL,
            })
        );

        expect(result).toBe("R$ 1.234,56");
    });

    it("formats USD under en-US", () => {
        const result = formatMoney("1234.56", {
            locale: Language.EN_US,
            currency: Currency.USD,
        });

        expect(result).toBe("$1,234.56");
    });

    it("supports cross-locale currency formatting", () => {
        const usdInPtBr = normalizeSpaces(
            formatMoney("1234.56", {
                locale: Language.PT_BR,
                currency: Currency.USD,
            })
        );
        const brlInEnUs = normalizeSpaces(
            formatMoney("1234.56", {
                locale: Language.EN_US,
                currency: Currency.BRL,
            })
        );

        expect(usdInPtBr).toContain("US$");
        expect(usdInPtBr).toContain("1.234,56");
        expect(brlInEnUs).toContain("R$");
        expect(brlInEnUs).toContain("1,234.56");
    });

    it("keeps canonical string precision without float artifacts", () => {
        const precise = formatMoney("0.30", {
            locale: Language.EN_US,
            currency: Currency.USD,
        });

        expect(precise).toBe("$0.30");
    });

    it("keeps large canonical numeric strings precise", () => {
        const result = formatMoney("9007199254740993.01", {
            locale: Language.EN_US,
            currency: Currency.USD,
        });

        expect(result).toBe("$9,007,199,254,740,993.01");
    });

    it("supports explicit minimumFractionDigits overrides", () => {
        const result = formatMoney("1234", {
            locale: Language.EN_US,
            currency: Currency.USD,
            options: {
                minimumFractionDigits: 3,
            },
        });

        expect(result).toBe("$1,234.000");
    });

    it("supports zero-decimal formatting when explicitly requested", () => {
        const result = formatMoney("1234", {
            locale: Language.EN_US,
            currency: Currency.USD,
            options: {
                minimumFractionDigits: 0,
            },
        });

        expect(result).toBe("$1,234");
    });

    it("returns empty output for non-canonical input", () => {
        const result = formatMoney("12a.34", {
            locale: Language.EN_US,
            currency: Currency.USD,
        });

        expect(result).toBe("");
    });
});
