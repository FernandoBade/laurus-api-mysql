export const isBlank = (value: string) => value.trim().length === 0;

export const parseNumberInput = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return { value: undefined, error: undefined };
  }
  const numeric = Number(trimmed);
  if (Number.isNaN(numeric)) {
    return { value: undefined, error: "invalid" as const };
  }
  return { value: numeric, error: undefined };
};

export const isPositiveNumber = (value: number) => value > 0;

export const isNonNegativeNumber = (value: number) => value >= 0;
