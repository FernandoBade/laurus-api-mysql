import { Language } from "@shared/enums/language.enums";
import { formatDate } from "@/utils/intl/date";

const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
};

describe("formatDate", () => {
    it("formats date order for pt-BR", () => {
        const leapYearDate = new Date(Date.UTC(2024, 1, 29, 12, 0, 0));

        const result = formatDate(leapYearDate, {
            locale: Language.PT_BR,
            options: DATE_OPTIONS,
        });

        expect(result).toBe("29/02/2024");
    });

    it("formats date order for en-US", () => {
        const leapYearDate = new Date(Date.UTC(2024, 1, 29, 12, 0, 0));

        const result = formatDate(leapYearDate, {
            locale: Language.EN_US,
            options: DATE_OPTIONS,
        });

        expect(result).toBe("02/29/2024");
    });

    it("keeps deterministic output for leap-year and month-boundary dates", () => {
        const leapYearDate = new Date(Date.UTC(2024, 1, 29, 12, 0, 0));
        const monthBoundaryDate = new Date(Date.UTC(2024, 2, 1, 12, 0, 0));

        const leapResult = formatDate(leapYearDate, {
            locale: Language.EN_US,
            options: DATE_OPTIONS,
        });
        const boundaryResult = formatDate(monthBoundaryDate, {
            locale: Language.EN_US,
            options: DATE_OPTIONS,
        });

        expect(leapResult).toBe("02/29/2024");
        expect(boundaryResult).toBe("03/01/2024");
    });

    it("returns empty output for null/undefined and invalid dates", () => {
        const nullResult = formatDate(null, {
            locale: Language.EN_US,
            options: DATE_OPTIONS,
        });
        const invalidResult = formatDate("invalid-date", {
            locale: Language.EN_US,
            options: DATE_OPTIONS,
        });

        expect(nullResult).toBe("");
        expect(invalidResult).toBe("");
    });
});
