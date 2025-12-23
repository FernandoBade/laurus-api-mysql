import { isString, isNumber, isBoolean, isDate, isEnum, isValidEmail, hasMinLength } from './guards';
import { createValidationError, ValidationError } from './errors';
import { Theme, Language, Currency, DateFormat, Profile, AccountType, CategoryType, CategoryColor, CreditCardFlag, TransactionType, TransactionSource } from '../enum';
import { ResourceBase } from '../resources/languages/resourceService';
import { Resource } from '../resources/resource';
import { LanguageCode } from '../resources/resourceTypes';

/**
 * Validates user creation data.
 *
 * @summary Validates user creation request data.
 * @param data - Request body data.
 * @param lang - Language code for error messages.
 * @returns Validation result with data or errors.
 */
export function validateCreateUser(
    data: unknown,
    lang?: LanguageCode
): { success: true; data: { firstName: string; lastName: string; email: string; password: string; phone?: string; birthDate?: Date; theme?: Theme; language?: Language; currency?: Currency; dateFormat?: DateFormat; profile?: Profile; active?: boolean } } | { success: false; errors: ValidationError[] } {
    const errors: ValidationError[] = [];

    if (!data || typeof data !== 'object') {
        return { success: false, errors: [createValidationError('body', ResourceBase.translate(Resource.VALIDATION_ERROR, lang))] };
    }

    const body = data as Record<string, unknown>;

    if (!isString(body.firstName) || !hasMinLength(body.firstName, 2)) {
        errors.push(createValidationError('firstName', ResourceBase.translate(Resource.FIRST_NAME_TOO_SHORT, lang)));
    }

    if (!isString(body.lastName) || !hasMinLength(body.lastName, 2)) {
        errors.push(createValidationError('lastName', ResourceBase.translate(Resource.LAST_NAME_TOO_SHORT, lang)));
    }

    if (!isString(body.email) || !isValidEmail(body.email)) {
        errors.push(createValidationError('email', ResourceBase.translate(Resource.EMAIL_INVALID, lang)));
    }

    if (!isString(body.password) || !hasMinLength(body.password, 6)) {
        errors.push(createValidationError('password', ResourceBase.translate(Resource.PASSWORD_TOO_SHORT, lang)));
    }

    if (body.phone !== undefined && !isString(body.phone)) {
        errors.push(createValidationError('phone', ResourceBase.translate(Resource.INVALID_PHONE_TYPE, lang)));
    }

    if (body.birthDate !== undefined && !isDate(body.birthDate)) {
        errors.push(createValidationError('birthDate', ResourceBase.translate(Resource.INVALID_DATE_FORMAT, lang)));
    }

    if (body.theme !== undefined && !isEnum(body.theme, Theme)) {
        errors.push(createValidationError('theme', ResourceBase.translate(Resource.INVALID_THEME_VALUE, lang)));
    }

    if (body.language !== undefined && !isEnum(body.language, Language)) {
        errors.push(createValidationError('language', ResourceBase.translate(Resource.INVALID_LANGUAGE_VALUE, lang)));
    }

    if (body.currency !== undefined && !isEnum(body.currency, Currency)) {
        errors.push(createValidationError('currency', ResourceBase.translate(Resource.INVALID_CURRENCY_VALUE, lang)));
    }

    if (body.dateFormat !== undefined && !isEnum(body.dateFormat, DateFormat)) {
        errors.push(createValidationError('dateFormat', ResourceBase.translate(Resource.INVALID_DATE_FORMAT_VALUE, lang)));
    }

    if (body.profile !== undefined && !isEnum(body.profile, Profile)) {
        errors.push(createValidationError('profile', ResourceBase.translate(Resource.INVALID_PROFILE_VALUE, lang)));
    }

    if (body.active !== undefined && !isBoolean(body.active)) {
        errors.push(createValidationError('active', ResourceBase.translate(Resource.INVALID_ACTIVE_TYPE, lang)));
    }

    if (errors.length > 0) {
        return { success: false, errors };
    }

    return {
        success: true,
        data: {
            firstName: body.firstName as string,
            lastName: body.lastName as string,
            email: (body.email as string).toLowerCase().trim(),
            password: body.password as string,
            phone: body.phone as string | undefined,
            birthDate: body.birthDate ? new Date(body.birthDate as string) : undefined,
            theme: body.theme as Theme | undefined,
            language: body.language as Language | undefined,
            currency: body.currency as Currency | undefined,
            dateFormat: body.dateFormat as DateFormat | undefined,
            profile: body.profile as Profile | undefined,
            active: body.active as boolean | undefined,
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
export function validateUpdateUser(
    data: unknown,
    lang?: LanguageCode
): { success: true; data: Partial<{ firstName: string; lastName: string; email: string; password: string; phone?: string; birthDate?: Date; theme?: Theme; language?: Language; currency?: Currency; dateFormat?: DateFormat; profile?: Profile; active?: boolean }> } | { success: false; errors: ValidationError[] } {
    const errors: ValidationError[] = [];

    if (!data || typeof data !== 'object') {
        return { success: false, errors: [createValidationError('body', ResourceBase.translate(Resource.VALIDATION_ERROR, lang))] };
    }

    const body = data as Record<string, unknown>;
    const result: Record<string, unknown> = {};

    if (body.firstName !== undefined) {
        if (!isString(body.firstName) || !hasMinLength(body.firstName, 2)) {
            errors.push(createValidationError('firstName', ResourceBase.translate(Resource.FIRST_NAME_TOO_SHORT, lang)));
        } else {
            result.firstName = body.firstName;
        }
    }

    if (body.lastName !== undefined) {
        if (!isString(body.lastName) || !hasMinLength(body.lastName, 2)) {
            errors.push(createValidationError('lastName', ResourceBase.translate(Resource.LAST_NAME_TOO_SHORT, lang)));
        } else {
            result.lastName = body.lastName;
        }
    }

    if (body.email !== undefined) {
        if (!isString(body.email) || !isValidEmail(body.email)) {
            errors.push(createValidationError('email', ResourceBase.translate(Resource.EMAIL_INVALID, lang)));
        } else {
            result.email = (body.email as string).toLowerCase().trim();
        }
    }

    if (body.password !== undefined) {
        if (!isString(body.password) || !hasMinLength(body.password, 6)) {
            errors.push(createValidationError('password', ResourceBase.translate(Resource.PASSWORD_TOO_SHORT, lang)));
        } else {
            result.password = body.password;
        }
    }

    if (body.phone !== undefined && body.phone !== null) {
        if (!isString(body.phone)) {
            errors.push(createValidationError('phone', ResourceBase.translate(Resource.INVALID_PHONE_TYPE, lang)));
        } else {
            result.phone = body.phone;
        }
    }

    if (body.birthDate !== undefined && body.birthDate !== null) {
        if (!isDate(body.birthDate)) {
            errors.push(createValidationError('birthDate', ResourceBase.translate(Resource.INVALID_DATE_FORMAT, lang)));
        } else {
            result.birthDate = new Date(body.birthDate as string);
        }
    }

    if (body.theme !== undefined && !isEnum(body.theme, Theme)) {
        errors.push(createValidationError('theme', ResourceBase.translate(Resource.INVALID_THEME_VALUE, lang)));
    } else if (body.theme !== undefined) {
        result.theme = body.theme;
    }

    if (body.language !== undefined && !isEnum(body.language, Language)) {
        errors.push(createValidationError('language', ResourceBase.translate(Resource.INVALID_LANGUAGE_VALUE, lang)));
    } else if (body.language !== undefined) {
        result.language = body.language;
    }

    if (body.currency !== undefined && !isEnum(body.currency, Currency)) {
        errors.push(createValidationError('currency', ResourceBase.translate(Resource.INVALID_CURRENCY_VALUE, lang)));
    } else if (body.currency !== undefined) {
        result.currency = body.currency;
    }

    if (body.dateFormat !== undefined && !isEnum(body.dateFormat, DateFormat)) {
        errors.push(createValidationError('dateFormat', ResourceBase.translate(Resource.INVALID_DATE_FORMAT_VALUE, lang)));
    } else if (body.dateFormat !== undefined) {
        result.dateFormat = body.dateFormat;
    }

    if (body.profile !== undefined && !isEnum(body.profile, Profile)) {
        errors.push(createValidationError('profile', ResourceBase.translate(Resource.INVALID_PROFILE_VALUE, lang)));
    } else if (body.profile !== undefined) {
        result.profile = body.profile;
    }

    if (body.active !== undefined && !isBoolean(body.active)) {
        errors.push(createValidationError('active', ResourceBase.translate(Resource.INVALID_ACTIVE_TYPE, lang)));
    } else if (body.active !== undefined) {
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
export function validateCreateAccount(
    data: unknown,
    lang?: LanguageCode
): { success: true; data: { name: string; institution: string; type: AccountType; observation?: string; userId: number; active?: boolean } } | { success: false; errors: ValidationError[] } {
    const errors: ValidationError[] = [];

    if (!data || typeof data !== 'object') {
        return { success: false, errors: [createValidationError('body', ResourceBase.translate(Resource.VALIDATION_ERROR, lang))] };
    }

    const body = data as Record<string, unknown>;

    if (!isString(body.name) || body.name.length < 1) {
        errors.push(createValidationError('name', ResourceBase.translateWithParams(Resource.TOO_SMALL, lang, {
            path: 'name',
            min: 1
        })));
    }

    if (!isString(body.institution) || body.institution.length < 1) {
        errors.push(createValidationError('institution', ResourceBase.translateWithParams(Resource.TOO_SMALL, lang, {
            path: 'institution',
            min: 1
        })));
    }

    if (!isEnum(body.type, AccountType)) {
        errors.push(createValidationError('type', ResourceBase.translateWithParams(Resource.INVALID_ENUM, lang, {
            path: 'type',
            received: body.type === undefined ? 'undefined' : String(body.type),
            options: Object.values(AccountType).join(', ')
        })));
    }

    if (body.observation !== undefined && !isString(body.observation)) {
        errors.push(createValidationError('observation', ResourceBase.translate(Resource.INVALID_OBSERVATION_TYPE, lang)));
    }

    if (!isNumber(body.user_id) || body.user_id <= 0) {
        errors.push(createValidationError('user_id', ResourceBase.translate(Resource.VALIDATION_ERROR, lang)));
    }

    if (body.active !== undefined && !isBoolean(body.active)) {
        errors.push(createValidationError('active', ResourceBase.translateWithParams(Resource.INVALID_TYPE, lang, {
            path: 'active',
            expected: 'boolean',
            received: String(body.active)
        })));
    }

    if (errors.length > 0) {
        return { success: false, errors };
    }

    return {
        success: true,
        data: {
            name: body.name as string,
            institution: body.institution as string,
            type: body.type as AccountType,
            observation: body.observation as string | undefined,
            userId: body.user_id as number,
            active: body.active as boolean | undefined,
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
export function validateUpdateAccount(
    data: unknown,
    lang?: LanguageCode
): { success: true; data: Partial<{ name: string; institution: string; type: AccountType; observation?: string; userId: number; active?: boolean }> } | { success: false; errors: ValidationError[] } {
    const errors: ValidationError[] = [];
    const result: Record<string, unknown> = {};

    if (!data || typeof data !== 'object') {
        return { success: false, errors: [createValidationError('body', ResourceBase.translate(Resource.VALIDATION_ERROR, lang))] };
    }

    const body = data as Record<string, unknown>;

    if (body.name !== undefined) {
        if (!isString(body.name) || body.name.length < 1) {
            errors.push(createValidationError('name', ResourceBase.translateWithParams(Resource.TOO_SMALL, lang, {
                path: 'name',
                min: 1
            })));
        } else {
            result.name = body.name;
        }
    }

    if (body.institution !== undefined) {
        if (!isString(body.institution) || body.institution.length < 1) {
            errors.push(createValidationError('institution', ResourceBase.translateWithParams(Resource.TOO_SMALL, lang, {
                path: 'institution',
                min: 1
            })));
        } else {
            result.institution = body.institution;
        }
    }

    if (body.type !== undefined) {
        if (!isEnum(body.type, AccountType)) {
            errors.push(createValidationError('type', ResourceBase.translateWithParams(Resource.INVALID_ENUM, lang, {
                path: 'type',
                received: body.type === undefined ? 'undefined' : String(body.type),
                options: Object.values(AccountType).join(', ')
            })));
        } else {
            result.type = body.type;
        }
    }

    if (body.observation !== undefined && body.observation !== null) {
        if (!isString(body.observation)) {
            errors.push(createValidationError('observation', ResourceBase.translate(Resource.INVALID_OBSERVATION_TYPE, lang)));
        } else {
            result.observation = body.observation;
        }
    }

    if (body.user_id !== undefined) {
        if (!isNumber(body.user_id) || body.user_id <= 0) {
            errors.push(createValidationError('user_id', ResourceBase.translate(Resource.VALIDATION_ERROR, lang)));
        } else {
            result.userId = body.user_id;
        }
    }

    if (body.active !== undefined && !isBoolean(body.active)) {
        errors.push(createValidationError('active', ResourceBase.translateWithParams(Resource.INVALID_TYPE, lang, {
            path: 'active',
            expected: 'boolean',
            received: String(body.active)
        })));
    } else if (body.active !== undefined) {
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
export function validateCreateCategory(
    data: unknown,
    lang?: LanguageCode
): { success: true; data: { name: string; type: CategoryType; color?: CategoryColor; active?: boolean; userId: number } } | { success: false; errors: ValidationError[] } {
    const errors: ValidationError[] = [];

    if (!data || typeof data !== 'object') {
        return { success: false, errors: [createValidationError('body', ResourceBase.translate(Resource.VALIDATION_ERROR, lang))] };
    }

    const body = data as Record<string, unknown>;

    if (!isString(body.name) || body.name.length < 1) {
        errors.push(createValidationError('name', ResourceBase.translateWithParams(Resource.TOO_SMALL, lang, {
            path: 'name',
            min: 1
        })));
    }

    if (!isEnum(body.type, CategoryType)) {
        errors.push(createValidationError('type', ResourceBase.translateWithParams(Resource.INVALID_ENUM, lang, {
            path: 'type',
            received: body.type === undefined ? 'undefined' : String(body.type),
            options: Object.values(CategoryType).join(', ')
        })));
    }

    if (body.color !== undefined && !isEnum(body.color, CategoryColor)) {
        errors.push(createValidationError('color', ResourceBase.translateWithParams(Resource.INVALID_ENUM, lang, {
            path: 'color',
            received: body.color === undefined ? 'undefined' : String(body.color),
            options: Object.values(CategoryColor).join(', ')
        })));
    }

    if (body.active !== undefined && !isBoolean(body.active)) {
        errors.push(createValidationError('active', ResourceBase.translateWithParams(Resource.INVALID_TYPE, lang, {
            path: 'active',
            expected: 'boolean',
            received: String(body.active)
        })));
    }

    if (!isNumber(body.user_id) || body.user_id <= 0) {
        errors.push(createValidationError('user_id', ResourceBase.translate(Resource.VALIDATION_ERROR, lang)));
    }

    if (errors.length > 0) {
        return { success: false, errors };
    }

    return {
        success: true,
        data: {
            name: body.name as string,
            type: body.type as CategoryType,
            color: body.color as CategoryColor | undefined,
            active: body.active as boolean | undefined,
            userId: body.user_id as number,
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
export function validateUpdateCategory(
    data: unknown,
    lang?: LanguageCode
): { success: true; data: Partial<{ name: string; type: CategoryType; color?: CategoryColor; active?: boolean; userId: number }> } | { success: false; errors: ValidationError[] } {
    const errors: ValidationError[] = [];
    const result: Record<string, unknown> = {};

    if (!data || typeof data !== 'object') {
        return { success: false, errors: [createValidationError('body', ResourceBase.translate(Resource.VALIDATION_ERROR, lang))] };
    }

    const body = data as Record<string, unknown>;

    if (body.name !== undefined) {
        if (!isString(body.name) || body.name.length < 1) {
            errors.push(createValidationError('name', ResourceBase.translateWithParams(Resource.TOO_SMALL, lang, {
                path: 'name',
                min: 1
            })));
        } else {
            result.name = body.name;
        }
    }

    if (body.type !== undefined) {
        if (!isEnum(body.type, CategoryType)) {
            errors.push(createValidationError('type', ResourceBase.translateWithParams(Resource.INVALID_ENUM, lang, {
                path: 'type',
                received: body.type === undefined ? 'undefined' : String(body.type),
                options: Object.values(CategoryType).join(', ')
            })));
        } else {
            result.type = body.type;
        }
    }

    if (body.color !== undefined) {
        if (!isEnum(body.color, CategoryColor)) {
            errors.push(createValidationError('color', ResourceBase.translateWithParams(Resource.INVALID_ENUM, lang, {
                path: 'color',
                received: body.color === undefined ? 'undefined' : String(body.color),
                options: Object.values(CategoryColor).join(', ')
            })));
        } else {
            result.color = body.color;
        }
    }

    if (body.active !== undefined && !isBoolean(body.active)) {
        errors.push(createValidationError('active', ResourceBase.translateWithParams(Resource.INVALID_TYPE, lang, {
            path: 'active',
            expected: 'boolean',
            received: String(body.active)
        })));
    } else if (body.active !== undefined) {
        result.active = body.active;
    }

    if (body.user_id !== undefined) {
        if (!isNumber(body.user_id) || body.user_id <= 0) {
            errors.push(createValidationError('user_id', ResourceBase.translate(Resource.VALIDATION_ERROR, lang)));
        } else {
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
export function validateCreateSubcategory(
    data: unknown,
    lang?: LanguageCode
): { success: true; data: { name: string; categoryId: number; active?: boolean } } | { success: false; errors: ValidationError[] } {
    const errors: ValidationError[] = [];

    if (!data || typeof data !== 'object') {
        return { success: false, errors: [createValidationError('body', ResourceBase.translate(Resource.VALIDATION_ERROR, lang))] };
    }

    const body = data as Record<string, unknown>;

    if (!isString(body.name) || body.name.length < 1) {
        errors.push(createValidationError('name', ResourceBase.translateWithParams(Resource.TOO_SMALL, lang, {
            path: 'name',
            min: 1
        })));
    }

    if (!isNumber(body.category_id) || body.category_id <= 0) {
        errors.push(createValidationError('category_id', ResourceBase.translate(Resource.VALIDATION_ERROR, lang)));
    }

    if (body.active !== undefined && !isBoolean(body.active)) {
        errors.push(createValidationError('active', ResourceBase.translateWithParams(Resource.INVALID_TYPE, lang, {
            path: 'active',
            expected: 'boolean',
            received: String(body.active)
        })));
    }

    if (errors.length > 0) {
        return { success: false, errors };
    }

    return {
        success: true,
        data: {
            name: body.name as string,
            categoryId: body.category_id as number,
            active: body.active as boolean | undefined,
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
export function validateUpdateSubcategory(
    data: unknown,
    lang?: LanguageCode
): { success: true; data: Partial<{ name: string; categoryId: number; active?: boolean }> } | { success: false; errors: ValidationError[] } {
    const errors: ValidationError[] = [];
    const result: Record<string, unknown> = {};

    if (!data || typeof data !== 'object') {
        return { success: false, errors: [createValidationError('body', ResourceBase.translate(Resource.VALIDATION_ERROR, lang))] };
    }

    const body = data as Record<string, unknown>;

    if (body.name !== undefined) {
        if (!isString(body.name) || body.name.length < 1) {
            errors.push(createValidationError('name', ResourceBase.translateWithParams(Resource.TOO_SMALL, lang, {
                path: 'name',
                min: 1
            })));
        } else {
            result.name = body.name;
        }
    }

    if (body.category_id !== undefined) {
        if (!isNumber(body.category_id) || body.category_id <= 0) {
            errors.push(createValidationError('category_id', ResourceBase.translate(Resource.VALIDATION_ERROR, lang)));
        } else {
            result.categoryId = body.category_id;
        }
    }

    if (body.active !== undefined && !isBoolean(body.active)) {
        errors.push(createValidationError('active', ResourceBase.translate(Resource.INVALID_TYPE, lang)));
    } else if (body.active !== undefined) {
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
export function validateCreateCreditCard(
    data: unknown,
    lang?: LanguageCode
): { success: true; data: { name: string; flag: CreditCardFlag; observation?: string; userId: number; accountId?: number; active?: boolean } } | { success: false; errors: ValidationError[] } {
    const errors: ValidationError[] = [];

    if (!data || typeof data !== 'object') {
        return { success: false, errors: [createValidationError('body', ResourceBase.translate(Resource.VALIDATION_ERROR, lang))] };
    }

    const body = data as Record<string, unknown>;

    if (!isString(body.name) || body.name.length < 1) {
        errors.push(createValidationError('name', ResourceBase.translateWithParams(Resource.TOO_SMALL, lang, {
            path: 'name',
            min: 1
        })));
    }

    if (!isEnum(body.flag, CreditCardFlag)) {
        errors.push(createValidationError('flag', ResourceBase.translateWithParams(Resource.INVALID_ENUM, lang, {
            path: 'flag',
            received: body.flag === undefined ? 'undefined' : String(body.flag),
            options: Object.values(CreditCardFlag).join(', ')
        })));
    }

    if (body.observation !== undefined && !isString(body.observation)) {
        errors.push(createValidationError('observation', ResourceBase.translate(Resource.INVALID_OBSERVATION_TYPE, lang)));
    }

    if (!isNumber(body.user_id) || body.user_id <= 0) {
        errors.push(createValidationError('user_id', ResourceBase.translate(Resource.VALIDATION_ERROR, lang)));
    }

    if (body.account_id !== undefined && (!isNumber(body.account_id) || body.account_id <= 0)) {
        errors.push(createValidationError('account_id', ResourceBase.translate(Resource.VALIDATION_ERROR, lang)));
    }

    if (body.active !== undefined && !isBoolean(body.active)) {
        errors.push(createValidationError('active', ResourceBase.translate(Resource.INVALID_TYPE, lang)));
    }

    if (errors.length > 0) {
        return { success: false, errors };
    }

    return {
        success: true,
        data: {
            name: body.name as string,
            flag: body.flag as CreditCardFlag,
            observation: body.observation as string | undefined,
            userId: body.user_id as number,
            accountId: body.account_id as number | undefined,
            active: body.active as boolean | undefined,
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
export function validateUpdateCreditCard(
    data: unknown,
    lang?: LanguageCode
): { success: true; data: Partial<{ name: string; flag: CreditCardFlag; observation?: string; userId: number; accountId?: number; active?: boolean }> } | { success: false; errors: ValidationError[] } {
    const errors: ValidationError[] = [];
    const result: Record<string, unknown> = {};

    if (!data || typeof data !== 'object') {
        return { success: false, errors: [createValidationError('body', ResourceBase.translate(Resource.VALIDATION_ERROR, lang))] };
    }

    const body = data as Record<string, unknown>;

    if (body.name !== undefined) {
        if (!isString(body.name) || body.name.length < 1) {
            errors.push(createValidationError('name', ResourceBase.translateWithParams(Resource.TOO_SMALL, lang, {
                path: 'name',
                min: 1
            })));
        } else {
            result.name = body.name;
        }
    }

    if (body.flag !== undefined) {
        if (!isEnum(body.flag, CreditCardFlag)) {
            errors.push(createValidationError('flag', ResourceBase.translateWithParams(Resource.INVALID_ENUM, lang, {
                path: 'flag',
                received: body.flag === undefined ? 'undefined' : String(body.flag),
                options: Object.values(CreditCardFlag).join(', ')
            })));
        } else {
            result.flag = body.flag;
        }
    }

    if (body.observation !== undefined && body.observation !== null) {
        if (!isString(body.observation)) {
            errors.push(createValidationError('observation', ResourceBase.translate(Resource.INVALID_OBSERVATION_TYPE, lang)));
        } else {
            result.observation = body.observation;
        }
    }

    if (body.user_id !== undefined) {
        if (!isNumber(body.user_id) || body.user_id <= 0) {
            errors.push(createValidationError('user_id', ResourceBase.translate(Resource.VALIDATION_ERROR, lang)));
        } else {
            result.userId = body.user_id;
        }
    }

    if (body.account_id !== undefined && body.account_id !== null) {
        if (!isNumber(body.account_id) || body.account_id <= 0) {
            errors.push(createValidationError('account_id', ResourceBase.translate(Resource.VALIDATION_ERROR, lang)));
        } else {
            result.accountId = body.account_id;
        }
    }

    if (body.active !== undefined && !isBoolean(body.active)) {
        errors.push(createValidationError('active', ResourceBase.translate(Resource.INVALID_TYPE, lang)));
    } else if (body.active !== undefined) {
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
export function validateCreateTransaction(
    data: unknown,
    lang?: LanguageCode
): { success: true; data: { value: number; date: Date; categoryId?: number; subcategoryId?: number; observation?: string; transactionType: TransactionType; transactionSource: TransactionSource; isInstallment: boolean; totalMonths?: number; isRecurring: boolean; paymentDay?: number; accountId?: number; creditCardId?: number; active?: boolean } } | { success: false; errors: ValidationError[] } {
    const errors: ValidationError[] = [];

    if (!data || typeof data !== 'object') {
        return { success: false, errors: [createValidationError('body', ResourceBase.translate(Resource.VALIDATION_ERROR, lang))] };
    }

    const body = data as Record<string, unknown>;

    if (!isNumber(body.value) || body.value <= 0) {
        errors.push(createValidationError('value', ResourceBase.translateWithParams(Resource.TOO_SMALL, lang, {
            path: 'value',
            min: 1
        })));
    }

    if (!isDate(body.date)) {
        errors.push(createValidationError('date', ResourceBase.translate(Resource.INVALID_DATE_FORMAT, lang)));
    }

    if (body.category_id !== undefined && body.category_id !== null && (!isNumber(body.category_id) || body.category_id <= 0)) {
        errors.push(createValidationError('category_id', ResourceBase.translate(Resource.VALIDATION_ERROR, lang)));
    }

    if (body.subcategory_id !== undefined && body.subcategory_id !== null && (!isNumber(body.subcategory_id) || body.subcategory_id <= 0)) {
        errors.push(createValidationError('subcategory_id', ResourceBase.translate(Resource.VALIDATION_ERROR, lang)));
    }

    if (!body.category_id && !body.subcategory_id) {
        errors.push(createValidationError('category_id', ResourceBase.translate(Resource.CATEGORY_OR_SUBCATEGORY_REQUIRED, lang)));
        errors.push(createValidationError('subcategory_id', ResourceBase.translate(Resource.CATEGORY_OR_SUBCATEGORY_REQUIRED, lang)));
    }

    if (!isEnum(body.transactionType, TransactionType)) {
        errors.push(createValidationError('transactionType', ResourceBase.translateWithParams(Resource.INVALID_ENUM, lang, {
            path: 'transactionType',
            received: body.transactionType === undefined ? 'undefined' : String(body.transactionType),
            options: Object.values(TransactionType).join(', ')
        })));
    }

    if (!isEnum(body.transactionSource, TransactionSource)) {
        errors.push(createValidationError('transactionSource', ResourceBase.translateWithParams(Resource.INVALID_ENUM, lang, {
            path: 'transactionSource',
            received: body.transactionSource === undefined ? 'undefined' : String(body.transactionSource),
            options: Object.values(TransactionSource).join(', ')
        })));
    }

    if (!isBoolean(body.isInstallment)) {
        errors.push(createValidationError('isInstallment', ResourceBase.translateWithParams(Resource.INVALID_TYPE, lang, {
            path: 'isInstallment',
            expected: 'boolean',
            received: String(body.isInstallment)
        })));
    }

    if (body.isInstallment && (!isNumber(body.totalMonths) || body.totalMonths <= 0)) {
        errors.push(createValidationError('totalMonths', ResourceBase.translate(Resource.TOTAL_MONTHS_REQUIRED, lang)));
    }

    if (!isBoolean(body.isRecurring)) {
        errors.push(createValidationError('isRecurring', ResourceBase.translateWithParams(Resource.INVALID_TYPE, lang, {
            path: 'isRecurring',
            expected: 'boolean',
            received: String(body.isRecurring)
        })));
    }

    if (body.isRecurring && (!isNumber(body.paymentDay) || body.paymentDay < 1 || body.paymentDay > 31)) {
        errors.push(createValidationError('paymentDay', ResourceBase.translate(Resource.PAYMENT_DAY_REQUIRED, lang)));
    }

    if (body.transactionSource === TransactionSource.ACCOUNT) {
        if (!isNumber(body.account_id) || body.account_id <= 0) {
            errors.push(createValidationError('account_id', ResourceBase.translate(Resource.INVALID_ACCOUNT_ID, lang)));
        }
        if (body.creditCard_id !== undefined) {
            errors.push(createValidationError('creditCard_id', ResourceBase.translate(Resource.INVALID_CREDIT_CARD_ID, lang)));
        }
    } else if (body.transactionSource === TransactionSource.CREDIT_CARD) {
        if (!isNumber(body.creditCard_id) || body.creditCard_id <= 0) {
            errors.push(createValidationError('creditCard_id', ResourceBase.translate(Resource.INVALID_CREDIT_CARD_ID, lang)));
        }
        if (body.account_id !== undefined) {
            errors.push(createValidationError('account_id', ResourceBase.translate(Resource.INVALID_ACCOUNT_ID, lang)));
        }
    }

    if (body.observation !== undefined && !isString(body.observation)) {
        errors.push(createValidationError('observation', ResourceBase.translate(Resource.INVALID_OBSERVATION_TYPE, lang)));
    }

    if (body.active !== undefined && !isBoolean(body.active)) {
        errors.push(createValidationError('active', ResourceBase.translate(Resource.INVALID_TYPE, lang)));
    }

    if (errors.length > 0) {
        return { success: false, errors };
    }

    const dateValue = body.date instanceof Date ? body.date : new Date(body.date as string);

    return {
        success: true,
        data: {
            value: body.value as number,
            date: dateValue,
            categoryId: body.category_id as number | undefined,
            subcategoryId: body.subcategory_id as number | undefined,
            observation: body.observation as string | undefined,
            transactionType: body.transactionType as TransactionType,
            transactionSource: body.transactionSource as TransactionSource,
            isInstallment: body.isInstallment as boolean,
            totalMonths: body.totalMonths as number | undefined,
            isRecurring: body.isRecurring as boolean,
            paymentDay: body.paymentDay as number | undefined,
            accountId: body.account_id as number | undefined,
            creditCardId: body.creditCard_id as number | undefined,
            active: body.active as boolean | undefined,
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
export function validateUpdateTransaction(
    data: unknown,
    lang?: LanguageCode
): { success: true; data: Partial<{ value: number; date: Date; categoryId?: number; subcategoryId?: number; observation?: string; transactionType: TransactionType; transactionSource: TransactionSource; isInstallment: boolean; totalMonths?: number; isRecurring: boolean; paymentDay?: number; accountId?: number; creditCardId?: number; active?: boolean }> } | { success: false; errors: ValidationError[] } {
    const errors: ValidationError[] = [];
    const result: Record<string, unknown> = {};

    if (!data || typeof data !== 'object') {
        return { success: false, errors: [createValidationError('body', ResourceBase.translate(Resource.VALIDATION_ERROR, lang))] };
    }

    const body = data as Record<string, unknown>;

    if (body.value !== undefined) {
        if (!isNumber(body.value) || body.value <= 0) {
            errors.push(createValidationError('value', ResourceBase.translateWithParams(Resource.TOO_SMALL, lang, {
                path: 'value',
                min: 1
            })));
        } else {
            result.value = body.value;
        }
    }

    if (body.date !== undefined) {
        if (!isDate(body.date)) {
            errors.push(createValidationError('date', ResourceBase.translate(Resource.INVALID_DATE_FORMAT, lang)));
        } else {
            result.date = body.date instanceof Date ? body.date : new Date(body.date as string);
        }
    }

    if (body.category_id !== undefined && body.category_id !== null) {
        if (!isNumber(body.category_id) || body.category_id <= 0) {
            errors.push(createValidationError('category_id', ResourceBase.translate(Resource.VALIDATION_ERROR, lang)));
        } else {
            result.categoryId = body.category_id;
        }
    }

    if (body.subcategory_id !== undefined && body.subcategory_id !== null) {
        if (!isNumber(body.subcategory_id) || body.subcategory_id <= 0) {
            errors.push(createValidationError('subcategory_id', ResourceBase.translate(Resource.VALIDATION_ERROR, lang)));
        } else {
            result.subcategoryId = body.subcategory_id;
        }
    }

    if (body.transactionType !== undefined) {
        if (!isEnum(body.transactionType, TransactionType)) {
            errors.push(createValidationError('transactionType', ResourceBase.translateWithParams(Resource.INVALID_ENUM, lang, {
                path: 'transactionType',
                received: body.transactionType === undefined ? 'undefined' : String(body.transactionType),
                options: Object.values(TransactionType).join(', ')
            })));
        } else {
            result.transactionType = body.transactionType;
        }
    }

    if (body.transactionSource !== undefined) {
        if (!isEnum(body.transactionSource, TransactionSource)) {
            errors.push(createValidationError('transactionSource', ResourceBase.translateWithParams(Resource.INVALID_ENUM, lang, {
                path: 'transactionSource',
                received: body.transactionSource === undefined ? 'undefined' : String(body.transactionSource),
                options: Object.values(TransactionSource).join(', ')
            })));
        } else {
            result.transactionSource = body.transactionSource;
        }
    }

    if (body.isInstallment !== undefined) {
        if (!isBoolean(body.isInstallment)) {
            errors.push(createValidationError('isInstallment', ResourceBase.translate(Resource.INVALID_TYPE, lang)));
        } else {
            result.isInstallment = body.isInstallment;
        }
    }

    if (body.totalMonths !== undefined && body.totalMonths !== null) {
        if (!isNumber(body.totalMonths) || body.totalMonths <= 0) {
            errors.push(createValidationError('isInstallment', ResourceBase.translateWithParams(Resource.INVALID_TYPE, lang, {
                path: 'isInstallment',
                expected: 'boolean',
                received: String(body.isInstallment)
            })));
        } else {
            result.isInstallment = body.isInstallment;
        }
    }

    if (body.isRecurring !== undefined) {
        if (!isBoolean(body.isRecurring)) {
            errors.push(createValidationError('isRecurring', ResourceBase.translateWithParams(Resource.INVALID_TYPE, lang, {
                path: 'isRecurring',
                expected: 'boolean',
                received: String(body.isRecurring)
            })));
        } else {
            result.isRecurring = body.isRecurring;
        }
    }

    if (body.paymentDay !== undefined && body.paymentDay !== null) {
        if (!isNumber(body.paymentDay) || body.paymentDay < 1 || body.paymentDay > 31) {
            errors.push(createValidationError('paymentDay', ResourceBase.translate(Resource.PAYMENT_DAY_OUT_OF_RANGE, lang)));
        } else {
            result.paymentDay = body.paymentDay;
        }
    }

    if (body.account_id !== undefined && body.account_id !== null) {
        if (!isNumber(body.account_id) || body.account_id <= 0) {
            errors.push(createValidationError('account_id', ResourceBase.translate(Resource.INVALID_ACCOUNT_ID, lang)));
        } else {
            result.accountId = body.account_id;
        }
    }

    if (body.creditCard_id !== undefined && body.creditCard_id !== null) {
        if (!isNumber(body.creditCard_id) || body.creditCard_id <= 0) {
            errors.push(createValidationError('creditCard_id', ResourceBase.translate(Resource.INVALID_CREDIT_CARD_ID, lang)));
        } else {
            result.creditCardId = body.creditCard_id;
        }
    }

    if (body.observation !== undefined && body.observation !== null) {
        if (!isString(body.observation)) {
            errors.push(createValidationError('observation', ResourceBase.translate(Resource.INVALID_OBSERVATION_TYPE, lang)));
        } else {
            result.observation = body.observation;
        }
    }

    if (body.active !== undefined && !isBoolean(body.active)) {
        errors.push(createValidationError('active', ResourceBase.translate(Resource.INVALID_TYPE, lang)));
    } else if (body.active !== undefined) {
        result.active = body.active;
    }

    if (errors.length > 0) {
        return { success: false, errors };
    }

    return { success: true, data: result };
}
