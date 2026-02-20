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

/** @summary Structured log event identifiers for backend telemetry payloads.
 * @internal
 */
export enum LogEvent {
    AUTH_EMAIL_SEND_FAILED = "AUTH_EMAIL_SEND_FAILED",
    FEEDBACK_EMAIL_SEND_FAILED = "FEEDBACK_EMAIL_SEND_FAILED",
    FEEDBACK_SENT = "FEEDBACK_SENT",
    REFRESH_REUSE_DETECTED = "REFRESH_REUSE_DETECTED",
    LOGOUT_TOKEN_NOT_FOUND = "LOGOUT_TOKEN_NOT_FOUND",
    LOGOUT_SUCCESS = "LOGOUT_SUCCESS",
}
