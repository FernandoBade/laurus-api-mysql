import { Operator, TableName } from '../utils/enum';
import { DbService } from '../utils/database/services/dbService';
import { DbResponse } from '../utils/database/services/dbResponse';
import { Resource } from '../utils/resources/resource';
import { findWithColumnFilters, countWithColumnFilters } from '../utils/database/helpers/dbHelpers';
import { UserService } from './userService';
import Category from '../model/category/category';
import { QueryOptions } from '../utils/pagination';

type CategoryRow = Category & { user_id: number };

export class CategoryService extends DbService {
    constructor() {
        super(TableName.CATEGORY);
    }

    /** @summary Creates a new category linked to a valid user.
     *
     * @param data - Category creation data.
     * @returns The created category record.
     */
    async createCategory(data: {
        name: string;
        type: string;
        color?: string;
        active?: boolean;
        user_id: number;
    }): Promise<DbResponse<CategoryRow>> {
        const userService = new UserService();
        const user = await userService.getUserById(data.user_id);

        if (!user.success || !user.data) {
            return { success: false, error: Resource.USER_NOT_FOUND };
        }

        const result = await this.create<CategoryRow>(data);
        if (!result.success || !result.data?.id) {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        }

        return this.findOne<CategoryRow>(result.data.id);
    }


    /** @summary Retrieves all category records from the database.
     *
     * @param options - Query options for pagination and sorting.
     * @returns A list of all categories.
     */
    async getCategories(options?: QueryOptions<CategoryRow>): Promise<DbResponse<CategoryRow[]>> {
        return findWithColumnFilters<CategoryRow>(TableName.CATEGORY, {}, {
            orderBy: options?.sort as keyof CategoryRow,
            direction: options?.order,
            limit: options?.limit,
            offset: options?.offset,
        });
    }

    /** @summary Counts all categories. */
    async countCategories(): Promise<DbResponse<number>> {
        return countWithColumnFilters<CategoryRow>(TableName.CATEGORY);
    }

    /** @summary Retrieves a category by its ID.
     *
     * @param id - ID of the category.
     * @returns The category if found.
     */
    async getCategoryById(id: number): Promise<DbResponse<CategoryRow>> {
        return this.findOne<CategoryRow>(id);
    }

    /** @summary Retrieves all categories linked to a specific user.
     *
     * @param userId - ID of the user.
     * @returns A list of categories owned by the user.
     */
    async getCategoriesByUser(userId: number, options?: QueryOptions<CategoryRow>): Promise<DbResponse<CategoryRow[]>> {
        return findWithColumnFilters<CategoryRow>(TableName.CATEGORY, {
            user_id: { operator: Operator.EQUAL, value: userId }
        }, {
            orderBy: options?.sort as keyof CategoryRow,
            direction: options?.order,
            limit: options?.limit,
            offset: options?.offset,
        });
    }

    /** @summary Counts categories belonging to a specific user. */
    async countCategoriesByUser(userId: number): Promise<DbResponse<number>> {
        return countWithColumnFilters<CategoryRow>(TableName.CATEGORY, {
            user_id: { operator: Operator.EQUAL, value: userId }
        });
    }

    /** @summary Updates a category by ID.
     * Validates the user if the user_id is being changed.
     *
     * @param id - ID of the category.
     * @param data - Partial category data to update.
     * @returns Updated category record.
     */
    async updateCategory(id: number, data: Partial<CategoryRow>): Promise<DbResponse<CategoryRow>> {
        if (data.user_id !== undefined) {
            const userService = new UserService();
            const user = await userService.getUserById(data.user_id);

            if (!user.success || !user.data) {
                return { success: false, error: Resource.USER_NOT_FOUND };
            }
        }

        const updateResult = await this.update<CategoryRow>(id, data);
        if (!updateResult.success) {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        }

        return this.findOne<CategoryRow>(id);
    }

    /**
     * Deletes a category by ID after validating its existence.
     *
     * @param id - ID of the category to delete.
     * @returns  Success with deleted ID, or error if category does not exist.
     */
    async deleteCategory(id: number): Promise<DbResponse<{ id: number }>> {
        const existing = await this.findOne<CategoryRow>(id);

        if (!existing.success) {
            return { success: false, error: Resource.CATEGORY_NOT_FOUND };
        }

        return this.remove(id);
    }
}
