import { ResourceKey } from '../../i18n/resource.keys';

/** @summary Theme preferences for user UI. */
export enum Theme {
    DARK = 'dark',
    LIGHT = 'light',
}

/** @summary Supported language codes for the user. */
export enum Language {
    EN_US = 'en-US',
    ES_ES = 'es-ES',
    PT_BR = 'pt-BR',
}

/** @summary Supported currency codes for monetary values. */
export enum Currency {
    ARS = 'ARS',
    COP = 'COP',
    BRL = 'BRL',
    EUR = 'EUR',
    USD = 'USD',
}

/** @summary Supported date formats for user preferences. */
export enum DateFormat {
    DD_MM_YYYY = 'DD/MM/YYYY',
    MM_DD_YYYY = 'MM/DD/YYYY',
}

/** @summary Available subscription profiles. */
export enum Profile {
    STARTER = 'starter',
    PRO = 'pro',
    MASTER = 'master',
}

/** @summary User-related error codes mapped to i18n resources. */
export enum UserErrorCode {
    ValidationError = ResourceKey.VALIDATION_ERROR,
    EmailNotVerified = ResourceKey.EMAIL_NOT_VERIFIED,
    EmailInUse = ResourceKey.EMAIL_IN_USE,
    InvalidUserId = ResourceKey.INVALID_USER_ID,
    UserNotFound = ResourceKey.USER_NOT_FOUND,
    NoRecordsFound = ResourceKey.NO_RECORDS_FOUND,
    SearchTermTooShort = ResourceKey.SEARCH_TERM_TOO_SHORT,
    ExpiredOrInvalidToken = ResourceKey.EXPIRED_OR_INVALID_TOKEN,
    InternalServerError = ResourceKey.INTERNAL_SERVER_ERROR,
}