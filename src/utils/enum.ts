export enum Theme {
    DARK = 'dark',
    LIGHT = 'light',
}

export enum ColumnType {
    VARCHAR = "VARCHAR(255)",
    CHAR = "CHAR(255)",
    TEXT = "TEXT",
    TINYINT = "TINYINT",
    INTEGER = "INT",
    MEDIUMINT = "MEDIUMINT",
    BIGINT = "BIGINT",
    FLOAT = "FLOAT",
    DOUBLE = "DOUBLE",
    DECIMAL = "DECIMAL(10,2)",
    BOOLEAN = "BOOLEAN",
    DATE = "DATE",
    DATETIME = "DATETIME",
    TIME = "TIME",
    TIMESTAMP = "TIMESTAMP",
    CURRENT_TIMESTAMP = "CURRENT_TIMESTAMP",
    YEAR = "YEAR",
    ENUM = "ENUM",
    BLOB = "BLOB"
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
    NO_CONTENT = 204,
    MOVED_PERMANENTLY = 301,
    NOT_MODIFIED = 304,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    CONFLICT = 409,
    PRECONDITION_FAILED = 412,
    UNPROCESSABLE_ENTITY = 422,
    TOO_MANY_REQUESTS = 429,
    INTERNAL_SERVER_ERROR = 500,
    NOT_IMPLEMENTED = 501,
    SERVICE_UNAVAILABLE = 503,
    GATEWAY_TIMEOUT = 504
}

export enum Language {
    EN_US = 'en-US',
    ES_ES = 'es-ES',
    PT_BR = 'pt-BR',
}

export enum LogCategory {
    AUTH = 'auth',
    DATABASE = 'database',
    LOG = 'log',
    MIGRATION = "migration",
    MIGRATION_GROUP = "migration_group",
    SERVER = 'server',
    USER = 'user',
}

export enum LogType {
    ALERT = 'alert',
    DEBUG = 'debug',
    ERROR = 'error',
    SUCCESS = 'success',
}

export enum Operation {
    APPLY = 'apply',
    CREATE = 'create',
    DELETE = 'delete',
    LOGIN = 'login',
    LOGOUT = 'logout',
    UPDATE = 'update',
    ROLLBACK = 'rollback',
    SEARCH = 'search',
    STATUS = 'status',
}

export enum TableName {
    ACCOUNT = 'Account',
    LOG = 'log',
    USER = 'user',
    LOG_OLD = "Log_old",
    USER_OLD = 'User_old',
    MIGRATION = "migration",
    MIGRATION_GROUP = "migration_group",
    REFRESH_TOKEN = "refresh_token",
}