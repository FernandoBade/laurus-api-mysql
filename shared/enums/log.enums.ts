/** @summary Log categories for audit and telemetry.
 * @internal
 */
export enum LogCategory {
    ACCOUNT = "account",
    AUTH = "auth",
    CATEGORY = "category",
    TRANSACTION = "transaction",
    LOG = "log",
    SUBCATEGORY = "subcategory",
    USER = "user",
    CREDIT_CARD = "creditCard",
    TAG = "tag",
}

/** @summary Log entry severity types.
 * @internal
 */
export enum LogType {
    ALERT = "alert",
    DEBUG = "debug",
    ERROR = "error",
    SUCCESS = "success",
}

/** @summary Log operation identifiers.
 * @internal
 */
export enum LogOperation {
    CREATE = "create",
    DELETE = "delete",
    LOGIN = "login",
    LOGOUT = "logout",
    UPDATE = "update",
}
