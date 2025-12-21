"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCreateUser = validateCreateUser;
exports.validateUpdateUser = validateUpdateUser;
exports.validateCreateAccount = validateCreateAccount;
exports.validateUpdateAccount = validateUpdateAccount;
exports.validateCreateCategory = validateCreateCategory;
exports.validateUpdateCategory = validateUpdateCategory;
exports.validateCreateSubcategory = validateCreateSubcategory;
exports.validateUpdateSubcategory = validateUpdateSubcategory;
exports.validateCreateCreditCard = validateCreateCreditCard;
exports.validateUpdateCreditCard = validateUpdateCreditCard;
exports.validateCreateTransaction = validateCreateTransaction;
exports.validateUpdateTransaction = validateUpdateTransaction;
const guards_1 = require("./guards");
const errors_1 = require("./errors");
const enum_1 = require("../enum");
const resourceService_1 = require("../resources/languages/resourceService");
const resource_1 = require("../resources/resource");
/**
 * Generic validation helper that validates required fields and basic types.
 *
 * @summary Validates object structure with required fields and type checks.
 * @param data - Data to validate.
 * @param requiredFields - Array of required field names.
 * @param fieldValidators - Object mapping field names to validation functions.
 * @param lang - Language code for error messages.
 * @returns Validation result.
 */
function validateObject(data, requiredFields, fieldValidators, lang) {
    const errors = [];
    if (!data || typeof data !== 'object') {
        return { success: false, errors: [(0, errors_1.createValidationError)('body', resourceService_1.ResourceBase.translate(resource_1.Resource.VALIDATION_ERROR, lang))] };
    }
    const body = data;
    // Check required fields
    for (const field of requiredFields) {
        if (!(field in body) || body[field] === undefined || body[field] === null) {
            errors.push((0, errors_1.createValidationError)(field, resourceService_1.ResourceBase.translate(resource_1.Resource.FIELD_REQUIRED, lang)));
        }
    }
    // Validate each field
    for (const [field, validator] of Object.entries(fieldValidators)) {
        if (field in body && body[field] !== undefined && body[field] !== null) {
            const error = validator(body[field], lang);
            if (error) {
                errors.push(error);
            }
        }
    }
    if (errors.length > 0) {
        return { success: false, errors };
    }
    return { success: true, data: body };
}
/**
 * Validates user creation data.
 *
 * @summary Validates user creation request data.
 * @param data - Request body data.
 * @param lang - Language code for error messages.
 * @returns Validation result with data or errors.
 */
function validateCreateUser(data, lang) {
    const errors = [];
    if (!data || typeof data !== 'object') {
        return { success: false, errors: [(0, errors_1.createValidationError)('body', resourceService_1.ResourceBase.translate(resource_1.Resource.VALIDATION_ERROR, lang))] };
    }
    const body = data;
    if (!(0, guards_1.isString)(body.firstName) || !(0, guards_1.hasMinLength)(body.firstName, 2)) {
        errors.push((0, errors_1.createValidationError)('firstName', resourceService_1.ResourceBase.translate(resource_1.Resource.FIRST_NAME_TOO_SHORT, lang)));
    }
    if (!(0, guards_1.isString)(body.lastName) || !(0, guards_1.hasMinLength)(body.lastName, 2)) {
        errors.push((0, errors_1.createValidationError)('lastName', resourceService_1.ResourceBase.translate(resource_1.Resource.LAST_NAME_TOO_SHORT, lang)));
    }
    if (!(0, guards_1.isString)(body.email) || !(0, guards_1.isValidEmail)(body.email)) {
        errors.push((0, errors_1.createValidationError)('email', resourceService_1.ResourceBase.translate(resource_1.Resource.EMAIL_INVALID, lang)));
    }
    if (!(0, guards_1.isString)(body.password) || !(0, guards_1.hasMinLength)(body.password, 6)) {
        errors.push((0, errors_1.createValidationError)('password', resourceService_1.ResourceBase.translate(resource_1.Resource.PASSWORD_TOO_SHORT, lang)));
    }
    if (body.phone !== undefined && !(0, guards_1.isString)(body.phone)) {
        errors.push((0, errors_1.createValidationError)('phone', resourceService_1.ResourceBase.translate(resource_1.Resource.INVALID_PHONE_TYPE, lang)));
    }
    if (body.birthDate !== undefined && !(0, guards_1.isDate)(body.birthDate)) {
        errors.push((0, errors_1.createValidationError)('birthDate', resourceService_1.ResourceBase.translate(resource_1.Resource.INVALID_DATE_FORMAT, lang)));
    }
    if (body.theme !== undefined && !(0, guards_1.isEnum)(body.theme, enum_1.Theme)) {
        errors.push((0, errors_1.createValidationError)('theme', resourceService_1.ResourceBase.translate(resource_1.Resource.INVALID_THEME_VALUE, lang)));
    }
    if (body.language !== undefined && !(0, guards_1.isEnum)(body.language, enum_1.Language)) {
        errors.push((0, errors_1.createValidationError)('language', resourceService_1.ResourceBase.translate(resource_1.Resource.INVALID_LANGUAGE_VALUE, lang)));
    }
    if (body.currency !== undefined && !(0, guards_1.isEnum)(body.currency, enum_1.Currency)) {
        errors.push((0, errors_1.createValidationError)('currency', resourceService_1.ResourceBase.translate(resource_1.Resource.INVALID_CURRENCY_VALUE, lang)));
    }
    if (body.dateFormat !== undefined && !(0, guards_1.isEnum)(body.dateFormat, enum_1.DateFormat)) {
        errors.push((0, errors_1.createValidationError)('dateFormat', resourceService_1.ResourceBase.translate(resource_1.Resource.INVALID_DATE_FORMAT_VALUE, lang)));
    }
    if (body.profile !== undefined && !(0, guards_1.isEnum)(body.profile, enum_1.Profile)) {
        errors.push((0, errors_1.createValidationError)('profile', resourceService_1.ResourceBase.translate(resource_1.Resource.INVALID_PROFILE_VALUE, lang)));
    }
    if (body.active !== undefined && !(0, guards_1.isBoolean)(body.active)) {
        errors.push((0, errors_1.createValidationError)('active', resourceService_1.ResourceBase.translate(resource_1.Resource.INVALID_ACTIVE_TYPE, lang)));
    }
    if (errors.length > 0) {
        return { success: false, errors };
    }
    return {
        success: true,
        data: {
            firstName: body.firstName,
            lastName: body.lastName,
            email: body.email.toLowerCase().trim(),
            password: body.password,
            phone: body.phone,
            birthDate: body.birthDate ? new Date(body.birthDate) : undefined,
            theme: body.theme,
            language: body.language,
            currency: body.currency,
            dateFormat: body.dateFormat,
            profile: body.profile,
            active: body.active,
        }
    };
}
/**
 * Validates user update data (all fields optional).
 *
 * @summary Validates user update request data.
 * @param data - Request body data.
 * @param lang - Language code for error messages.
 * @returns Validation result with data or errors.
 */
function validateUpdateUser(data, lang) {
    const errors = [];
    if (!data || typeof data !== 'object') {
        return { success: false, errors: [(0, errors_1.createValidationError)('body', resourceService_1.ResourceBase.translate(resource_1.Resource.VALIDATION_ERROR, lang))] };
    }
    const body = data;
    const result = {};
    if (body.firstName !== undefined) {
        if (!(0, guards_1.isString)(body.firstName) || !(0, guards_1.hasMinLength)(body.firstName, 2)) {
            errors.push((0, errors_1.createValidationError)('firstName', resourceService_1.ResourceBase.translate(resource_1.Resource.FIRST_NAME_TOO_SHORT, lang)));
        }
        else {
            result.firstName = body.firstName;
        }
    }
    if (body.lastName !== undefined) {
        if (!(0, guards_1.isString)(body.lastName) || !(0, guards_1.hasMinLength)(body.lastName, 2)) {
            errors.push((0, errors_1.createValidationError)('lastName', resourceService_1.ResourceBase.translate(resource_1.Resource.LAST_NAME_TOO_SHORT, lang)));
        }
        else {
            result.lastName = body.lastName;
        }
    }
    if (body.email !== undefined) {
        if (!(0, guards_1.isString)(body.email) || !(0, guards_1.isValidEmail)(body.email)) {
            errors.push((0, errors_1.createValidationError)('email', resourceService_1.ResourceBase.translate(resource_1.Resource.EMAIL_INVALID, lang)));
        }
        else {
            result.email = body.email.toLowerCase().trim();
        }
    }
    if (body.password !== undefined) {
        if (!(0, guards_1.isString)(body.password) || !(0, guards_1.hasMinLength)(body.password, 6)) {
            errors.push((0, errors_1.createValidationError)('password', resourceService_1.ResourceBase.translate(resource_1.Resource.PASSWORD_TOO_SHORT, lang)));
        }
        else {
            result.password = body.password;
        }
    }
    if (body.phone !== undefined && body.phone !== null) {
        if (!(0, guards_1.isString)(body.phone)) {
            errors.push((0, errors_1.createValidationError)('phone', resourceService_1.ResourceBase.translate(resource_1.Resource.INVALID_PHONE_TYPE, lang)));
        }
        else {
            result.phone = body.phone;
        }
    }
    if (body.birthDate !== undefined && body.birthDate !== null) {
        if (!(0, guards_1.isDate)(body.birthDate)) {
            errors.push((0, errors_1.createValidationError)('birthDate', resourceService_1.ResourceBase.translate(resource_1.Resource.INVALID_DATE_FORMAT, lang)));
        }
        else {
            result.birthDate = new Date(body.birthDate);
        }
    }
    if (body.theme !== undefined && !(0, guards_1.isEnum)(body.theme, enum_1.Theme)) {
        errors.push((0, errors_1.createValidationError)('theme', resourceService_1.ResourceBase.translate(resource_1.Resource.INVALID_THEME_VALUE, lang)));
    }
    else if (body.theme !== undefined) {
        result.theme = body.theme;
    }
    if (body.language !== undefined && !(0, guards_1.isEnum)(body.language, enum_1.Language)) {
        errors.push((0, errors_1.createValidationError)('language', resourceService_1.ResourceBase.translate(resource_1.Resource.INVALID_LANGUAGE_VALUE, lang)));
    }
    else if (body.language !== undefined) {
        result.language = body.language;
    }
    if (body.currency !== undefined && !(0, guards_1.isEnum)(body.currency, enum_1.Currency)) {
        errors.push((0, errors_1.createValidationError)('currency', resourceService_1.ResourceBase.translate(resource_1.Resource.INVALID_CURRENCY_VALUE, lang)));
    }
    else if (body.currency !== undefined) {
        result.currency = body.currency;
    }
    if (body.dateFormat !== undefined && !(0, guards_1.isEnum)(body.dateFormat, enum_1.DateFormat)) {
        errors.push((0, errors_1.createValidationError)('dateFormat', resourceService_1.ResourceBase.translate(resource_1.Resource.INVALID_DATE_FORMAT_VALUE, lang)));
    }
    else if (body.dateFormat !== undefined) {
        result.dateFormat = body.dateFormat;
    }
    if (body.profile !== undefined && !(0, guards_1.isEnum)(body.profile, enum_1.Profile)) {
        errors.push((0, errors_1.createValidationError)('profile', resourceService_1.ResourceBase.translate(resource_1.Resource.INVALID_PROFILE_VALUE, lang)));
    }
    else if (body.profile !== undefined) {
        result.profile = body.profile;
    }
    if (body.active !== undefined && !(0, guards_1.isBoolean)(body.active)) {
        errors.push((0, errors_1.createValidationError)('active', resourceService_1.ResourceBase.translate(resource_1.Resource.INVALID_ACTIVE_TYPE, lang)));
    }
    else if (body.active !== undefined) {
        result.active = body.active;
    }
    if (errors.length > 0) {
        return { success: false, errors };
    }
    return { success: true, data: result };
}
/**
 * Validates account creation data.
 *
 * @summary Validates account creation request data.
 * @param data - Request body data.
 * @param lang - Language code for error messages.
 * @returns Validation result with data or errors.
 */
function validateCreateAccount(data, lang) {
    const errors = [];
    if (!data || typeof data !== 'object') {
        return { success: false, errors: [(0, errors_1.createValidationError)('body', resourceService_1.ResourceBase.translate(resource_1.Resource.VALIDATION_ERROR, lang))] };
    }
    const body = data;
    if (!(0, guards_1.isString)(body.name) || body.name.length < 1) {
        errors.push((0, errors_1.createValidationError)('name', resourceService_1.ResourceBase.translate(resource_1.Resource.TOO_SMALL, lang)));
    }
    if (!(0, guards_1.isString)(body.institution) || body.institution.length < 1) {
        errors.push((0, errors_1.createValidationError)('institution', resourceService_1.ResourceBase.translate(resource_1.Resource.TOO_SMALL, lang)));
    }
    if (!(0, guards_1.isEnum)(body.type, enum_1.AccountType)) {
        errors.push((0, errors_1.createValidationError)('type', resourceService_1.ResourceBase.translate(resource_1.Resource.INVALID_ENUM, lang)));
    }
    if (body.observation !== undefined && !(0, guards_1.isString)(body.observation)) {
        errors.push((0, errors_1.createValidationError)('observation', resourceService_1.ResourceBase.translate(resource_1.Resource.INVALID_OBSERVATION_TYPE, lang)));
    }
    if (!(0, guards_1.isNumber)(body.user_id) || body.user_id <= 0) {
        errors.push((0, errors_1.createValidationError)('user_id', resourceService_1.ResourceBase.translate(resource_1.Resource.VALIDATION_ERROR, lang)));
    }
    if (body.active !== undefined && !(0, guards_1.isBoolean)(body.active)) {
        errors.push((0, errors_1.createValidationError)('active', resourceService_1.ResourceBase.translate(resource_1.Resource.INVALID_TYPE, lang)));
    }
    if (errors.length > 0) {
        return { success: false, errors };
    }
    return {
        success: true,
        data: {
            name: body.name,
            institution: body.institution,
            type: body.type,
            observation: body.observation,
            userId: body.user_id,
            active: body.active,
        }
    };
}
/**
 * Validates account update data.
 *
 * @summary Validates account update request data.
 * @param data - Request body data.
 * @param lang - Language code for error messages.
 * @returns Validation result with data or errors.
 */
function validateUpdateAccount(data, lang) {
    const errors = [];
    const result = {};
    if (!data || typeof data !== 'object') {
        return { success: false, errors: [(0, errors_1.createValidationError)('body', resourceService_1.ResourceBase.translate(resource_1.Resource.VALIDATION_ERROR, lang))] };
    }
    const body = data;
    if (body.name !== undefined) {
        if (!(0, guards_1.isString)(body.name) || body.name.length < 1) {
            errors.push((0, errors_1.createValidationError)('name', resourceService_1.ResourceBase.translate(resource_1.Resource.TOO_SMALL, lang)));
        }
        else {
            result.name = body.name;
        }
    }
    if (body.institution !== undefined) {
        if (!(0, guards_1.isString)(body.institution) || body.institution.length < 1) {
            errors.push((0, errors_1.createValidationError)('institution', resourceService_1.ResourceBase.translate(resource_1.Resource.TOO_SMALL, lang)));
        }
        else {
            result.institution = body.institution;
        }
    }
    if (body.type !== undefined) {
        if (!(0, guards_1.isEnum)(body.type, enum_1.AccountType)) {
            errors.push((0, errors_1.createValidationError)('type', resourceService_1.ResourceBase.translate(resource_1.Resource.INVALID_ENUM, lang)));
        }
        else {
            result.type = body.type;
        }
    }
    if (body.observation !== undefined && body.observation !== null) {
        if (!(0, guards_1.isString)(body.observation)) {
            errors.push((0, errors_1.createValidationError)('observation', resourceService_1.ResourceBase.translate(resource_1.Resource.INVALID_OBSERVATION_TYPE, lang)));
        }
        else {
            result.observation = body.observation;
        }
    }
    if (body.user_id !== undefined) {
        if (!(0, guards_1.isNumber)(body.user_id) || body.user_id <= 0) {
            errors.push((0, errors_1.createValidationError)('user_id', resourceService_1.ResourceBase.translate(resource_1.Resource.VALIDATION_ERROR, lang)));
        }
        else {
            result.userId = body.user_id;
        }
    }
    if (body.active !== undefined && !(0, guards_1.isBoolean)(body.active)) {
        errors.push((0, errors_1.createValidationError)('active', resourceService_1.ResourceBase.translate(resource_1.Resource.INVALID_TYPE, lang)));
    }
    else if (body.active !== undefined) {
        result.active = body.active;
    }
    if (errors.length > 0) {
        return { success: false, errors };
    }
    return { success: true, data: result };
}
/**
 * Validates category creation data.
 *
 * @summary Validates category creation request data.
 * @param data - Request body data.
 * @param lang - Language code for error messages.
 * @returns Validation result with data or errors.
 */
function validateCreateCategory(data, lang) {
    const errors = [];
    if (!data || typeof data !== 'object') {
        return { success: false, errors: [(0, errors_1.createValidationError)('body', resourceService_1.ResourceBase.translate(resource_1.Resource.VALIDATION_ERROR, lang))] };
    }
    const body = data;
    if (!(0, guards_1.isString)(body.name) || body.name.length < 1) {
        errors.push((0, errors_1.createValidationError)('name', resourceService_1.ResourceBase.translate(resource_1.Resource.TOO_SMALL, lang)));
    }
    if (!(0, guards_1.isEnum)(body.type, enum_1.CategoryType)) {
        errors.push((0, errors_1.createValidationError)('type', resourceService_1.ResourceBase.translate(resource_1.Resource.INVALID_ENUM, lang)));
    }
    if (body.color !== undefined && !(0, guards_1.isEnum)(body.color, enum_1.CategoryColor)) {
        errors.push((0, errors_1.createValidationError)('color', resourceService_1.ResourceBase.translate(resource_1.Resource.INVALID_ENUM, lang)));
    }
    if (body.active !== undefined && !(0, guards_1.isBoolean)(body.active)) {
        errors.push((0, errors_1.createValidationError)('active', resourceService_1.ResourceBase.translate(resource_1.Resource.INVALID_TYPE, lang)));
    }
    if (!(0, guards_1.isNumber)(body.user_id) || body.user_id <= 0) {
        errors.push((0, errors_1.createValidationError)('user_id', resourceService_1.ResourceBase.translate(resource_1.Resource.VALIDATION_ERROR, lang)));
    }
    if (errors.length > 0) {
        return { success: false, errors };
    }
    return {
        success: true,
        data: {
            name: body.name,
            type: body.type,
            color: body.color,
            active: body.active,
            userId: body.user_id,
        }
    };
}
/**
 * Validates category update data.
 *
 * @summary Validates category update request data.
 * @param data - Request body data.
 * @param lang - Language code for error messages.
 * @returns Validation result with data or errors.
 */
function validateUpdateCategory(data, lang) {
    const errors = [];
    const result = {};
    if (!data || typeof data !== 'object') {
        return { success: false, errors: [(0, errors_1.createValidationError)('body', resourceService_1.ResourceBase.translate(resource_1.Resource.VALIDATION_ERROR, lang))] };
    }
    const body = data;
    if (body.name !== undefined) {
        if (!(0, guards_1.isString)(body.name) || body.name.length < 1) {
            errors.push((0, errors_1.createValidationError)('name', resourceService_1.ResourceBase.translate(resource_1.Resource.TOO_SMALL, lang)));
        }
        else {
            result.name = body.name;
        }
    }
    if (body.type !== undefined) {
        if (!(0, guards_1.isEnum)(body.type, enum_1.CategoryType)) {
            errors.push((0, errors_1.createValidationError)('type', resourceService_1.ResourceBase.translate(resource_1.Resource.INVALID_ENUM, lang)));
        }
        else {
            result.type = body.type;
        }
    }
    if (body.color !== undefined) {
        if (!(0, guards_1.isEnum)(body.color, enum_1.CategoryColor)) {
            errors.push((0, errors_1.createValidationError)('color', resourceService_1.ResourceBase.translate(resource_1.Resource.INVALID_ENUM, lang)));
        }
        else {
            result.color = body.color;
        }
    }
    if (body.active !== undefined && !(0, guards_1.isBoolean)(body.active)) {
        errors.push((0, errors_1.createValidationError)('active', resourceService_1.ResourceBase.translate(resource_1.Resource.INVALID_TYPE, lang)));
    }
    else if (body.active !== undefined) {
        result.active = body.active;
    }
    if (body.user_id !== undefined) {
        if (!(0, guards_1.isNumber)(body.user_id) || body.user_id <= 0) {
            errors.push((0, errors_1.createValidationError)('user_id', resourceService_1.ResourceBase.translate(resource_1.Resource.VALIDATION_ERROR, lang)));
        }
        else {
            result.userId = body.user_id;
        }
    }
    if (errors.length > 0) {
        return { success: false, errors };
    }
    return { success: true, data: result };
}
/**
 * Validates subcategory creation data.
 *
 * @summary Validates subcategory creation request data.
 * @param data - Request body data.
 * @param lang - Language code for error messages.
 * @returns Validation result with data or errors.
 */
function validateCreateSubcategory(data, lang) {
    const errors = [];
    if (!data || typeof data !== 'object') {
        return { success: false, errors: [(0, errors_1.createValidationError)('body', resourceService_1.ResourceBase.translate(resource_1.Resource.VALIDATION_ERROR, lang))] };
    }
    const body = data;
    if (!(0, guards_1.isString)(body.name) || body.name.length < 1) {
        errors.push((0, errors_1.createValidationError)('name', resourceService_1.ResourceBase.translate(resource_1.Resource.TOO_SMALL, lang)));
    }
    if (!(0, guards_1.isNumber)(body.category_id) || body.category_id <= 0) {
        errors.push((0, errors_1.createValidationError)('category_id', resourceService_1.ResourceBase.translate(resource_1.Resource.VALIDATION_ERROR, lang)));
    }
    if (body.active !== undefined && !(0, guards_1.isBoolean)(body.active)) {
        errors.push((0, errors_1.createValidationError)('active', resourceService_1.ResourceBase.translate(resource_1.Resource.INVALID_TYPE, lang)));
    }
    if (errors.length > 0) {
        return { success: false, errors };
    }
    return {
        success: true,
        data: {
            name: body.name,
            categoryId: body.category_id,
            active: body.active,
        }
    };
}
/**
 * Validates subcategory update data.
 *
 * @summary Validates subcategory update request data.
 * @param data - Request body data.
 * @param lang - Language code for error messages.
 * @returns Validation result with data or errors.
 */
function validateUpdateSubcategory(data, lang) {
    const errors = [];
    const result = {};
    if (!data || typeof data !== 'object') {
        return { success: false, errors: [(0, errors_1.createValidationError)('body', resourceService_1.ResourceBase.translate(resource_1.Resource.VALIDATION_ERROR, lang))] };
    }
    const body = data;
    if (body.name !== undefined) {
        if (!(0, guards_1.isString)(body.name) || body.name.length < 1) {
            errors.push((0, errors_1.createValidationError)('name', resourceService_1.ResourceBase.translate(resource_1.Resource.TOO_SMALL, lang)));
        }
        else {
            result.name = body.name;
        }
    }
    if (body.category_id !== undefined) {
        if (!(0, guards_1.isNumber)(body.category_id) || body.category_id <= 0) {
            errors.push((0, errors_1.createValidationError)('category_id', resourceService_1.ResourceBase.translate(resource_1.Resource.VALIDATION_ERROR, lang)));
        }
        else {
            result.categoryId = body.category_id;
        }
    }
    if (body.active !== undefined && !(0, guards_1.isBoolean)(body.active)) {
        errors.push((0, errors_1.createValidationError)('active', resourceService_1.ResourceBase.translate(resource_1.Resource.INVALID_TYPE, lang)));
    }
    else if (body.active !== undefined) {
        result.active = body.active;
    }
    if (errors.length > 0) {
        return { success: false, errors };
    }
    return { success: true, data: result };
}
/**
 * Validates credit card creation data.
 *
 * @summary Validates credit card creation request data.
 * @param data - Request body data.
 * @param lang - Language code for error messages.
 * @returns Validation result with data or errors.
 */
function validateCreateCreditCard(data, lang) {
    const errors = [];
    if (!data || typeof data !== 'object') {
        return { success: false, errors: [(0, errors_1.createValidationError)('body', resourceService_1.ResourceBase.translate(resource_1.Resource.VALIDATION_ERROR, lang))] };
    }
    const body = data;
    if (!(0, guards_1.isString)(body.name) || body.name.length < 1) {
        errors.push((0, errors_1.createValidationError)('name', resourceService_1.ResourceBase.translate(resource_1.Resource.TOO_SMALL, lang)));
    }
    if (!(0, guards_1.isEnum)(body.flag, enum_1.CreditCardFlag)) {
        errors.push((0, errors_1.createValidationError)('flag', resourceService_1.ResourceBase.translate(resource_1.Resource.INVALID_ENUM, lang)));
    }
    if (body.observation !== undefined && !(0, guards_1.isString)(body.observation)) {
        errors.push((0, errors_1.createValidationError)('observation', resourceService_1.ResourceBase.translate(resource_1.Resource.INVALID_OBSERVATION_TYPE, lang)));
    }
    if (!(0, guards_1.isNumber)(body.user_id) || body.user_id <= 0) {
        errors.push((0, errors_1.createValidationError)('user_id', resourceService_1.ResourceBase.translate(resource_1.Resource.VALIDATION_ERROR, lang)));
    }
    if (body.account_id !== undefined && (!(0, guards_1.isNumber)(body.account_id) || body.account_id <= 0)) {
        errors.push((0, errors_1.createValidationError)('account_id', resourceService_1.ResourceBase.translate(resource_1.Resource.VALIDATION_ERROR, lang)));
    }
    if (body.active !== undefined && !(0, guards_1.isBoolean)(body.active)) {
        errors.push((0, errors_1.createValidationError)('active', resourceService_1.ResourceBase.translate(resource_1.Resource.INVALID_TYPE, lang)));
    }
    if (errors.length > 0) {
        return { success: false, errors };
    }
    return {
        success: true,
        data: {
            name: body.name,
            flag: body.flag,
            observation: body.observation,
            userId: body.user_id,
            accountId: body.account_id,
            active: body.active,
        }
    };
}
/**
 * Validates credit card update data.
 *
 * @summary Validates credit card update request data.
 * @param data - Request body data.
 * @param lang - Language code for error messages.
 * @returns Validation result with data or errors.
 */
function validateUpdateCreditCard(data, lang) {
    const errors = [];
    const result = {};
    if (!data || typeof data !== 'object') {
        return { success: false, errors: [(0, errors_1.createValidationError)('body', resourceService_1.ResourceBase.translate(resource_1.Resource.VALIDATION_ERROR, lang))] };
    }
    const body = data;
    if (body.name !== undefined) {
        if (!(0, guards_1.isString)(body.name) || body.name.length < 1) {
            errors.push((0, errors_1.createValidationError)('name', resourceService_1.ResourceBase.translate(resource_1.Resource.TOO_SMALL, lang)));
        }
        else {
            result.name = body.name;
        }
    }
    if (body.flag !== undefined) {
        if (!(0, guards_1.isEnum)(body.flag, enum_1.CreditCardFlag)) {
            errors.push((0, errors_1.createValidationError)('flag', resourceService_1.ResourceBase.translate(resource_1.Resource.INVALID_ENUM, lang)));
        }
        else {
            result.flag = body.flag;
        }
    }
    if (body.observation !== undefined && body.observation !== null) {
        if (!(0, guards_1.isString)(body.observation)) {
            errors.push((0, errors_1.createValidationError)('observation', resourceService_1.ResourceBase.translate(resource_1.Resource.INVALID_OBSERVATION_TYPE, lang)));
        }
        else {
            result.observation = body.observation;
        }
    }
    if (body.user_id !== undefined) {
        if (!(0, guards_1.isNumber)(body.user_id) || body.user_id <= 0) {
            errors.push((0, errors_1.createValidationError)('user_id', resourceService_1.ResourceBase.translate(resource_1.Resource.VALIDATION_ERROR, lang)));
        }
        else {
            result.userId = body.user_id;
        }
    }
    if (body.account_id !== undefined && body.account_id !== null) {
        if (!(0, guards_1.isNumber)(body.account_id) || body.account_id <= 0) {
            errors.push((0, errors_1.createValidationError)('account_id', resourceService_1.ResourceBase.translate(resource_1.Resource.VALIDATION_ERROR, lang)));
        }
        else {
            result.accountId = body.account_id;
        }
    }
    if (body.active !== undefined && !(0, guards_1.isBoolean)(body.active)) {
        errors.push((0, errors_1.createValidationError)('active', resourceService_1.ResourceBase.translate(resource_1.Resource.INVALID_TYPE, lang)));
    }
    else if (body.active !== undefined) {
        result.active = body.active;
    }
    if (errors.length > 0) {
        return { success: false, errors };
    }
    return { success: true, data: result };
}
/**
 * Validates transaction creation data.
 *
 * @summary Validates transaction creation request data.
 * @param data - Request body data.
 * @param lang - Language code for error messages.
 * @returns Validation result with data or errors.
 */
function validateCreateTransaction(data, lang) {
    const errors = [];
    if (!data || typeof data !== 'object') {
        return { success: false, errors: [(0, errors_1.createValidationError)('body', resourceService_1.ResourceBase.translate(resource_1.Resource.VALIDATION_ERROR, lang))] };
    }
    const body = data;
    if (!(0, guards_1.isNumber)(body.value) || body.value <= 0) {
        errors.push((0, errors_1.createValidationError)('value', resourceService_1.ResourceBase.translate(resource_1.Resource.TOO_SMALL, lang)));
    }
    if (!(0, guards_1.isDate)(body.date)) {
        errors.push((0, errors_1.createValidationError)('date', resourceService_1.ResourceBase.translate(resource_1.Resource.INVALID_DATE_FORMAT, lang)));
    }
    if (body.category_id !== undefined && body.category_id !== null && (!(0, guards_1.isNumber)(body.category_id) || body.category_id <= 0)) {
        errors.push((0, errors_1.createValidationError)('category_id', resourceService_1.ResourceBase.translate(resource_1.Resource.VALIDATION_ERROR, lang)));
    }
    if (body.subcategory_id !== undefined && body.subcategory_id !== null && (!(0, guards_1.isNumber)(body.subcategory_id) || body.subcategory_id <= 0)) {
        errors.push((0, errors_1.createValidationError)('subcategory_id', resourceService_1.ResourceBase.translate(resource_1.Resource.VALIDATION_ERROR, lang)));
    }
    if (!body.category_id && !body.subcategory_id) {
        errors.push((0, errors_1.createValidationError)('category_id', resourceService_1.ResourceBase.translate(resource_1.Resource.CATEGORY_OR_SUBCATEGORY_REQUIRED, lang)));
        errors.push((0, errors_1.createValidationError)('subcategory_id', resourceService_1.ResourceBase.translate(resource_1.Resource.CATEGORY_OR_SUBCATEGORY_REQUIRED, lang)));
    }
    if (!(0, guards_1.isEnum)(body.transactionType, enum_1.TransactionType)) {
        errors.push((0, errors_1.createValidationError)('transactionType', resourceService_1.ResourceBase.translate(resource_1.Resource.INVALID_ENUM, lang)));
    }
    if (!(0, guards_1.isEnum)(body.transactionSource, enum_1.TransactionSource)) {
        errors.push((0, errors_1.createValidationError)('transactionSource', resourceService_1.ResourceBase.translate(resource_1.Resource.INVALID_ENUM, lang)));
    }
    if (!(0, guards_1.isBoolean)(body.isInstallment)) {
        errors.push((0, errors_1.createValidationError)('isInstallment', resourceService_1.ResourceBase.translate(resource_1.Resource.INVALID_TYPE, lang)));
    }
    if (body.isInstallment && (!(0, guards_1.isNumber)(body.totalMonths) || body.totalMonths <= 0)) {
        errors.push((0, errors_1.createValidationError)('totalMonths', resourceService_1.ResourceBase.translate(resource_1.Resource.TOTAL_MONTHS_REQUIRED, lang)));
    }
    if (!(0, guards_1.isBoolean)(body.isRecurring)) {
        errors.push((0, errors_1.createValidationError)('isRecurring', resourceService_1.ResourceBase.translate(resource_1.Resource.INVALID_TYPE, lang)));
    }
    if (body.isRecurring && (!(0, guards_1.isNumber)(body.paymentDay) || body.paymentDay < 1 || body.paymentDay > 31)) {
        errors.push((0, errors_1.createValidationError)('paymentDay', resourceService_1.ResourceBase.translate(resource_1.Resource.PAYMENT_DAY_REQUIRED, lang)));
    }
    if (body.transactionSource === enum_1.TransactionSource.ACCOUNT) {
        if (!(0, guards_1.isNumber)(body.account_id) || body.account_id <= 0) {
            errors.push((0, errors_1.createValidationError)('account_id', resourceService_1.ResourceBase.translate(resource_1.Resource.INVALID_ACCOUNT_ID, lang)));
        }
        if (body.creditCard_id !== undefined) {
            errors.push((0, errors_1.createValidationError)('creditCard_id', resourceService_1.ResourceBase.translate(resource_1.Resource.INVALID_CREDIT_CARD_ID, lang)));
        }
    }
    else if (body.transactionSource === enum_1.TransactionSource.CREDIT_CARD) {
        if (!(0, guards_1.isNumber)(body.creditCard_id) || body.creditCard_id <= 0) {
            errors.push((0, errors_1.createValidationError)('creditCard_id', resourceService_1.ResourceBase.translate(resource_1.Resource.INVALID_CREDIT_CARD_ID, lang)));
        }
        if (body.account_id !== undefined) {
            errors.push((0, errors_1.createValidationError)('account_id', resourceService_1.ResourceBase.translate(resource_1.Resource.INVALID_ACCOUNT_ID, lang)));
        }
    }
    if (body.observation !== undefined && !(0, guards_1.isString)(body.observation)) {
        errors.push((0, errors_1.createValidationError)('observation', resourceService_1.ResourceBase.translate(resource_1.Resource.INVALID_OBSERVATION_TYPE, lang)));
    }
    if (body.active !== undefined && !(0, guards_1.isBoolean)(body.active)) {
        errors.push((0, errors_1.createValidationError)('active', resourceService_1.ResourceBase.translate(resource_1.Resource.INVALID_TYPE, lang)));
    }
    if (errors.length > 0) {
        return { success: false, errors };
    }
    const dateValue = body.date instanceof Date ? body.date : new Date(body.date);
    return {
        success: true,
        data: {
            value: body.value,
            date: dateValue,
            categoryId: body.category_id,
            subcategoryId: body.subcategory_id,
            observation: body.observation,
            transactionType: body.transactionType,
            transactionSource: body.transactionSource,
            isInstallment: body.isInstallment,
            totalMonths: body.totalMonths,
            isRecurring: body.isRecurring,
            paymentDay: body.paymentDay,
            accountId: body.account_id,
            creditCardId: body.creditCard_id,
            active: body.active,
        }
    };
}
/**
 * Validates transaction update data.
 *
 * @summary Validates transaction update request data.
 * @param data - Request body data.
 * @param lang - Language code for error messages.
 * @returns Validation result with data or errors.
 */
function validateUpdateTransaction(data, lang) {
    const errors = [];
    const result = {};
    if (!data || typeof data !== 'object') {
        return { success: false, errors: [(0, errors_1.createValidationError)('body', resourceService_1.ResourceBase.translate(resource_1.Resource.VALIDATION_ERROR, lang))] };
    }
    const body = data;
    if (body.value !== undefined) {
        if (!(0, guards_1.isNumber)(body.value) || body.value <= 0) {
            errors.push((0, errors_1.createValidationError)('value', resourceService_1.ResourceBase.translate(resource_1.Resource.TOO_SMALL, lang)));
        }
        else {
            result.value = body.value;
        }
    }
    if (body.date !== undefined) {
        if (!(0, guards_1.isDate)(body.date)) {
            errors.push((0, errors_1.createValidationError)('date', resourceService_1.ResourceBase.translate(resource_1.Resource.INVALID_DATE_FORMAT, lang)));
        }
        else {
            result.date = body.date instanceof Date ? body.date : new Date(body.date);
        }
    }
    if (body.category_id !== undefined && body.category_id !== null) {
        if (!(0, guards_1.isNumber)(body.category_id) || body.category_id <= 0) {
            errors.push((0, errors_1.createValidationError)('category_id', resourceService_1.ResourceBase.translate(resource_1.Resource.VALIDATION_ERROR, lang)));
        }
        else {
            result.categoryId = body.category_id;
        }
    }
    if (body.subcategory_id !== undefined && body.subcategory_id !== null) {
        if (!(0, guards_1.isNumber)(body.subcategory_id) || body.subcategory_id <= 0) {
            errors.push((0, errors_1.createValidationError)('subcategory_id', resourceService_1.ResourceBase.translate(resource_1.Resource.VALIDATION_ERROR, lang)));
        }
        else {
            result.subcategoryId = body.subcategory_id;
        }
    }
    if (body.transactionType !== undefined) {
        if (!(0, guards_1.isEnum)(body.transactionType, enum_1.TransactionType)) {
            errors.push((0, errors_1.createValidationError)('transactionType', resourceService_1.ResourceBase.translate(resource_1.Resource.INVALID_ENUM, lang)));
        }
        else {
            result.transactionType = body.transactionType;
        }
    }
    if (body.transactionSource !== undefined) {
        if (!(0, guards_1.isEnum)(body.transactionSource, enum_1.TransactionSource)) {
            errors.push((0, errors_1.createValidationError)('transactionSource', resourceService_1.ResourceBase.translate(resource_1.Resource.INVALID_ENUM, lang)));
        }
        else {
            result.transactionSource = body.transactionSource;
        }
    }
    if (body.isInstallment !== undefined) {
        if (!(0, guards_1.isBoolean)(body.isInstallment)) {
            errors.push((0, errors_1.createValidationError)('isInstallment', resourceService_1.ResourceBase.translate(resource_1.Resource.INVALID_TYPE, lang)));
        }
        else {
            result.isInstallment = body.isInstallment;
        }
    }
    if (body.totalMonths !== undefined && body.totalMonths !== null) {
        if (!(0, guards_1.isNumber)(body.totalMonths) || body.totalMonths <= 0) {
            errors.push((0, errors_1.createValidationError)('totalMonths', resourceService_1.ResourceBase.translate(resource_1.Resource.VALIDATION_ERROR, lang)));
        }
        else {
            result.totalMonths = body.totalMonths;
        }
    }
    if (body.isRecurring !== undefined) {
        if (!(0, guards_1.isBoolean)(body.isRecurring)) {
            errors.push((0, errors_1.createValidationError)('isRecurring', resourceService_1.ResourceBase.translate(resource_1.Resource.INVALID_TYPE, lang)));
        }
        else {
            result.isRecurring = body.isRecurring;
        }
    }
    if (body.paymentDay !== undefined && body.paymentDay !== null) {
        if (!(0, guards_1.isNumber)(body.paymentDay) || body.paymentDay < 1 || body.paymentDay > 31) {
            errors.push((0, errors_1.createValidationError)('paymentDay', resourceService_1.ResourceBase.translate(resource_1.Resource.PAYMENT_DAY_OUT_OF_RANGE, lang)));
        }
        else {
            result.paymentDay = body.paymentDay;
        }
    }
    if (body.account_id !== undefined && body.account_id !== null) {
        if (!(0, guards_1.isNumber)(body.account_id) || body.account_id <= 0) {
            errors.push((0, errors_1.createValidationError)('account_id', resourceService_1.ResourceBase.translate(resource_1.Resource.INVALID_ACCOUNT_ID, lang)));
        }
        else {
            result.accountId = body.account_id;
        }
    }
    if (body.creditCard_id !== undefined && body.creditCard_id !== null) {
        if (!(0, guards_1.isNumber)(body.creditCard_id) || body.creditCard_id <= 0) {
            errors.push((0, errors_1.createValidationError)('creditCard_id', resourceService_1.ResourceBase.translate(resource_1.Resource.INVALID_CREDIT_CARD_ID, lang)));
        }
        else {
            result.creditCardId = body.creditCard_id;
        }
    }
    if (body.observation !== undefined && body.observation !== null) {
        if (!(0, guards_1.isString)(body.observation)) {
            errors.push((0, errors_1.createValidationError)('observation', resourceService_1.ResourceBase.translate(resource_1.Resource.INVALID_OBSERVATION_TYPE, lang)));
        }
        else {
            result.observation = body.observation;
        }
    }
    if (body.active !== undefined && !(0, guards_1.isBoolean)(body.active)) {
        errors.push((0, errors_1.createValidationError)('active', resourceService_1.ResourceBase.translate(resource_1.Resource.INVALID_TYPE, lang)));
    }
    else if (body.active !== undefined) {
        result.active = body.active;
    }
    if (errors.length > 0) {
        return { success: false, errors };
    }
    return { success: true, data: result };
}
