export enum LogType {
    ERROR = 'error',
    ALERT = 'alert',
    SUCCESS = 'success',
    DEBUG = 'debug'
}

export enum LogCategory {
    USER = 'user',
    LOG = 'log',
    DATABASE = 'database',
}

export enum HTTPStatus {
    OK = 200,
    CREATED = 201,
    BAD_REQUEST = 400,
    NOT_FOUND = 404,
    INTERNAL_SERVER_ERROR = 500,
}

export enum Language {
    EN_US = 'en-US',
    PT_BR = 'pt-BR',
    ES_ES = 'es-ES',
}

export enum Appearance {
    DARK = 'dark',
    LIGHT = 'light',
}

export enum Currency {
    USD = 'USD',
    BRL = 'BRL',
    EUR = 'EUR',
    ARS = 'ARS',
}

export enum DateFormat {
    DD_MM_YYYY = 'DD/MM/YYYY',
    MM_DD_YYYY = 'MM/DD/YYYY',
}

export enum Operation {
    CREATION = 'creation',
    SEARCH = 'search',
    UPDATE = 'update',
    LOGIN = 'login',
    LOGOUT = 'logout',
    DELETION = 'deletion'
}

export enum TableName {
    USER = 'User',
    ACCOUNT = 'Account',
    LOG = 'Log',
}
