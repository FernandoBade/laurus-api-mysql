/** @summary Validation error codes for locale-aware numeric input components. */
export enum NumericInputValidationError {
    REQUIRED = "required",
    INVALID = "invalid",
    MIN = "min",
    MAX = "max",
    GREATER_THAN_ZERO = "greaterThanZero",
}

/** @summary Validation error codes for international phone input components. */
export enum PhoneInputValidationError {
    REQUIRED = "required",
    INVALID = "invalid",
    INCOMPLETE = "incomplete",
}
