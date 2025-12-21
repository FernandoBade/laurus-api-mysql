"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionService = void 0;
const enum_1 = require("../utils/enum");
const transactionRepository_1 = require("../repositories/transactionRepository");
const accountService_1 = require("./accountService");
const creditCardService_1 = require("./creditCardService");
const categoryService_1 = require("./categoryService");
const subcategoryService_1 = require("./subcategoryService");
const resource_1 = require("../utils/resources/resource");
/**
 * Service for transaction business logic.
 * Handles transaction operations including validation and account/card linking.
 */
class TransactionService {
    constructor() {
        this.transactionRepository = new transactionRepository_1.TransactionRepository();
    }
    /**
     * Creates a new transaction linked to a valid account.
     * Validates required fields and the existence of the target account.
     *
     * @summary Creates a new transaction.
     * @param data - Transaction creation data.
     * @returns The created transaction record.
     */
    async createTransaction(data) {
        var _a, _b;
        if (data.transactionSource === enum_1.TransactionSource.ACCOUNT) {
            const accountService = new accountService_1.AccountService();
            const account = await accountService.getAccountById(Number(data.accountId));
            if (!account.success || !account.data) {
                return { success: false, error: resource_1.Resource.ACCOUNT_NOT_FOUND };
            }
        }
        else {
            const creditCardService = new creditCardService_1.CreditCardService();
            const card = await creditCardService.getCreditCardById(Number(data.creditCardId));
            if (!card.success || !card.data) {
                return { success: false, error: resource_1.Resource.CREDIT_CARD_NOT_FOUND };
            }
        }
        if (!data.categoryId && !data.subcategoryId) {
            return { success: false, error: resource_1.Resource.CATEGORY_OR_SUBCATEGORY_REQUIRED };
        }
        if (data.categoryId) {
            const category = await new categoryService_1.CategoryService().getCategoryById(data.categoryId);
            if (!category.success || !((_a = category.data) === null || _a === void 0 ? void 0 : _a.active)) {
                return { success: false, error: resource_1.Resource.CATEGORY_NOT_FOUND_OR_INACTIVE };
            }
        }
        if (data.subcategoryId) {
            const subcategory = await new subcategoryService_1.SubcategoryService().getSubcategoryById(data.subcategoryId);
            if (!subcategory.success || !((_b = subcategory.data) === null || _b === void 0 ? void 0 : _b.active)) {
                return { success: false, error: resource_1.Resource.SUBCATEGORY_NOT_FOUND_OR_INACTIVE };
            }
        }
        try {
            const created = await this.transactionRepository.create({
                value: data.value.toString(),
                date: data.date,
                transactionType: data.transactionType,
                transactionSource: data.transactionSource,
                isInstallment: data.isInstallment,
                totalMonths: data.totalMonths,
                isRecurring: data.isRecurring,
                paymentDay: data.paymentDay,
                active: data.active,
                observation: data.observation,
                accountId: data.accountId,
                creditCardId: data.creditCardId,
                categoryId: data.categoryId,
                subcategoryId: data.subcategoryId,
            });
            return { success: true, data: created };
        }
        catch (error) {
            return { success: false, error: resource_1.Resource.INTERNAL_SERVER_ERROR };
        }
    }
    /**
     * Retrieves all transaction records in the system.
     *
     * @summary Gets all transactions with optional pagination and sorting.
     * @param options - Query options for pagination and sorting.
     * @returns A list of all transaction records.
     */
    async getTransactions(options) {
        try {
            const transactions = await this.transactionRepository.findMany(undefined, {
                limit: options === null || options === void 0 ? void 0 : options.limit,
                offset: options === null || options === void 0 ? void 0 : options.offset,
                sort: (options === null || options === void 0 ? void 0 : options.sort) || 'date',
                order: (options === null || options === void 0 ? void 0 : options.order) === enum_1.Operator.DESC ? 'desc' : 'asc',
            });
            return { success: true, data: transactions };
        }
        catch (error) {
            return { success: false, error: resource_1.Resource.INTERNAL_SERVER_ERROR };
        }
    }
    /**
     * Counts all transactions.
     *
     * @summary Gets total count of transactions.
     * @returns Total transaction count.
     */
    async countTransactions() {
        try {
            const count = await this.transactionRepository.count();
            return { success: true, data: count };
        }
        catch (error) {
            return { success: false, error: resource_1.Resource.INTERNAL_SERVER_ERROR };
        }
    }
    /**
     * Retrieves a single transaction by its ID.
     *
     * @summary Gets a transaction by ID.
     * @param id - ID of the transaction.
     * @returns Transaction record if found.
     */
    async getTransactionById(id) {
        const transaction = await this.transactionRepository.findById(id);
        if (!transaction) {
            return { success: false, error: resource_1.Resource.NO_RECORDS_FOUND };
        }
        return { success: true, data: transaction };
    }
    /**
     * Retrieves all transactions associated with a specific account.
     *
     * @summary Gets all transactions for an account.
     * @param accountId - ID of the account.
     * @returns A list of transactions linked to the account.
     */
    async getTransactionsByAccount(accountId, options) {
        try {
            const transactions = await this.transactionRepository.findMany({
                accountId: { operator: enum_1.Operator.EQUAL, value: accountId }
            }, {
                limit: options === null || options === void 0 ? void 0 : options.limit,
                offset: options === null || options === void 0 ? void 0 : options.offset,
                sort: (options === null || options === void 0 ? void 0 : options.sort) || 'date',
                order: (options === null || options === void 0 ? void 0 : options.order) === enum_1.Operator.DESC ? 'desc' : 'asc',
            });
            return { success: true, data: transactions };
        }
        catch (error) {
            return { success: false, error: resource_1.Resource.INTERNAL_SERVER_ERROR };
        }
    }
    /**
     * Counts transactions for a specific account.
     *
     * @summary Gets count of transactions for an account.
     * @param accountId - Account ID.
     * @returns Count of transactions.
     */
    async countTransactionsByAccount(accountId) {
        try {
            const count = await this.transactionRepository.count({
                accountId: { operator: enum_1.Operator.EQUAL, value: accountId }
            });
            return { success: true, data: count };
        }
        catch (error) {
            return { success: false, error: resource_1.Resource.INTERNAL_SERVER_ERROR };
        }
    }
    /**
     * Retrieves all transactions for a given user, grouped by their accounts.
     *
     * @summary Gets all transactions for a user grouped by account.
     * @param userId - ID of the user.
     * @returns A list of grouped transactions by account.
     */
    async getTransactionsByUser(userId, options) {
        var _a;
        const accountService = new accountService_1.AccountService();
        const userAccounts = await accountService.getAccountsByUser(userId);
        if (!userAccounts.success || !((_a = userAccounts.data) === null || _a === void 0 ? void 0 : _a.length)) {
            return { success: false, error: resource_1.Resource.ACCOUNT_NOT_FOUND };
        }
        const accountIds = userAccounts.data.map(acc => acc.id);
        try {
            const allTransactions = await this.transactionRepository.findMany({
                accountId: { operator: enum_1.Operator.IN, value: accountIds }
            }, {
                limit: options === null || options === void 0 ? void 0 : options.limit,
                offset: options === null || options === void 0 ? void 0 : options.offset,
                sort: (options === null || options === void 0 ? void 0 : options.sort) || 'date',
                order: (options === null || options === void 0 ? void 0 : options.order) === enum_1.Operator.DESC ? 'desc' : 'asc',
            });
            const grouped = accountIds.map(accountId => ({
                accountId,
                transactions: allTransactions.filter(t => t.accountId === accountId)
            }));
            return { success: true, data: grouped };
        }
        catch (error) {
            return { success: false, error: resource_1.Resource.INTERNAL_SERVER_ERROR };
        }
    }
    /**
     * Counts transactions across all accounts for a specific user.
     *
     * @summary Gets count of transactions for a user.
     * @param userId - User ID.
     * @returns Count of transactions.
     */
    async countTransactionsByUser(userId) {
        var _a;
        const accountService = new accountService_1.AccountService();
        const userAccounts = await accountService.getAccountsByUser(userId);
        if (!userAccounts.success || !((_a = userAccounts.data) === null || _a === void 0 ? void 0 : _a.length)) {
            return { success: false, error: resource_1.Resource.ACCOUNT_NOT_FOUND };
        }
        const accountIds = userAccounts.data.map(acc => acc.id);
        try {
            const count = await this.transactionRepository.count({
                accountId: { operator: enum_1.Operator.IN, value: accountIds }
            });
            return { success: true, data: count };
        }
        catch (error) {
            return { success: false, error: resource_1.Resource.INTERNAL_SERVER_ERROR };
        }
    }
    /**
     * Updates a transaction by ID.
     *
     * @summary Updates transaction data.
     * @param id - ID of the transaction.
     * @param data - Partial transaction data to update.
     * @returns Updated transaction record.
     */
    async updateTransaction(id, data) {
        var _a, _b;
        const current = await this.transactionRepository.findById(id);
        if (!current) {
            return { success: false, error: resource_1.Resource.TRANSACTION_NOT_FOUND };
        }
        const effectiveSource = data.transactionSource !== undefined ? data.transactionSource : current.transactionSource;
        if (effectiveSource === enum_1.TransactionSource.ACCOUNT) {
            const accId = data.accountId !== undefined ? data.accountId : current.accountId;
            const account = await new accountService_1.AccountService().getAccountById(Number(accId));
            if (!account.success || !account.data) {
                return { success: false, error: resource_1.Resource.ACCOUNT_NOT_FOUND };
            }
            if (data.creditCardId !== undefined) {
                data.creditCardId = null;
            }
        }
        else {
            const cardId = data.creditCardId !== undefined ? data.creditCardId : current.creditCardId;
            const card = await new creditCardService_1.CreditCardService().getCreditCardById(Number(cardId));
            if (!card.success || !card.data) {
                return { success: false, error: resource_1.Resource.CREDIT_CARD_NOT_FOUND };
            }
            if (data.accountId !== undefined) {
                data.accountId = null;
            }
        }
        const effectiveCategoryId = data.categoryId !== undefined ? data.categoryId : current.categoryId;
        const effectiveSubcategoryId = data.subcategoryId !== undefined ? data.subcategoryId : current.subcategoryId;
        if (!effectiveCategoryId && !effectiveSubcategoryId) {
            return { success: false, error: resource_1.Resource.CATEGORY_OR_SUBCATEGORY_REQUIRED };
        }
        if (data.categoryId !== undefined) {
            const category = await new categoryService_1.CategoryService().getCategoryById(Number(data.categoryId));
            if (!category.success || !((_a = category.data) === null || _a === void 0 ? void 0 : _a.active)) {
                return { success: false, error: resource_1.Resource.CATEGORY_NOT_FOUND_OR_INACTIVE };
            }
        }
        if (data.subcategoryId !== undefined) {
            const subcategory = await new subcategoryService_1.SubcategoryService().getSubcategoryById(Number(data.subcategoryId));
            if (!subcategory.success || !((_b = subcategory.data) === null || _b === void 0 ? void 0 : _b.active)) {
                return { success: false, error: resource_1.Resource.SUBCATEGORY_NOT_FOUND_OR_INACTIVE };
            }
        }
        try {
            const updated = await this.transactionRepository.update(id, data);
            return { success: true, data: updated };
        }
        catch (error) {
            return { success: false, error: resource_1.Resource.INTERNAL_SERVER_ERROR };
        }
    }
    /**
     * Deletes a transaction by ID after verifying its existence.
     *
     * @summary Removes a transaction from the database.
     * @param id - ID of the transaction to delete.
     * @returns Success with deleted ID, or error if transaction does not exist.
     */
    async deleteTransaction(id) {
        const existing = await this.transactionRepository.findById(id);
        if (!existing) {
            return { success: false, error: resource_1.Resource.TRANSACTION_NOT_FOUND };
        }
        try {
            await this.transactionRepository.delete(id);
            return { success: true, data: { id } };
        }
        catch (error) {
            return { success: false, error: resource_1.Resource.INTERNAL_SERVER_ERROR };
        }
    }
}
exports.TransactionService = TransactionService;
