"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountService = void 0;
const enum_1 = require("../utils/enum");
const accountRepository_1 = require("../repositories/accountRepository");
const userService_1 = require("./userService");
const resource_1 = require("../utils/resources/resource");
/**
 * Service for account business logic.
 * Handles account operations including validation and user linking.
 */
class AccountService {
    constructor() {
        this.accountRepository = new accountRepository_1.AccountRepository();
    }
    /**
     * Creates a new financial account.
     * Ensures the required data is present and linked to a valid user.
     *
     * @summary Creates a new account linked to a user.
     * @param data - Account creation data.
     * @returns The created account record.
     */
    async createAccount(data) {
        const userService = new userService_1.UserService();
        const user = await userService.getUserById(data.userId);
        if (!user.success || !user.data) {
            return { success: false, error: resource_1.Resource.USER_NOT_FOUND };
        }
        try {
            const created = await this.accountRepository.create(Object.assign(Object.assign({}, data), { user_id: data.userId }));
            return { success: true, data: created };
        }
        catch (error) {
            return { success: false, error: resource_1.Resource.INTERNAL_SERVER_ERROR };
        }
    }
    /**
     * Retrieves all financial accounts from the database.
     *
     * @summary Gets all accounts with optional pagination and sorting.
     * @param options - Query options for pagination and sorting.
     * @returns A list of all account records.
     */
    async getAccounts(options) {
        try {
            const accounts = await this.accountRepository.findMany(undefined, {
                limit: options === null || options === void 0 ? void 0 : options.limit,
                offset: options === null || options === void 0 ? void 0 : options.offset,
                sort: options === null || options === void 0 ? void 0 : options.sort,
                order: (options === null || options === void 0 ? void 0 : options.order) === enum_1.Operator.DESC ? 'desc' : 'asc',
            });
            return { success: true, data: accounts };
        }
        catch (error) {
            return { success: false, error: resource_1.Resource.INTERNAL_SERVER_ERROR };
        }
    }
    /**
     * Counts all financial accounts in the database.
     *
     * @summary Gets total count of accounts.
     * @returns Total account count.
     */
    async countAccounts() {
        try {
            const count = await this.accountRepository.count();
            return { success: true, data: count };
        }
        catch (error) {
            return { success: false, error: resource_1.Resource.INTERNAL_SERVER_ERROR };
        }
    }
    /**
     * Retrieves a single account by its ID.
     *
     * @summary Gets an account by ID.
     * @param id - ID of the account.
     * @returns Account record if found.
     */
    async getAccountById(id) {
        const account = await this.accountRepository.findById(id);
        if (!account) {
            return { success: false, error: resource_1.Resource.NO_RECORDS_FOUND };
        }
        return { success: true, data: account };
    }
    /**
     * Retrieves all accounts associated with a given user ID.
     *
     * @summary Gets all accounts for a user.
     * @param userId - ID of the user.
     * @returns A list of accounts owned by the user.
     */
    async getAccountsByUser(userId, options) {
        try {
            const accounts = await this.accountRepository.findMany({
                userId: { operator: enum_1.Operator.EQUAL, value: userId }
            }, {
                limit: options === null || options === void 0 ? void 0 : options.limit,
                offset: options === null || options === void 0 ? void 0 : options.offset,
                sort: options === null || options === void 0 ? void 0 : options.sort,
                order: (options === null || options === void 0 ? void 0 : options.order) === enum_1.Operator.DESC ? 'desc' : 'asc',
            });
            return { success: true, data: accounts };
        }
        catch (error) {
            return { success: false, error: resource_1.Resource.INTERNAL_SERVER_ERROR };
        }
    }
    /**
     * Counts accounts associated with a user.
     *
     * @summary Gets count of accounts for a user.
     * @param userId - User ID.
     * @returns Count of user's accounts.
     */
    async countAccountsByUser(userId) {
        try {
            const count = await this.accountRepository.count({
                userId: { operator: enum_1.Operator.EQUAL, value: userId }
            });
            return { success: true, data: count };
        }
        catch (error) {
            return { success: false, error: resource_1.Resource.INTERNAL_SERVER_ERROR };
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
    async updateAccount(id, data) {
        if (data.userId !== undefined) {
            const userService = new userService_1.UserService();
            const user = await userService.getUserById(data.userId);
            if (!user.success || !user.data) {
                return { success: false, error: resource_1.Resource.USER_NOT_FOUND };
            }
        }
        try {
            const updated = await this.accountRepository.update(id, data);
            return { success: true, data: updated };
        }
        catch (error) {
            return { success: false, error: resource_1.Resource.INTERNAL_SERVER_ERROR };
        }
    }
    /**
     * Deletes an account by ID after validating its existence.
     *
     * @summary Removes an account from the database.
     * @param id - ID of the account to delete.
     * @returns Success with deleted ID, or error if account does not exist.
     */
    async deleteAccount(id) {
        const existing = await this.accountRepository.findById(id);
        if (!existing) {
            return { success: false, error: resource_1.Resource.ACCOUNT_NOT_FOUND };
        }
        try {
            await this.accountRepository.delete(id);
            return { success: true, data: { id } };
        }
        catch (error) {
            return { success: false, error: resource_1.Resource.INTERNAL_SERVER_ERROR };
        }
    }
}
exports.AccountService = AccountService;
