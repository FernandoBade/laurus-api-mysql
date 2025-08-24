import { Operator, TableName } from '../utils/enum';
import { DbService } from '../utils/database/services/dbService';
import { DbResponse } from '../utils/database/services/dbResponse';
import { Resource } from '../utils/resources/resource';
import { findWithColumnFilters, countWithColumnFilters } from '../utils/database/helpers/dbHelpers';
import { UserService } from './userService';
import { AccountService } from './accountService';
import CreditCard from '../model/creditCard/creditCard';
import { QueryOptions } from '../utils/pagination';

export type CreditCardRow = CreditCard & { user_id: number; account_id: number | null };

export class CreditCardService extends DbService {
    constructor() {
        super(TableName.CREDIT_CARD);
    }

    async createCreditCard(data: {
        name: string;
        flag: string;
        observation?: string;
        user_id: number;
        account_id?: number;
        active?: boolean;
    }): Promise<DbResponse<CreditCardRow>> {
        const userService = new UserService();
        const user = await userService.getUserById(data.user_id);

        if (!user.success || !user.data) {
            return { success: false, error: Resource.USER_NOT_FOUND };
        }

        if (data.account_id !== undefined) {
            const accountService = new AccountService();
            const account = await accountService.getAccountById(data.account_id);
            if (!account.success || !account.data) {
                return { success: false, error: Resource.ACCOUNT_NOT_FOUND };
            }

            const existing = await findWithColumnFilters<CreditCardRow>(TableName.CREDIT_CARD, {
                account_id: { operator: Operator.EQUAL, value: data.account_id }
            });
            if (existing.success && existing.data && existing.data.length > 0) {
                return { success: false, error: Resource.ACCOUNT_NOT_FOUND };
            }
        }

        const result = await this.create<CreditCardRow>(data);
        if (!result.success || !result.data?.id) {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        }

        return this.findOne<CreditCardRow>(result.data.id);
    }

    async getCreditCards(options?: QueryOptions<CreditCardRow>): Promise<DbResponse<CreditCardRow[]>> {
        return findWithColumnFilters<CreditCardRow>(TableName.CREDIT_CARD, {}, {
            orderBy: options?.sort as keyof CreditCardRow,
            direction: options?.order,
            limit: options?.limit,
            offset: options?.offset,
        });
    }

    async countCreditCards(): Promise<DbResponse<number>> {
        return countWithColumnFilters<CreditCardRow>(TableName.CREDIT_CARD);
    }

    async getCreditCardById(id: number): Promise<DbResponse<CreditCardRow>> {
        return this.findOne<CreditCardRow>(id);
    }

    async getCreditCardsByUser(userId: number, options?: QueryOptions<CreditCardRow>): Promise<DbResponse<CreditCardRow[]>> {
        return findWithColumnFilters<CreditCardRow>(TableName.CREDIT_CARD, {
            user_id: { operator: Operator.EQUAL, value: userId }
        }, {
            orderBy: options?.sort as keyof CreditCardRow,
            direction: options?.order,
            limit: options?.limit,
            offset: options?.offset,
        });
    }

    async countCreditCardsByUser(userId: number): Promise<DbResponse<number>> {
        return countWithColumnFilters<CreditCardRow>(TableName.CREDIT_CARD, {
            user_id: { operator: Operator.EQUAL, value: userId }
        });
    }

    async updateCreditCard(id: number, data: Partial<CreditCardRow>): Promise<DbResponse<CreditCardRow>> {
        if (data.user_id !== undefined) {
            const userService = new UserService();
            const user = await userService.getUserById(data.user_id);
            if (!user.success || !user.data) {
                return { success: false, error: Resource.USER_NOT_FOUND };
            }
        }

        if (data.account_id !== undefined) {
            const accountService = new AccountService();
            const account = await accountService.getAccountById(Number(data.account_id));
            if (!account.success || !account.data) {
                return { success: false, error: Resource.ACCOUNT_NOT_FOUND };
            }

            const existing = await findWithColumnFilters<CreditCardRow>(TableName.CREDIT_CARD, {
                account_id: { operator: Operator.EQUAL, value: data.account_id }
            });
            if (existing.success && existing.data && existing.data.length > 0 && existing.data[0].id !== id) {
                return { success: false, error: Resource.ACCOUNT_NOT_FOUND };
            }
        }

        const updateResult = await this.update<CreditCardRow>(id, data);
        if (!updateResult.success) {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        }

        return this.findOne<CreditCardRow>(id);
    }

    async deleteCreditCard(id: number): Promise<DbResponse<{ id: number }>> {
        const existing = await this.findOne<CreditCardRow>(id);
        if (!existing.success) {
            return { success: false, error: Resource.CREDIT_CARD_NOT_FOUND };
        }
        return this.remove(id);
    }
}

