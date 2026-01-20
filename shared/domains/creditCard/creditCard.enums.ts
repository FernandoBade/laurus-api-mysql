import { ResourceKey } from '../../i18n/resource.keys';

export enum CreditCardFlag {
    VISA = 'visa',
    MASTERCARD = 'mastercard',
    AMEX = 'amex',
    ELO = 'elo',
    HIPERCARD = 'hipercard',
    DISCOVER = 'discover',
    DINERS = 'diners',
}

export enum CreditCardErrorCode {
    ValidationError = ResourceKey.VALIDATION_ERROR,
    UserNotFound = ResourceKey.USER_NOT_FOUND,
    InternalServerError = ResourceKey.INTERNAL_SERVER_ERROR,
    InvalidCreditCardId = ResourceKey.INVALID_CREDIT_CARD_ID,
    InvalidUserId = ResourceKey.INVALID_USER_ID,
    AccountNotFound = ResourceKey.ACCOUNT_NOT_FOUND,
    CreditCardNotFound = ResourceKey.CREDIT_CARD_NOT_FOUND,
    DataAlreadyExists = ResourceKey.DATA_ALREADY_EXISTS,
}
