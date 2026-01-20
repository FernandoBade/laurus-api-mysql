import type { AccountId } from '../account/account.types';
import type { CategoryId } from '../category/category.types';
import type { CreditCardId } from '../creditCard/creditCard.types';
import type { SubcategoryId } from '../subcategory/subcategory.types';
import type { TagId } from '../tag/tag.types';
import type { PaginationInput, PaginatedResult } from '../../types/pagination.types';
import type { TransactionSource, TransactionType } from './transaction.enums';
import type { UserId } from '../user/user.types';

export type TransactionId = number;
export type TransactionValue = string;
export type TransactionObservation = string;

export interface TransactionEntity {
    id: TransactionId;
    value: TransactionValue;
    date: Date;
    transactionType: TransactionType;
    observation: TransactionObservation | null;
    transactionSource: TransactionSource;
    isInstallment: boolean;
    totalMonths: number | null;
    isRecurring: boolean;
    paymentDay: number | null;
    active: boolean;
    accountId: AccountId | null;
    creditCardId: CreditCardId | null;
    categoryId: CategoryId | null;
    subcategoryId: SubcategoryId | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface TransactionWithTags extends TransactionEntity {
    tags: TagId[];
}

export interface AccountTransactions {
    accountId: AccountId;
    transactions: TransactionWithTags[] | undefined;
}

export interface CreateTransactionInput {
    value: number;
    date: Date;
    categoryId?: CategoryId;
    subcategoryId?: SubcategoryId;
    observation?: TransactionObservation;
    transactionType: TransactionType;
    transactionSource: TransactionSource;
    isInstallment: boolean;
    totalMonths?: number;
    isRecurring: boolean;
    paymentDay?: number;
    accountId?: AccountId;
    creditCardId?: CreditCardId;
    tags?: TagId[];
    active?: boolean;
}

export interface UpdateTransactionInput {
    value?: number | string;
    date?: Date;
    categoryId?: CategoryId;
    subcategoryId?: SubcategoryId;
    observation?: TransactionObservation;
    transactionType?: TransactionType;
    transactionSource?: TransactionSource;
    isInstallment?: boolean;
    totalMonths?: number;
    isRecurring?: boolean;
    paymentDay?: number;
    accountId?: AccountId | null;
    creditCardId?: CreditCardId | null;
    tags?: TagId[];
    active?: boolean;
}

export interface GetTransactionsInput extends PaginationInput {
    accountIds?: AccountId[];
    creditCardIds?: CreditCardId[];
    categoryIds?: CategoryId[];
    subcategoryIds?: SubcategoryId[];
    tagIds?: TagId[];
    transactionType?: TransactionType;
    transactionSource?: TransactionSource;
    startDate?: string;
    endDate?: string;
}

export interface GetTransactionByIdInput {
    id: TransactionId;
}

export interface GetTransactionsByAccountInput extends PaginationInput {
    accountId: AccountId;
}

export interface GetTransactionsByUserInput extends PaginationInput {
    userId: UserId;
}

export interface UpdateTransactionRequest {
    id: TransactionId;
    data: UpdateTransactionInput;
}

export interface DeleteTransactionInput {
    id: TransactionId;
}

export type CreateTransactionOutput = TransactionWithTags;
export type GetTransactionsOutput = PaginatedResult<TransactionWithTags>;
export type GetTransactionByIdOutput = TransactionWithTags;
export type GetTransactionsByAccountOutput = PaginatedResult<TransactionWithTags>;
export type GetTransactionsByUserOutput = PaginatedResult<AccountTransactions>;
export type UpdateTransactionOutput = TransactionWithTags;
export interface DeleteTransactionOutput {
    id: TransactionId;
}
