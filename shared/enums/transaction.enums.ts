import { ResourceKey } from "../i18n/resource.keys";

/** @summary Source of a transaction. */
export enum TransactionSource {
    ACCOUNT = "account",
    CREDIT_CARD = "creditCard",
}

/** @summary Type of a transaction. */
export enum TransactionType {
    INCOME = "income",
    EXPENSE = "expense",
}

/** @summary Transaction-related error codes mapped to i18n resources. */
export enum TransactionErrorCode {
    ValidationError = ResourceKey.VALIDATION_ERROR,
    InvalidTransactionId = ResourceKey.INVALID_TRANSACTION_ID,
    InvalidAccountId = ResourceKey.INVALID_ACCOUNT_ID,
    InvalidUserId = ResourceKey.INVALID_USER_ID,
    AccountNotFound = ResourceKey.ACCOUNT_NOT_FOUND,
    CreditCardNotFound = ResourceKey.CREDIT_CARD_NOT_FOUND,
    CategoryOrSubcategoryRequired = ResourceKey.CATEGORY_OR_SUBCATEGORY_REQUIRED,
    CategoryNotFoundOrInactive = ResourceKey.CATEGORY_NOT_FOUND_OR_INACTIVE,
    SubcategoryNotFoundOrInactive = ResourceKey.SUBCATEGORY_NOT_FOUND_OR_INACTIVE,
    TagNotFound = ResourceKey.TAG_NOT_FOUND,
    NoRecordsFound = ResourceKey.NO_RECORDS_FOUND,
    TransactionNotFound = ResourceKey.TRANSACTION_NOT_FOUND,
    InternalServerError = ResourceKey.INTERNAL_SERVER_ERROR,
}
