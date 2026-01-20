import type { AccountType } from './account.enums';
import type { UserId } from '../user/user.types';
import type { PaginationInput, PaginatedResult } from '../../types/pagination.types';

export type AccountId = number;
export type AccountName = string;
export type InstitutionName = string;
export type AccountObservation = string;
export type AccountBalance = string;

export interface AccountEntity {
    id: AccountId;
    name: AccountName | null;
    institution: InstitutionName | null;
    type: AccountType;
    observation: AccountObservation | null;
    balance: AccountBalance;
    active: boolean;
    userId: UserId;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateAccountInput {
    name: AccountName;
    institution: InstitutionName;
    type: AccountType;
    observation?: AccountObservation;
    balance?: number;
    userId: UserId;
    active?: boolean;
}

export interface UpdateAccountInput {
    name?: AccountName;
    institution?: InstitutionName;
    type?: AccountType;
    observation?: AccountObservation;
    balance?: number;
    userId?: UserId;
    active?: boolean;
}

export interface GetAccountsInput extends PaginationInput { }

export interface GetAccountByIdInput {
    id: AccountId;
}

export interface GetAccountsByUserInput extends PaginationInput {
    userId: UserId;
}

export interface UpdateAccountRequest {
    id: AccountId;
    data: UpdateAccountInput;
}

export interface DeleteAccountInput {
    id: AccountId;
}

export type CreateAccountOutput = AccountEntity;
export type GetAccountsOutput = PaginatedResult<AccountEntity>;
export type GetAccountByIdOutput = AccountEntity;
export type GetAccountsByUserOutput = PaginatedResult<AccountEntity>;
export type UpdateAccountOutput = AccountEntity;
export interface DeleteAccountOutput {
    id: AccountId;
}
