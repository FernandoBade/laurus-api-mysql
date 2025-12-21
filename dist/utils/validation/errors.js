"use strict";
/**
 * Validation error types and helpers.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createValidationError = createValidationError;
exports.formatValidationErrors = formatValidationErrors;
/**
 * Creates a validation error object.
 *
 * @summary Creates a validation error.
 * @param property - Field name that failed validation.
 * @param error - Error message.
 * @returns Validation error object.
 */
function createValidationError(property, error) {
    return { property, error };
}
/**
 * Formats validation errors in a consistent structure.
 *
 * @summary Formats validation errors for API responses.
 * @param errors - Array of validation errors.
 * @returns Formatted error array.
 */
function formatValidationErrors(errors) {
    return errors;
}
