"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreditCardService = void 0;
const enum_1 = require("../utils/enum");
const creditCardRepository_1 = require("../repositories/creditCardRepository");
const userService_1 = require("./userService");
const accountService_1 = require("./accountService");
const resource_1 = require("../utils/resources/resource");
/** @summary Service for credit card business logic.
 * Handles credit card operations including validation and user/account linking.
 */
class CreditCardService {
    constructor() {
        this.creditCardRepository = new creditCardRepository_1.CreditCardRepository();
    }
    /**
     * Creates a new credit card.
     *
     * @summary Creates a new credit card for a user.
     * @param data - Credit card creation data.
     * @returns The created credit card record.
     */
    async createCreditCard(data) {
        const userService = new userService_1.UserService();
        const user = await userService.getUserById(data.userId);
        if (!user.success || !user.data) {
            return { success: false, error: resource_1.Resource.USER_NOT_FOUND };
        }
        if (data.accountId !== undefined) {
            const accountService = new accountService_1.AccountService();
            const account = await accountService.getAccountById(data.accountId);
            if (!account.success || !account.data) {
                return { success: false, error: resource_1.Resource.ACCOUNT_NOT_FOUND };
            }
            const existing = await this.creditCardRepository.findMany({
                accountId: { operator: enum_1.Operator.EQUAL, value: data.accountId }
            });
            if (existing.length > 0) {
                return { success: false, error: resource_1.Resource.DATA_ALREADY_EXISTS };
            }
        }
        try {
            const created = await this.creditCardRepository.create(Object.assign(Object.assign({}, data), { user_id: data.userId, account_id: data.accountId }));
            return { success: true, data: created };
        }
        catch (error) {
            return { success: false, error: resource_1.Resource.INTERNAL_SERVER_ERROR };
        }
    }
    /**
     * Retrieves all credit cards.
     *
     * @summary Gets all credit cards with optional pagination and sorting.
     * @param options - Query options for pagination and sorting.
     * @returns A list of all credit cards.
     */
    async getCreditCards(options) {
        try {
            const creditCards = await this.creditCardRepository.findMany(undefined, {
                limit: options === null || options === void 0 ? void 0 : options.limit,
                offset: options === null || options === void 0 ? void 0 : options.offset,
                sort: options === null || options === void 0 ? void 0 : options.sort,
                order: (options === null || options === void 0 ? void 0 : options.order) === enum_1.Operator.DESC ? 'desc' : 'asc',
            });
            return { success: true, data: creditCards };
        }
        catch (error) {
            return { success: false, error: resource_1.Resource.INTERNAL_SERVER_ERROR };
        }
    }
    /**
     * Counts all credit cards.
     *
     * @summary Gets total count of credit cards.
     * @returns Total credit card count.
     */
    async countCreditCards() {
        try {
            const count = await this.creditCardRepository.count();
            return { success: true, data: count };
        }
        catch (error) {
            return { success: false, error: resource_1.Resource.INTERNAL_SERVER_ERROR };
        }
    }
    /**
     * Retrieves a credit card by its ID.
     *
     * @summary Gets a credit card by ID.
     * @param id - ID of the credit card.
     * @returns Credit card record if found.
     */
    async getCreditCardById(id) {
        const creditCard = await this.creditCardRepository.findById(id);
        if (!creditCard) {
            return { success: false, error: resource_1.Resource.CREDIT_CARD_NOT_FOUND };
        }
        return { success: true, data: creditCard };
    }
    /**
     * Retrieves all credit cards for a user.
     *
     * @summary Gets all credit cards for a user.
     * @param userId - User ID.
     * @returns A list of credit cards owned by the user.
     */
    async getCreditCardsByUser(userId, options) {
        try {
            const creditCards = await this.creditCardRepository.findMany({
                userId: { operator: enum_1.Operator.EQUAL, value: userId }
            }, {
                limit: options === null || options === void 0 ? void 0 : options.limit,
                offset: options === null || options === void 0 ? void 0 : options.offset,
                sort: options === null || options === void 0 ? void 0 : options.sort,
                order: (options === null || options === void 0 ? void 0 : options.order) === enum_1.Operator.DESC ? 'desc' : 'asc',
            });
            return { success: true, data: creditCards };
        }
        catch (error) {
            return { success: false, error: resource_1.Resource.INTERNAL_SERVER_ERROR };
        }
    }
    /**
     * Counts credit cards for a user.
     *
     * @summary Gets count of credit cards for a user.
     * @param userId - User ID.
     * @returns Count of user's credit cards.
     */
    async countCreditCardsByUser(userId) {
        try {
            const count = await this.creditCardRepository.count({
                userId: { operator: enum_1.Operator.EQUAL, value: userId }
            });
            return { success: true, data: count };
        }
        catch (error) {
            return { success: false, error: resource_1.Resource.INTERNAL_SERVER_ERROR };
        }
    }
    /**
     * Updates a credit card by ID.
     *
     * @summary Updates credit card data.
     * @param id - ID of the credit card.
     * @param data - Partial credit card data to update.
     * @returns Updated credit card record.
     */
    async updateCreditCard(id, data) {
        if (data.userId !== undefined) {
            const userService = new userService_1.UserService();
            const user = await userService.getUserById(data.userId);
            if (!user.success || !user.data) {
                return { success: false, error: resource_1.Resource.USER_NOT_FOUND };
            }
        }
        if (data.accountId !== undefined) {
            if (data.accountId === null) {
                data.accountId = null;
            }
            else {
                const accountService = new accountService_1.AccountService();
                const account = await accountService.getAccountById(data.accountId);
                if (!account.success || !account.data) {
                    return { success: false, error: resource_1.Resource.ACCOUNT_NOT_FOUND };
                }
                const existing = await this.creditCardRepository.findMany({
                    accountId: { operator: enum_1.Operator.EQUAL, value: data.accountId }
                });
                if (existing.length > 0 && existing[0].id !== id) {
                    return { success: false, error: resource_1.Resource.DATA_ALREADY_EXISTS };
                }
            }
        }
        try {
            const updated = await this.creditCardRepository.update(id, data);
            return { success: true, data: updated };
        }
        catch (error) {
            return { success: false, error: resource_1.Resource.INTERNAL_SERVER_ERROR };
        }
    }
    /**
     * Deletes a credit card by ID.
     *
     * @summary Removes a credit card from the database.
     * @param id - ID of the credit card to delete.
     * @returns Success with deleted ID, or error if credit card does not exist.
     */
    async deleteCreditCard(id) {
        const existing = await this.creditCardRepository.findById(id);
        if (!existing) {
            return { success: false, error: resource_1.Resource.CREDIT_CARD_NOT_FOUND };
        }
        try {
            await this.creditCardRepository.delete(id);
            return { success: true, data: { id } };
        }
        catch (error) {
            return { success: false, error: resource_1.Resource.INTERNAL_SERVER_ERROR };
        }
    }
}
exports.CreditCardService = CreditCardService;
