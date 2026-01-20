export { AccountType } from './domains/account/account.enums';
export { CategoryColor, CategoryType } from './domains/category/category.enums';
export { CreditCardFlag } from './domains/creditCard/creditCard.enums';
export { TokenType } from './domains/auth/auth.enums';
export { TransactionSource, TransactionType } from './domains/transaction/transaction.enums';
export { Currency, DateFormat, Language, Profile, Theme } from './domains/user/user.enums';

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

export enum LogCategory {
    ACCOUNT = 'account',
    AUTH = 'auth',
    CATEGORY = 'category',
    TRANSACTION = 'transaction',
    LOG = 'log',
    SUBCATEGORY = 'subcategory',
    USER = 'user',
    CREDIT_CARD = 'creditCard',
    TAG = 'tag',
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

export enum Operator {
    EQUAL = '=',
    IN = 'IN',
    LIKE = 'LIKE',
    BETWEEN = 'BETWEEN',
    ASC = 'ASC',
    DESC = 'DESC',
    DATE = 'DATE',
}
