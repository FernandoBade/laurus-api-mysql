/**
 * Minimal runtime validation guards.
 * Provides basic type checking and validation without external dependencies.
 */

/**
 * Checks if a value is a non-empty string.
 *
 * @summary Validates that a value is a string.
 * @param value - Value to check.
 * @returns True if value is a non-empty string, false otherwise.
 */
export function isString(value: unknown): value is string {
    return typeof value === 'string' && value.length > 0;
}

/**
 * Checks if a value is a valid number.
 *
 * @summary Validates that a value is a number.
 * @param value - Value to check.
 * @returns True if value is a number and not NaN, false otherwise.
 */
export function isNumber(value: unknown): value is number {
    return typeof value === 'number' && !isNaN(value);
}

/**
 * Checks if a value is an array of numbers.
 *
 * @summary Validates that a value is a number array.
 * @param value - Value to check.
 * @returns True if value is a number array, false otherwise.
 */
export function isNumberArray(value: unknown): value is number[] {
    return Array.isArray(value) && value.every(isNumber);
}

/**
 * Checks if a value is a boolean.
 *
 * @summary Validates that a value is a boolean.
 * @param value - Value to check.
 * @returns True if value is a boolean, false otherwise.
 */
export function isBoolean(value: unknown): value is boolean {
    return typeof value === 'boolean';
}

/**
 * Checks if a value is a valid date or date string.
 *
 * @summary Validates that a value is a valid date.
 * @param value - Value to check.
 * @returns True if value is a valid date, false otherwise.
 */
export function isDate(value: unknown): value is Date | string {
    if (value instanceof Date) {
        return !isNaN(value.getTime());
    }
    if (typeof value === 'string') {
        const date = new Date(value);
        return !isNaN(date.getTime());
    }
    return false;
}

/**
 * Checks if a value is a member of an enum object.
 *
 * @summary Validates enum membership.
 * @param value - Value to check.
 * @param enumObject - Enum object to check against.
 * @returns True if value is a valid enum member, false otherwise.
 */
export function isEnum<T extends Record<string, string | number>>(
    value: unknown,
    enumObject: T
): value is T[keyof T] {
    return Object.values(enumObject).includes(value as T[keyof T]);
}

/**
 * Validates email format (basic check).
 *
 * @summary Validates email format.
 * @param email - Email string to validate.
 * @returns True if email format is valid, false otherwise.
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validates that a string meets minimum length requirement.
 *
 * @summary Validates string minimum length.
 * @param value - String to check.
 * @param minLength - Minimum required length.
 * @returns True if string meets minimum length, false otherwise.
 */
export function hasMinLength(value: string, minLength: number): boolean {
    return typeof value === 'string' && value.length >= minLength;
}

