/** @summary Environment variable names used by the backend server. */
export enum ServerEnvKey {
    PORT = 'PORT',
    CORS_ORIGINS = 'CORS_ORIGINS',
}

/** @summary Header names read from incoming requests. */
export enum ServerRequestHeader {
    ORIGIN = 'origin',
    ACCESS_CONTROL_REQUEST_HEADERS = 'access-control-request-headers',
    ACCEPT_LANGUAGE = 'accept-language',
}

/** @summary Header names written in server responses. */
export enum ServerResponseHeader {
    ACCESS_CONTROL_ALLOW_ORIGIN = 'Access-Control-Allow-Origin',
    ACCESS_CONTROL_ALLOW_CREDENTIALS = 'Access-Control-Allow-Credentials',
    VARY = 'Vary',
    ACCESS_CONTROL_ALLOW_METHODS = 'Access-Control-Allow-Methods',
    ACCESS_CONTROL_ALLOW_HEADERS = 'Access-Control-Allow-Headers',
}

/** @summary Reusable header values for CORS behavior. */
export enum ServerHeaderValue {
    TRUE = 'true',
    ORIGIN = 'Origin',
    ALLOW_METHODS = 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    ALLOW_HEADERS_DEFAULT = 'Content-Type, Authorization, Accept-Language',
}

/** @summary HTTP method literals used by the backend server. */
export enum ServerHttpMethod {
    OPTIONS = 'OPTIONS',
}

/** @summary Route base paths registered by the backend server. */
export enum ServerRoutePath {
    AUTH = '/auth',
    ACCOUNTS = '/accounts',
    CREDIT_CARDS = '/creditCards',
    CATEGORIES = '/categories',
    SUBCATEGORIES = '/subcategories',
    TAGS = '/tags',
    TRANSACTIONS = '/transactions',
    USERS = '/users',
    FEEDBACK = '/feedback',
}

/** @summary Generic string tokens used in server bootstrapping. */
export enum ServerToken {
    EMPTY = '',
    CSV_SEPARATOR = ',',
    ERROR_BODY_PROPERTY = 'body',
    STARTUP_LOG_PREFIX = '\u{1F680} Server running on port ',
}

