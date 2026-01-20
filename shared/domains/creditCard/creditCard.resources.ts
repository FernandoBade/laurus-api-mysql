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

export const createCreditCardResource = {
    input: {} as CreateCreditCardInput,
    output: {} as CreateCreditCardOutput,
    errors: {} as CreditCardErrorCode,
};

export const getCreditCardsResource = {
    input: {} as GetCreditCardsInput,
    output: {} as GetCreditCardsOutput,
    errors: {} as CreditCardErrorCode,
};

export const getCreditCardByIdResource = {
    input: {} as GetCreditCardByIdInput,
    output: {} as GetCreditCardByIdOutput,
    errors: {} as CreditCardErrorCode,
};

export const getCreditCardsByUserResource = {
    input: {} as GetCreditCardsByUserInput,
    output: {} as GetCreditCardsByUserOutput,
    errors: {} as CreditCardErrorCode,
};

export const updateCreditCardResource = {
    input: {} as UpdateCreditCardRequest,
    output: {} as UpdateCreditCardOutput,
    errors: {} as CreditCardErrorCode,
};

export const deleteCreditCardResource = {
    input: {} as DeleteCreditCardInput,
    output: {} as DeleteCreditCardOutput,
    errors: {} as CreditCardErrorCode,
};
