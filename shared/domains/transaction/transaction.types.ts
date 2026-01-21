import type { AccountId } from '../account/account.types';
import type { CategoryId } from '../category/category.types';
import type { CreditCardId } from '../creditCard/creditCard.types';
import type { SubcategoryId } from '../subcategory/subcategory.types';
import type { TagId } from '../tag/tag.types';
import type { ISODateString, MonetaryString } from '../../types/format.types';
import type { PaginationInput, PaginatedResult } from '../../types/pagination.types';
import type { TransactionSource, TransactionType } from './transaction.enums';
import type { UserId } from '../user/user.types';

/** @summary Unique identifier for a transaction. */
export type TransactionId = number;

/** @summary Transaction value represented as a monetary string. */
export type TransactionValue = MonetaryString;

/** @summary Free-form transaction observation. */
export type TransactionObservation = string;

/** @summary Transaction record persisted by the system. */
export interface TransactionEntity {
    id: TransactionId;
    value: TransactionValue;
    date: ISODateString;
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
    createdAt: ISODateString;
    updatedAt: ISODateString;
}

/** @summary Transaction record with associated tag ids. */
export interface TransactionWithTags extends TransactionEntity {
    tags: TagId[];
}

/** @summary Grouped transactions by account. */
export interface AccountTransactions {
    accountId: AccountId;
    transactions: TransactionWithTags[] | undefined;
}

/** @summary Input payload for transaction creation. */
export interface CreateTransactionInput {
    value: TransactionValue;
    date: ISODateString;
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

/** @summary Input payload for transaction updates. */
export interface UpdateTransactionInput {
    value?: TransactionValue;
    date?: ISODateString;
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

/** @summary Input payload for listing transactions with filters. */
export interface GetTransactionsInput extends PaginationInput {
    accountIds?: AccountId[];
    creditCardIds?: CreditCardId[];
    categoryIds?: CategoryId[];
    subcategoryIds?: SubcategoryId[];
    tagIds?: TagId[];
    transactionType?: TransactionType;
    transactionSource?: TransactionSource;
    startDate?: ISODateString;
    endDate?: ISODateString;
}

/** @summary Input payload for fetching a transaction by id. */
export interface GetTransactionByIdInput {
    id: TransactionId;
}

/** @summary Input payload for listing transactions by account. */
export interface GetTransactionsByAccountInput extends PaginationInput {
    accountId: AccountId;
}

/** @summary Input payload for listing transactions by user. */
export interface GetTransactionsByUserInput extends PaginationInput {
    userId: UserId;
}

/** @summary Update request payload with target id and data. */
export interface UpdateTransactionRequest {
    id: TransactionId;
    data: UpdateTransactionInput;
}

/** @summary Input payload for deleting a transaction. */
export interface DeleteTransactionInput {
    id: TransactionId;
}

/** @summary Output payload for transaction creation. */
export type CreateTransactionOutput = TransactionWithTags;

/** @summary Output payload for listing transactions. */
export type GetTransactionsOutput = PaginatedResult<TransactionWithTags>;

/** @summary Output payload for fetching a transaction by id. */
export type GetTransactionByIdOutput = TransactionWithTags;

/** @summary Output payload for listing transactions by account. */
export type GetTransactionsByAccountOutput = PaginatedResult<TransactionWithTags>;

/** @summary Output payload for listing transactions by user. */
export type GetTransactionsByUserOutput = PaginatedResult<AccountTransactions>;

/** @summary Output payload for transaction updates. */
export type UpdateTransactionOutput = TransactionWithTags;

/** @summary Output payload for transaction deletion. */
export interface DeleteTransactionOutput {
    id: TransactionId;
}