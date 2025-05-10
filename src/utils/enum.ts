export enum AccountType {
    CHECKING = 'checking',
    PAYROLL = 'payroll',
    SAVINGS = 'savings',
    INVESTMENT = 'investment',
    LOAN = 'loan',
    OTHER = 'other',
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
    COP = 'COP',
    BRL = 'BRL',
    EUR = 'EUR',
    USD = 'USD',
}

export enum DateFormat {
    DD_MM_YYYY = 'DD/MM/YYYY',
    MM_DD_YYYY = 'MM/DD/YYYY',
}

export enum ExpenseType {
    ACCOUNT = 'account',
    CREDIT_CARD = 'creditCard',
}

export enum HTTPStatus {
    OK = 200,
    CREATED = 201,
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
    ACCOUNT = "account",
    AUTH = 'auth',
    DATABASE = 'database',
    EXPENSE = 'expense',
    LOG = 'log',
    MIGRATION = "migration",
    MIGRATION_GROUP = "migrationGroup",
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
    APPLY = 'apply',
    CREATE = 'create',
    DELETE = 'delete',
    LOGIN = 'login',
    LOGOUT = 'logout',
    UPDATE = 'update',
    ROLLBACK = 'rollback',
    SEARCH = 'search',
    STATUS = 'status',
    AUTH = "auth",
}

export enum Operator {
    EQUAL = '=',
    IN = 'IN',
    LIKE = 'LIKE',
    BETWEEN = 'BETWEEN',
    ASC = 'ASC',
    DESC = 'DESC',
  }

export enum Profile {
    STARTER = 'starter',
    PRO = 'pro',
    MASTER = 'master'
}

export enum TableName {
    ACCOUNT = 'account',
    EXPENSE = "expense",
    LOG = 'log',
    MIGRATION = "migration",
    MIGRATION_GROUP = "migration_group",
    REFRESH_TOKEN = "refresh_token",
    USER = 'user',
}

export enum Theme {
    DARK = 'dark',
    LIGHT = 'light',
}
