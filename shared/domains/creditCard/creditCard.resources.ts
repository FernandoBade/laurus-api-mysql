import type {
    CreateCreditCardInput,
    CreateCreditCardOutput,
    DeleteCreditCardInput,
    DeleteCreditCardOutput,
    GetCreditCardByIdInput,
    GetCreditCardByIdOutput,
    GetCreditCardsByUserInput,
    GetCreditCardsByUserOutput,
    GetCreditCardsInput,
    GetCreditCardsOutput,
    UpdateCreditCardRequest,
    UpdateCreditCardOutput,
} from './creditCard.types';
import { CreditCardErrorCode } from './creditCard.enums';

/** @summary Resource definition for creating a credit card. */
export const createCreditCardResource = {
    input: {} as CreateCreditCardInput,
    output: {} as CreateCreditCardOutput,
    errors: {} as CreditCardErrorCode,
};

/** @summary Resource definition for listing credit cards. */
export const getCreditCardsResource = {
    input: {} as GetCreditCardsInput,
    output: {} as GetCreditCardsOutput,
    errors: {} as CreditCardErrorCode,
};

/** @summary Resource definition for fetching a credit card by id. */
export const getCreditCardByIdResource = {
    input: {} as GetCreditCardByIdInput,
    output: {} as GetCreditCardByIdOutput,
    errors: {} as CreditCardErrorCode,
};

/** @summary Resource definition for listing credit cards by user. */
export const getCreditCardsByUserResource = {
    input: {} as GetCreditCardsByUserInput,
    output: {} as GetCreditCardsByUserOutput,
    errors: {} as CreditCardErrorCode,
};

/** @summary Resource definition for updating a credit card. */
export const updateCreditCardResource = {
    input: {} as UpdateCreditCardRequest,
    output: {} as UpdateCreditCardOutput,
    errors: {} as CreditCardErrorCode,
};

/** @summary Resource definition for deleting a credit card. */
export const deleteCreditCardResource = {
    input: {} as DeleteCreditCardInput,
    output: {} as DeleteCreditCardOutput,
    errors: {} as CreditCardErrorCode,
};