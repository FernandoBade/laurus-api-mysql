type ClassNameValue = string | false | null | undefined;

/**
 * @summary Combines class name tokens into a single normalized string.
 */
export function classNames(...values: ClassNameValue[]): string {
  return values
    .filter((value): value is string => typeof value === "string" && value.length > 0)
    .join(" ");
}
