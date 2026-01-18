import { getResourceLanguage } from "@/shared/i18n";
import type { Currency } from "@/shared/types/domain";

type FormatMoneyOptions = {
  locale?: string;
  currency?: Currency;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  emptyValue?: string;
};

const coerceNumber = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) {
    return null;
  }
  const numeric = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(numeric)) {
    return null;
  }
  return numeric;
};

export const formatMoney = (
  value: string | number | null | undefined,
  options: FormatMoneyOptions = {}
) => {
  const amount = coerceNumber(value);
  if (amount === null) {
    return options.emptyValue ?? "0.00";
  }
  const locale = options.locale ?? getResourceLanguage();
  const minimumFractionDigits = options.minimumFractionDigits ?? 2;
  const maximumFractionDigits = options.maximumFractionDigits ?? 2;
  if (options.currency) {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: options.currency,
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(amount);
  }
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount);
};
