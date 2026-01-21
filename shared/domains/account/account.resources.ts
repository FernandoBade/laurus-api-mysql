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

/** @summary Resource definition for creating an account. */
export const createAccountResource = {
    input: {} as CreateAccountInput,
    output: {} as CreateAccountOutput,
    errors: {} as AccountErrorCode,
};

/** @summary Resource definition for listing accounts. */
export const getAccountsResource = {
    input: {} as GetAccountsInput,
    output: {} as GetAccountsOutput,
    errors: {} as AccountErrorCode,
};

/** @summary Resource definition for fetching an account by id. */
export const getAccountByIdResource = {
    input: {} as GetAccountByIdInput,
    output: {} as GetAccountByIdOutput,
    errors: {} as AccountErrorCode,
};

/** @summary Resource definition for listing accounts by user. */
export const getAccountsByUserResource = {
    input: {} as GetAccountsByUserInput,
    output: {} as GetAccountsByUserOutput,
    errors: {} as AccountErrorCode,
};

/** @summary Resource definition for updating an account. */
export const updateAccountResource = {
    input: {} as UpdateAccountRequest,
    output: {} as UpdateAccountOutput,
    errors: {} as AccountErrorCode,
};

/** @summary Resource definition for deleting an account. */
export const deleteAccountResource = {
    input: {} as DeleteAccountInput,
    output: {} as DeleteAccountOutput,
    errors: {} as AccountErrorCode,
};