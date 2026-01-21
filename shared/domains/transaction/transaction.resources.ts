import type {
    CreateTransactionInput,
    CreateTransactionOutput,
    DeleteTransactionInput,
    DeleteTransactionOutput,
    GetTransactionByIdInput,
    GetTransactionByIdOutput,
    GetTransactionsByAccountInput,
    GetTransactionsByAccountOutput,
    GetTransactionsByUserInput,
    GetTransactionsByUserOutput,
    GetTransactionsInput,
    GetTransactionsOutput,
    UpdateTransactionRequest,
    UpdateTransactionOutput,
} from './transaction.types';
import { TransactionErrorCode } from './transaction.enums';

/** @summary Resource definition for creating a transaction. */
export const createTransactionResource = {
    input: {} as CreateTransactionInput,
    output: {} as CreateTransactionOutput,
    errors: {} as TransactionErrorCode,
};

/** @summary Resource definition for listing transactions. */
export const getTransactionsResource = {
    input: {} as GetTransactionsInput,
    output: {} as GetTransactionsOutput,
    errors: {} as TransactionErrorCode,
};

/** @summary Resource definition for fetching a transaction by id. */
export const getTransactionByIdResource = {
    input: {} as GetTransactionByIdInput,
    output: {} as GetTransactionByIdOutput,
    errors: {} as TransactionErrorCode,
};

/** @summary Resource definition for listing transactions by account. */
export const getTransactionsByAccountResource = {
    input: {} as GetTransactionsByAccountInput,
    output: {} as GetTransactionsByAccountOutput,
    errors: {} as TransactionErrorCode,
};

/** @summary Resource definition for listing transactions by user. */
export const getTransactionsByUserResource = {
    input: {} as GetTransactionsByUserInput,
    output: {} as GetTransactionsByUserOutput,
    errors: {} as TransactionErrorCode,
};

/** @summary Resource definition for updating a transaction. */
export const updateTransactionResource = {
    input: {} as UpdateTransactionRequest,
    output: {} as UpdateTransactionOutput,
    errors: {} as TransactionErrorCode,
};

/** @summary Resource definition for deleting a transaction. */
export const deleteTransactionResource = {
    input: {} as DeleteTransactionInput,
    output: {} as DeleteTransactionOutput,
    errors: {} as TransactionErrorCode,
};