import { Operator, TableName } from '../utils/enum';
import { DbService } from '../utils/database/services/dbService';
import { DbResponse } from '../utils/database/services/dbResponse';
import { Resource } from '../utils/resources/resource';
import { findWithColumnFilters } from '../utils/database/helpers/dbHelpers';
import { UserService } from './userService';
import Category from '../model/category/category';

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
     * @returns A list of all categories.
     */
    async getCategories(): Promise<DbResponse<CategoryRow[]>> {
        return this.findMany<CategoryRow>();
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
    async getCategoriesByUser(userId: number): Promise<DbResponse<CategoryRow[]>> {
        return findWithColumnFilters<CategoryRow>(TableName.CATEGORY, {
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
