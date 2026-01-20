import type {
    CreateAccountInput,
    CreateAccountOutput,
    DeleteAccountInput,
    DeleteAccountOutput,
    GetAccountByIdInput,
    GetAccountByIdOutput,
    GetAccountsByUserInput,
    GetAccountsByUserOutput,
    GetAccountsInput,
    GetAccountsOutput,
    UpdateAccountRequest,
    UpdateAccountOutput,
} from './account.types';
import { AccountErrorCode } from './account.enums';

export const createAccountResource = {
    input: {} as CreateAccountInput,
    output: {} as CreateAccountOutput,
    errors: {} as AccountErrorCode,
};

export const getAccountsResource = {
    input: {} as GetAccountsInput,
    output: {} as GetAccountsOutput,
    errors: {} as AccountErrorCode,
};

export const getAccountByIdResource = {
    input: {} as GetAccountByIdInput,
    output: {} as GetAccountByIdOutput,
    errors: {} as AccountErrorCode,
};

export const getAccountsByUserResource = {
    input: {} as GetAccountsByUserInput,
    output: {} as GetAccountsByUserOutput,
    errors: {} as AccountErrorCode,
};

export const updateAccountResource = {
    input: {} as UpdateAccountRequest,
    output: {} as UpdateAccountOutput,
    errors: {} as AccountErrorCode,
};

export const deleteAccountResource = {
    input: {} as DeleteAccountInput,
    output: {} as DeleteAccountOutput,
    errors: {} as AccountErrorCode,
};
