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
    MIGRATION = "migration",
    MIGRATION_GROUP = "migration_group",
}

export enum LogType {
    ALERT = 'alert',
    DEBUG = 'debug',
    ERROR = 'error',
    SUCCESS = 'success',
}

export enum Operation {
    CREATE = 'create',
    DELETE = 'delete',
    SEARCH = 'search',
    UPDATE = 'update',
    STATUS = 'status',
    APPLY = 'apply',
    ROLLBACK = 'rollback',
}

export enum TableName {
    ACCOUNT = 'Account',
    LOG = 'log',
    USER = 'user',
    LOG_OLD = "Log_old",
    USER_OLD = 'User_old',
    MIGRATION = "migration",
    MIGRATION_GROUP = "migration_group",
}