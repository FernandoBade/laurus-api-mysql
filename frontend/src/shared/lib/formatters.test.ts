import { describe, expect, test } from "vitest";
import { formatDate, formatMoney, toDateInputValue } from "./formatters";

describe("formatters", () => {
  test("formatMoney defaults to 0.00 for empty values", () => {
    expect(formatMoney(undefined, { locale: "en-US" })).toBe("0.00");
    expect(formatMoney(null, { locale: "en-US", emptyValue: "-" })).toBe("-");
  });

  test("formatMoney formats currency with locale", () => {
    expect(formatMoney(1234.5, { locale: "en-US" })).toBe("1,234.50");
    expect(
      formatMoney(1234.5, { locale: "en-US", currency: "USD" })
    ).toBe("$1,234.50");
  });

  test("formatDate formats with explicit timezone", () => {
    const date = new Date(Date.UTC(2025, 0, 2, 0, 0, 0));
    expect(formatDate(date, "en-US", { timeZone: "UTC" })).toBe("1/2/2025");
  });

  test("toDateInputValue normalizes dates", () => {
    const date = new Date("2025-01-02T12:00:00Z");
    expect(toDateInputValue(date)).toBe("2025-01-02");
  });
});
