"use strict";
/**
 * Minimal runtime validation guards.
 * Provides basic type checking and validation without external dependencies.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isString = isString;
exports.isNumber = isNumber;
exports.isBoolean = isBoolean;
exports.isDate = isDate;
exports.isEnum = isEnum;
exports.hasRequiredFields = hasRequiredFields;
exports.isValidEmail = isValidEmail;
exports.hasMinLength = hasMinLength;
/**
 * Checks if a value is a non-empty string.
 *
 * @summary Validates that a value is a string.
 * @param value - Value to check.
 * @returns True if value is a non-empty string, false otherwise.
 */
function isString(value) {
    return typeof value === 'string' && value.length > 0;
}
/**
 * Checks if a value is a valid number.
 *
 * @summary Validates that a value is a number.
 * @param value - Value to check.
 * @returns True if value is a number and not NaN, false otherwise.
 */
function isNumber(value) {
    return typeof value === 'number' && !isNaN(value);
}
/**
 * Checks if a value is a boolean.
 *
 * @summary Validates that a value is a boolean.
 * @param value - Value to check.
 * @returns True if value is a boolean, false otherwise.
 */
function isBoolean(value) {
    return typeof value === 'boolean';
}
/**
 * Checks if a value is a valid date or date string.
 *
 * @summary Validates that a value is a valid date.
 * @param value - Value to check.
 * @returns True if value is a valid date, false otherwise.
 */
function isDate(value) {
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
function isEnum(value, enumObject) {
    return Object.values(enumObject).includes(value);
}
/**
 * Checks if an object has all required fields.
 *
 * @summary Validates required fields presence.
 * @param obj - Object to check.
 * @param fields - Array of required field names.
 * @returns True if all required fields are present, false otherwise.
 */
function hasRequiredFields(obj, fields) {
    if (!obj || typeof obj !== 'object') {
        return false;
    }
    return fields.every(field => field in obj && obj[field] !== undefined && obj[field] !== null);
}
/**
 * Validates email format (basic check).
 *
 * @summary Validates email format.
 * @param email - Email string to validate.
 * @returns True if email format is valid, false otherwise.
 */
function isValidEmail(email) {
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
function hasMinLength(value, minLength) {
    return typeof value === 'string' && value.length >= minLength;
}
