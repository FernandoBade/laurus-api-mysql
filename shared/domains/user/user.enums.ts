import { ResourceKey } from '../../i18n/resource.keys';

export enum Theme {
    DARK = 'dark',
    LIGHT = 'light',
}

export enum Language {
    EN_US = 'en-US',
    ES_ES = 'es-ES',
    PT_BR = 'pt-BR',
}

export enum Currency {
    ARS = 'ARS',
    COP = 'COP',
    BRL = 'BRL',
    EUR = 'EUR',
    USD = 'USD',
}

export enum DateFormat {
    DD_MM_YYYY = 'DD/MM/YYYY',
    MM_DD_YYYY = 'MM/DD/YYYY',
}

export enum Profile {
    STARTER = 'starter',
    PRO = 'pro',
    MASTER = 'master',
}

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
