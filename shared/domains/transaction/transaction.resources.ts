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

export const createTransactionResource = {
    input: {} as CreateTransactionInput,
    output: {} as CreateTransactionOutput,
    errors: {} as TransactionErrorCode,
};

export const getTransactionsResource = {
    input: {} as GetTransactionsInput,
    output: {} as GetTransactionsOutput,
    errors: {} as TransactionErrorCode,
};

export const getTransactionByIdResource = {
    input: {} as GetTransactionByIdInput,
    output: {} as GetTransactionByIdOutput,
    errors: {} as TransactionErrorCode,
};

export const getTransactionsByAccountResource = {
    input: {} as GetTransactionsByAccountInput,
    output: {} as GetTransactionsByAccountOutput,
    errors: {} as TransactionErrorCode,
};

export const getTransactionsByUserResource = {
    input: {} as GetTransactionsByUserInput,
    output: {} as GetTransactionsByUserOutput,
    errors: {} as TransactionErrorCode,
};

export const updateTransactionResource = {
    input: {} as UpdateTransactionRequest,
    output: {} as UpdateTransactionOutput,
    errors: {} as TransactionErrorCode,
};

export const deleteTransactionResource = {
    input: {} as DeleteTransactionInput,
    output: {} as DeleteTransactionOutput,
    errors: {} as TransactionErrorCode,
};
