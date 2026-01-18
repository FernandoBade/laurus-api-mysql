import { CreditCardFlag, Operator } from '../utils/enum';
import { CreditCardRepository } from '../repositories/creditCardRepository';
import { UserService } from './userService';
import { AccountService } from './accountService';
import { Resource } from '../utils/resources/resource';
import { SelectCreditCard, InsertCreditCard } from '../db/schema';
import { QueryOptions } from '../utils/pagination';

export type CreditCardRow = SelectCreditCard;

/** @summary Service for credit card business logic.
 * Handles credit card operations including validation and user/account linking.
 */
export class CreditCardService {
    private creditCardRepository: CreditCardRepository;

    constructor() {
        this.creditCardRepository = new CreditCardRepository();
    }

    /**
     * Creates a new credit card.
     *
     * @summary Creates a new credit card for a user.
     * @param data - Credit card creation data.
     * @returns The created credit card record.
     */
    async createCreditCard(data: {
        name: string;
        flag: CreditCardFlag;
        observation?: string;
        userId: number;
        accountId?: number;
        limit?: number;
        active?: boolean;
    }): Promise<{ success: true; data: SelectCreditCard } | { success: false; error: Resource }> {
        const userService = new UserService();
        const user = await userService.getUserById(data.userId);

        if (!user.success || !user.data) {
            return { success: false, error: Resource.USER_NOT_FOUND };
        }

        if (data.accountId !== undefined) {
            const accountService = new AccountService();
            const account = await accountService.getAccountById(data.accountId);
            if (!account.success || !account.data) {
                return { success: false, error: Resource.ACCOUNT_NOT_FOUND };
            }

            const existing = await this.creditCardRepository.findMany({
                accountId: { operator: Operator.EQUAL, value: data.accountId }
            });
            if (existing.length > 0) {
                return { success: false, error: Resource.DATA_ALREADY_EXISTS };
            }
        }

        try {
            const created = await this.creditCardRepository.create({
                name: data.name,
                flag: data.flag,
                observation: data.observation,
                active: data.active,
                userId: data.userId,
                accountId: data.accountId,
                limit: data.limit !== undefined ? data.limit.toFixed(2) : undefined,
            } as InsertCreditCard);
            return { success: true, data: created };
        } catch (error) {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        }
    }

    /**
     * Retrieves all credit cards.
     *
     * @summary Gets all credit cards with optional pagination and sorting.
     * @param options - Query options for pagination and sorting.
     * @returns A list of all credit cards.
     */
    async getCreditCards(options?: QueryOptions<SelectCreditCard>): Promise<{ success: true; data: SelectCreditCard[] } | { success: false; error: Resource }> {
        try {
            const creditCards = await this.creditCardRepository.findMany(undefined, {
                limit: options?.limit,
                offset: options?.offset,
                sort: options?.sort as keyof SelectCreditCard,
                order: options?.order === Operator.DESC ? 'desc' : 'asc',
            });
            return { success: true, data: creditCards };
        } catch (error) {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        }
    }

    /**
     * Counts all credit cards.
     *
     * @summary Gets total count of credit cards.
     * @returns Total credit card count.
     */
    async countCreditCards(): Promise<{ success: true; data: number } | { success: false; error: Resource }> {
        try {
            const count = await this.creditCardRepository.count();
            return { success: true, data: count };
        } catch (error) {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        }
    }

    /**
     * Retrieves a credit card by its ID.
     *
     * @summary Gets a credit card by ID.
     * @param id - ID of the credit card.
     * @returns Credit card record if found.
     */
    async getCreditCardById(id: number): Promise<{ success: true; data: SelectCreditCard } | { success: false; error: Resource }> {
        const creditCard = await this.creditCardRepository.findById(id);
        if (!creditCard) {
            return { success: false, error: Resource.CREDIT_CARD_NOT_FOUND };
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
    async getCreditCardsByUser(userId: number, options?: QueryOptions<SelectCreditCard>): Promise<{ success: true; data: SelectCreditCard[] } | { success: false; error: Resource }> {
        try {
            const creditCards = await this.creditCardRepository.findMany({
                userId: { operator: Operator.EQUAL, value: userId }
            }, {
                limit: options?.limit,
                offset: options?.offset,
                sort: options?.sort as keyof SelectCreditCard,
                order: options?.order === Operator.DESC ? 'desc' : 'asc',
            });
            return { success: true, data: creditCards };
        } catch (error) {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        }
    }

    /**
     * Counts credit cards for a user.
     *
     * @summary Gets count of credit cards for a user.
     * @param userId - User ID.
     * @returns Count of user's credit cards.
     */
    async countCreditCardsByUser(userId: number): Promise<{ success: true; data: number } | { success: false; error: Resource }> {
        try {
            const count = await this.creditCardRepository.count({
                userId: { operator: Operator.EQUAL, value: userId }
            });
            return { success: true, data: count };
        } catch (error) {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
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
    async updateCreditCard(id: number, data: Partial<Omit<InsertCreditCard, 'balance' | 'limit'>> & { balance?: number; limit?: number | string }): Promise<{ success: true; data: SelectCreditCard } | { success: false; error: Resource }> {
        const { balance: _ignored, ...safeData } = data;

        if (data.userId !== undefined) {
            const userService = new UserService();
            const user = await userService.getUserById(data.userId);
            if (!user.success || !user.data) {
                return { success: false, error: Resource.USER_NOT_FOUND };
            }
        }

        if (safeData.accountId !== undefined) {
            if (safeData.accountId === null) {
                safeData.accountId = null;
            } else {
                const accountService = new AccountService();
                const account = await accountService.getAccountById(safeData.accountId);
                if (!account.success || !account.data) {
                    return { success: false, error: Resource.ACCOUNT_NOT_FOUND };
                }

                const existing = await this.creditCardRepository.findMany({
                    accountId: { operator: Operator.EQUAL, value: safeData.accountId }
                });
                if (existing.length > 0 && existing[0].id !== id) {
                    return { success: false, error: Resource.DATA_ALREADY_EXISTS };
                }
            }
        }

        try {
            const { limit, ...rest } = safeData as any;
            const dbData: Partial<InsertCreditCard> = { ...rest } as Partial<InsertCreditCard>;
            if (limit !== undefined && limit !== null) {
                dbData.limit = typeof limit === 'number' ? limit.toFixed(2) as InsertCreditCard['limit'] : String(limit) as InsertCreditCard['limit'];
            }
            const updated = await this.creditCardRepository.update(id, dbData);
            return { success: true, data: updated };
        } catch (error) {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        }
    }

    /**
     * Deletes a credit card by ID.
     *
     * @summary Removes a credit card from the database.
     * @param id - ID of the credit card to delete.
     * @returns Success with deleted ID, or error if credit card does not exist.
     */
    async deleteCreditCard(id: number): Promise<{ success: true; data: { id: number } } | { success: false; error: Resource }> {
        const existing = await this.creditCardRepository.findById(id);
        if (!existing) {
            return { success: false, error: Resource.CREDIT_CARD_NOT_FOUND };
        }

        try {
            await this.creditCardRepository.delete(id);
            return { success: true, data: { id } };
        } catch (error) {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        }
    }
}
