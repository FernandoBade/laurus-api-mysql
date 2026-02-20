import { FilterOperator, SortOrder } from '../../../shared/enums/operator.enums';
import { AccountRepository } from '../repositories/accountRepository';
import { UserService } from './userService';
import { ResourceKey as Resource } from '../../../shared/i18n/resource.keys';
import { SelectAccount, InsertAccount } from '../db/schema';
import { QueryOptions } from '../utils/pagination';
import type { AccountEntity, CreateAccountInput, UpdateAccountInput } from '../../../shared/domains/account/account.types';

/**
 * Service for account business logic.
 * Handles account operations including validation and user linking.
 */
export class AccountService {
    private accountRepository: AccountRepository;

    constructor() {
        this.accountRepository = new AccountRepository();
    }

    private toAccountEntity(data: SelectAccount): AccountEntity {
        return {
            ...data,
            createdAt: data.createdAt.toISOString(),
            updatedAt: data.updatedAt.toISOString(),
        };
    }

    /**
     * Creates a new financial account.
     * Ensures the required data is present and linked to a valid user.
     *
     * @summary Creates a new account linked to a user.
     * @param data - Account creation data.
     * @returns The created account record.
     */
    async createAccount(data: CreateAccountInput): Promise<{ success: true; data: AccountEntity } | { success: false; error: Resource }> {
        const userService = new UserService();
        const user = await userService.getUserById(data.userId);

        if (!user.success || !user.data) {
            return { success: false, error: Resource.USER_NOT_FOUND };
        }

        try {
            const created = await this.accountRepository.create({
                name: data.name,
                institution: data.institution,
                type: data.type,
                observation: data.observation,
                balance: data.balance,
                active: data.active,
                userId: data.userId,
            } as InsertAccount);
            return { success: true, data: this.toAccountEntity(created) };
        } catch {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        }
    }

    /**
     * Retrieves all financial accounts from the database.
     *
     * @summary Gets all accounts with optional pagination and sorting.
     * @param options - Query options for pagination and sorting.
     * @returns A list of all account records.
     */
    async getAccounts(options?: QueryOptions<SelectAccount>): Promise<{ success: true; data: AccountEntity[] } | { success: false; error: Resource }> {
        try {
            const accounts = await this.accountRepository.findMany(undefined, {
                limit: options?.limit,
                offset: options?.offset,
                sort: options?.sort as keyof SelectAccount,
                order: options?.order === SortOrder.DESC ? SortOrder.DESC : SortOrder.ASC,
            });
            return { success: true, data: accounts.map(account => this.toAccountEntity(account)) };
        } catch {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        }
    }

    /**
     * Counts all financial accounts in the database.
     *
     * @summary Gets total count of accounts.
     * @returns Total account count.
     */
    async countAccounts(): Promise<{ success: true; data: number } | { success: false; error: Resource }> {
        try {
            const count = await this.accountRepository.count();
            return { success: true, data: count };
        } catch {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        }
    }

    /**
     * Retrieves a single account by its ID.
     *
     * @summary Gets an account by ID.
     * @param id - ID of the account.
     * @returns Account record if found.
     */
    async getAccountById(id: number): Promise<{ success: true; data: AccountEntity } | { success: false; error: Resource }> {
        const account = await this.accountRepository.findById(id);
        if (!account) {
            return { success: false, error: Resource.NO_RECORDS_FOUND };
        }
        return { success: true, data: this.toAccountEntity(account) };
    }

    /**
     * Retrieves all accounts associated with a given user ID.
     *
     * @summary Gets all accounts for a user.
     * @param userId - ID of the user.
     * @returns A list of accounts owned by the user.
     */
    async getAccountsByUser(userId: number, options?: QueryOptions<SelectAccount>): Promise<{ success: true; data: AccountEntity[] } | { success: false; error: Resource }> {
        try {
            const accounts = await this.accountRepository.findMany({
                userId: { operator: FilterOperator.EQ, value: userId }
            }, {
                limit: options?.limit,
                offset: options?.offset,
                sort: options?.sort as keyof SelectAccount,
                order: options?.order === SortOrder.DESC ? SortOrder.DESC : SortOrder.ASC,
            });
            return { success: true, data: accounts.map(account => this.toAccountEntity(account)) };
        } catch {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        }
    }

    /**
     * Counts accounts associated with a user.
     *
     * @summary Gets count of accounts for a user.
     * @param userId - User ID.
     * @returns Count of user's accounts.
     */
    async countAccountsByUser(userId: number): Promise<{ success: true; data: number } | { success: false; error: Resource }> {
        try {
            const count = await this.accountRepository.count({
                userId: { operator: FilterOperator.EQ, value: userId }
            });
            return { success: true, data: count };
        } catch {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        }
    }

    /**
     * Updates an account by ID.
     * Validates the user if the userId is being changed.
     *
     * @summary Updates account data.
     * @param id - ID of the account.
     * @param data - Partial account data to update.
     * @returns Updated account record.
     */
    async updateAccount(id: number, data: UpdateAccountInput): Promise<{ success: true; data: AccountEntity } | { success: false; error: Resource }> {
        if (data.userId !== undefined) {
            const userService = new UserService();
            const user = await userService.getUserById(data.userId);

            if (!user.success || !user.data) {
                return { success: false, error: Resource.USER_NOT_FOUND };
            }
        }

        try {
            const updated = await this.accountRepository.update(id, data as Partial<InsertAccount>);
            return { success: true, data: this.toAccountEntity(updated) };
        } catch {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        }
    }

    /**
     * Deletes an account by ID after validating its existence.
     *
     * @summary Removes an account from the database.
     * @param id - ID of the account to delete.
     * @returns Success with deleted ID, or error if account does not exist.
     */
    async deleteAccount(id: number): Promise<{ success: true; data: { id: number } } | { success: false; error: Resource }> {
        const existing = await this.accountRepository.findById(id);
        if (!existing) {
            return { success: false, error: Resource.ACCOUNT_NOT_FOUND };
        }

        try {
            await this.accountRepository.delete(id);
            return { success: true, data: { id } };
        } catch {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        }
    }
}




