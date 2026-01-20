import type { CreditCardFlag } from './creditCard.enums';
import type { AccountId } from '../account/account.types';
import type { UserId } from '../user/user.types';
import type { PaginationInput, PaginatedResult } from '../../types/pagination.types';

export type CreditCardId = number;
export type CreditCardName = string;
export type CreditCardObservation = string;
export type CreditCardBalance = string;
export type CreditCardLimit = string;

export interface CreditCardEntity {
    id: CreditCardId;
    name: CreditCardName | null;
    flag: CreditCardFlag;
    observation: CreditCardObservation | null;
    balance: CreditCardBalance;
    limit: CreditCardLimit;
    active: boolean;
    userId: UserId;
    accountId: AccountId | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateCreditCardInput {
    name: CreditCardName;
    flag: CreditCardFlag;
    observation?: CreditCardObservation;
    balance?: number;
    limit?: number;
    userId: UserId;
    accountId?: AccountId;
    active?: boolean;
}

export interface UpdateCreditCardInput {
    name?: CreditCardName;
    flag?: CreditCardFlag;
    observation?: CreditCardObservation;
    balance?: number;
    limit?: number;
    userId?: UserId;
    accountId?: AccountId | null;
    active?: boolean;
}

export interface GetCreditCardsInput extends PaginationInput {}

export interface GetCreditCardByIdInput {
    id: CreditCardId;
}

export interface GetCreditCardsByUserInput extends PaginationInput {
    userId: UserId;
}

export interface UpdateCreditCardRequest {
    id: CreditCardId;
    data: UpdateCreditCardInput;
}

export interface DeleteCreditCardInput {
    id: CreditCardId;
}

export type CreateCreditCardOutput = CreditCardEntity;
export type GetCreditCardsOutput = PaginatedResult<CreditCardEntity>;
export type GetCreditCardByIdOutput = CreditCardEntity;
export type GetCreditCardsByUserOutput = PaginatedResult<CreditCardEntity>;
export type UpdateCreditCardOutput = CreditCardEntity;
export interface DeleteCreditCardOutput {
    id: CreditCardId;
}
