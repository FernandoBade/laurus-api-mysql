import { Operator, TableName } from '../utils/enum';
import { DbService } from '../utils/database/services/dbService';
import { DbResponse } from '../utils/database/services/dbResponse';
import { Resource } from '../utils/resources/resource';
import { findWithColumnFilters } from '../utils/database/helpers/dbHelpers';
import { CategoryService } from './categoryService';

export class SubcategoryService extends DbService {
    constructor() {
        super(TableName.SUBCATEGORY);
    }

    /**
     * Creates a new subcategory.
     * Ensures the required data is present and linked to a valid and authorized category.
     *
     * @param data - Subcategory creation data.
     * @param userId - Optional ID of the user performing the operation.
     * @returns The created subcategory record.
     */
    async createSubcategory(data: {
        name: string;
        category_id: number;
        active?: boolean;
    }, userId?: number): Promise<DbResponse<any>> {
        const categoryService = new CategoryService();
        const category = await categoryService.getCategoryById(data.category_id);

        if (!category.success || !category.data?.active) {
            return { success: false, error: Resource.CATEGORY_NOT_FOUND_OR_INACTIVE };
        }

        if (userId !== undefined && category.data.user_id !== userId) {
            return { success: false, error: Resource.UNAUTHORIZED_OPERATION };
        }

        const result = await this.create(data);
        if (!result.success || !result.data?.id) {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        }

        return this.findOne(result.data.id);
    }



    /**
     * Retrieves all subcategories from the database.
     *
     * @returns A list of all subcategories.
     */
    async getSubcategories(): Promise<DbResponse<any[]>> {
        return this.findMany<any>();
    }

    /**
     * Retrieves all subcategories for a given category ID.
     *
     * @param categoryId - ID of the parent category.
     * @returns A list of subcategories under the specified category.
     */
    async getSubcategoriesByCategory(categoryId: number): Promise<DbResponse<any[]>> {
        return findWithColumnFilters<any>(TableName.SUBCATEGORY, {
            category_id: { operator: Operator.EQUAL, value: categoryId }
        });
    }

    /**
     * Retrieves a subcategory by its ID.
     *
     * @param id - ID of the subcategory.
     * @returns Subcategory record if found.
     */
    async getSubcategoryById(id: number): Promise<DbResponse<any>> {
        return this.findOne(id);
    }


    /**
     * Retrieves all subcategories linked to any category of a specific user.
     *
     * @param userId - ID of the user whose subcategories are being requested.
     * @returns A list of subcategories across all categories owned by the user.
     */
    async getSubcategoriesByUser(userId: number): Promise<DbResponse<any[]>> {
        const categoryService = new CategoryService();
        const userCategories = await categoryService.getCategoriesByUser(userId);

        if (!userCategories.success || !userCategories.data?.length) {
            return { success: false, error: Resource.NO_RECORDS_FOUND };
        }

        const categoryIds = userCategories.data.map(c => c.id);

        return findWithColumnFilters<any>(TableName.SUBCATEGORY, {
            category_id: { operator: Operator.IN, value: categoryIds }
        });
    }


    /**
     * Updates a subcategory by ID.
     * Validates the category if the category_id is being changed, including ownership.
     *
     * @param id - ID of the subcategory.
     * @param data - Partial subcategory data to update.
     * @param userId - Optional ID of the user performing the operation.
     * @returns Updated subcategory record.
     */
    async updateSubcategory(id: number, data: Partial<any>, userId?: number): Promise<DbResponse<any>> {
        if (data.category_id !== undefined) {
            const categoryService = new CategoryService();
            const category = await categoryService.getCategoryById(data.category_id);

            if (!category.success || !category.data?.active) {
                return { success: false, error: Resource.CATEGORY_NOT_FOUND_OR_INACTIVE };
            }

            if (userId !== undefined && category.data.user_id !== userId) {
                return { success: false, error: Resource.UNAUTHORIZED_OPERATION };
            }
        }

        const updateResult = await this.update(id, data);
        if (!updateResult.success) {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        }
        return this.findOne(id);
    }


    /**
     * Deletes a subcategory by ID after verifying its existence.
     *
     * @param id - ID of the subcategory.
     * @returns  Success with deleted ID, or error if subcategory does not exist.
     */
    async deleteSubcategory(id: number): Promise<DbResponse<{ id: number }>> {
        const existing = await this.findOne(id);

        if (!existing.success) {
            return { success: false, error: Resource.SUBCATEGORY_NOT_FOUND };
        }

        return this.remove(id);
    }
}
