/**
 * Validation error types and helpers.
 */

/**
 * Represents a validation error for a specific field.
 */
export interface ValidationError {
    property: string;
    error: string;
}

/**
 * Creates a validation error object.
 *
 * @summary Creates a validation error.
 * @param property - Field name that failed validation.
 * @param error - Error message.
 * @returns Validation error object.
 */
export function createValidationError(property: string, error: string): ValidationError {
    return { property, error };
}
