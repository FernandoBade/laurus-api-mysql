export enum Theme {
    DARK = 'dark',
    LIGHT = 'light',
}

export enum ColumnType {
    STRING = "VARCHAR(255)",
    TEXT = "TEXT",
    INTEGER = "INT",
    BIGINT = "BIGINT",
    FLOAT = "FLOAT",
    DOUBLE = "DOUBLE",
    DECIMAL = "DECIMAL(10,2)",
    BOOLEAN = "BOOLEAN",
    DATE = "DATETIME",
    TIME = "TIME",
    TIMESTAMP = "TIMESTAMP",
    ENUM = "ENUM"
}


export enum Currency {
    ARS = 'ARS',
    BRL = 'BRL',
    EUR = 'EUR',
    USD = 'USD',
}

export enum DateFormat {
    DD_MM_YYYY = 'DD/MM/YYYY',
    MM_DD_YYYY = 'MM/DD/YYYY',
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
    ES_ES = 'es-ES',
    PT_BR = 'pt-BR',
}

export enum LogCategory {
    DATABASE = 'database',
    LOG = 'log',
    SERVER = 'server',
    USER = 'user',
}

export enum LogType {
    ALERT = 'alert',
    DEBUG = 'debug',
    ERROR = 'error',
    SUCCESS = 'success',
}

export enum LogOperation {
    CREATE = 'creation',
    DELETE = 'deletion',
    LOGIN = 'login',
    LOGOUT = 'logout',
    SEARCH = 'search',
    UPDATE = 'update',
    STATUS = 'status'
}

export enum TableName {
    ACCOUNT = 'Account',
    LOG = 'Log',
    USER = 'User',
    LOG_OLD = "Log_old",
    USER_OLD = 'User_old',
}