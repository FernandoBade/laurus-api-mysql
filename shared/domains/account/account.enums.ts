import { ResourceKey } from '../../i18n/resource.keys';

/** @summary Supported account types. */
export enum AccountType {
    CHECKING = 'checking',
    PAYROLL = 'payroll',
    SAVINGS = 'savings',
    INVESTMENT = 'investment',
    LOAN = 'loan',
    OTHER = 'other',
}

/** @summary Account-related error codes mapped to i18n resources. */
export enum AccountErrorCode {
    ValidationError = ResourceKey.VALIDATION_ERROR,
    UserNotFound = ResourceKey.USER_NOT_FOUND,
    InternalServerError = ResourceKey.INTERNAL_SERVER_ERROR,
    InvalidAccountId = ResourceKey.INVALID_ACCOUNT_ID,
    InvalidUserId = ResourceKey.INVALID_USER_ID,
    NoRecordsFound = ResourceKey.NO_RECORDS_FOUND,
    AccountNotFound = ResourceKey.ACCOUNT_NOT_FOUND,
}