type ClassNameValue = string | false | null | undefined;

/**
 * @summary Builds a normalized class string from conditional tokens and arrays.
 */

export function classNames(...values: ClassNameValue[]): string {
  return values
    .filter((value): value is string => typeof value === "string" && value.length > 0)
    .join(" ");
}
