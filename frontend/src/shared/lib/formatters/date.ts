import { getResourceLanguage } from "@/shared/i18n";

export const formatDate = (
  value: string | Date | null | undefined,
  locale: string = getResourceLanguage(),
  options?: Intl.DateTimeFormatOptions
) => {
  if (!value) {
    return "";
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat(locale, options).format(date);
};

export const toDateInputValue = (value: string | Date | null | undefined) => {
  if (!value) {
    return "";
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toISOString().split("T")[0];
};
