export enum AccountType {
    CHECKING = 'checking',
    PAYROLL = 'payroll',
    SAVINGS = 'savings',
    INVESTMENT = 'investment',
    LOAN = 'loan',
    OTHER = 'other',
}

export enum CreditCardFlag {
    VISA = 'visa',
    MASTERCARD = 'mastercard',
    AMEX = 'amex',
    ELO = 'elo',
    HIPERCARD = 'hipercard',
    DISCOVER = 'discover',
    DINERS = 'diners',
}

export enum CategoryType {
    INCOME = 'income',
    EXPENSE = 'expense'
}

export enum CategoryColor {
    RED = 'red',
    BLUE = 'blue',
    GREEN = 'green',
    PURPLE = 'purple',
    YELLOW = 'yellow',
    ORANGE = 'orange',
    PINK = 'pink',
    GRAY = 'gray',
    CYAN = 'cyan',
    INDIGO = 'indigo'
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
    ACCOUNT = "account",
    AUTH = 'auth',
    CATEGORY = 'category',
    TRANSACTION = 'transaction',
    LOG = 'log',
    SUBCATEGORY = "subcategory",
    USER = 'user',
    CREDIT_CARD = 'creditCard',
}

export enum LogType {
    ALERT = 'alert',
    DEBUG = 'debug',
    ERROR = 'error',
    SUCCESS = 'success',
}

export enum LogOperation {
    CREATE = 'create',
    DELETE = 'delete',
    LOGIN = 'login',
    LOGOUT = 'logout',
    UPDATE = 'update',
}

export enum TokenType {
    REFRESH = 'refresh',
}

export enum Operator {
    EQUAL = '=',
    IN = 'IN',
    LIKE = 'LIKE',
    BETWEEN = 'BETWEEN',
    ASC = 'ASC',
    DESC = 'DESC',
    DATE = "DATE",
}

export enum Profile {
    STARTER = 'starter',
    PRO = 'pro',
    MASTER = 'master'
}

export enum Theme {
    DARK = 'dark',
    LIGHT = 'light',
}

export enum TransactionSource {
    ACCOUNT = 'account',
    CREDIT_CARD = 'creditCard',

}
export enum TransactionType {
    INCOME = "income",
    EXPENSE = "expense",
}
