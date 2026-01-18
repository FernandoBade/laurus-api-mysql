import { Operator } from '../utils/enum';
import { CategoryRepository } from '../repositories/categoryRepository';
import { UserService } from './userService';
import { Resource } from '../utils/resources/resource';
import { SelectCategory, InsertCategory } from '../db/schema';
import { QueryOptions } from '../utils/pagination';

/**
 * Service for category business logic.
 * Handles category operations including validation and user linking.
 */
export class CategoryService {
    private categoryRepository: CategoryRepository;

    constructor() {
        this.categoryRepository = new CategoryRepository();
    }

    /**
     * Creates a new category linked to a valid user.
     *
     * @summary Creates a new category for a user.
     * @param data - Category creation data.
     * @returns The created category record.
     */
    async createCategory(data: {
        name: string;
        type: string;
        color?: string;
        active?: boolean;
        userId: number;
    }): Promise<{ success: true; data: SelectCategory } | { success: false; error: Resource }> {
        const userService = new UserService();
        const user = await userService.getUserById(data.userId);

        if (!user.success || !user.data) {
            return { success: false, error: Resource.USER_NOT_FOUND };
        }

        try {
            const created = await this.categoryRepository.create({
                ...data,
                user_id: data.userId,
            } as InsertCategory);
            return { success: true, data: created };
        } catch (error) {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        }
    }

    /**
     * Retrieves all category records from the database.
     *
     * @summary Gets all categories with optional pagination and sorting.
     * @param options - Query options for pagination and sorting.
     * @returns A list of all categories.
     */
    async getCategories(options?: QueryOptions<SelectCategory>): Promise<{ success: true; data: SelectCategory[] } | { success: false; error: Resource }> {
        try {
            const categories = await this.categoryRepository.findMany(undefined, {
                limit: options?.limit,
                offset: options?.offset,
                sort: options?.sort as keyof SelectCategory,
                order: options?.order === Operator.DESC ? 'desc' : 'asc',
            });
            return { success: true, data: categories };
        } catch (error) {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        }
    }

    /**
     * Counts all categories.
     *
     * @summary Gets total count of categories.
     * @returns Total category count.
     */
    async countCategories(): Promise<{ success: true; data: number } | { success: false; error: Resource }> {
        try {
            const count = await this.categoryRepository.count();
            return { success: true, data: count };
        } catch (error) {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        }
    }

    /**
     * Retrieves a category by its ID.
     *
     * @summary Gets a category by ID.
     * @param id - ID of the category.
     * @returns The category if found.
     */
    async getCategoryById(id: number): Promise<{ success: true; data: SelectCategory } | { success: false; error: Resource }> {
        const category = await this.categoryRepository.findById(id);
        if (!category) {
            return { success: false, error: Resource.NO_RECORDS_FOUND };
        }
        return { success: true, data: category };
    }

    /**
     * Retrieves all categories linked to a specific user.
     *
     * @summary Gets all categories for a user.
     * @param userId - ID of the user.
     * @returns A list of categories owned by the user.
     */
    async getCategoriesByUser(userId: number, options?: QueryOptions<SelectCategory>): Promise<{ success: true; data: SelectCategory[] } | { success: false; error: Resource }> {
        try {
            const categories = await this.categoryRepository.findMany({
                userId: { operator: Operator.EQUAL, value: userId }
            }, {
                limit: options?.limit,
                offset: options?.offset,
                sort: options?.sort as keyof SelectCategory,
                order: options?.order === Operator.DESC ? 'desc' : 'asc',
            });
            return { success: true, data: categories };
        } catch (error) {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        }
    }

    /**
     * Counts categories belonging to a specific user.
     *
     * @summary Gets count of categories for a user.
     * @param userId - User ID.
     * @returns Count of user's categories.
     */
    async countCategoriesByUser(userId: number): Promise<{ success: true; data: number } | { success: false; error: Resource }> {
        try {
            const count = await this.categoryRepository.count({
                userId: { operator: Operator.EQUAL, value: userId }
            });
            return { success: true, data: count };
        } catch (error) {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        }
    }

    /**
     * Updates a category by ID.
     * Validates the user if the userId is being changed.
     *
     * @summary Updates category data.
     * @param id - ID of the category.
     * @param data - Partial category data to update.
     * @returns Updated category record.
     */
    async updateCategory(id: number, data: Partial<InsertCategory>): Promise<{ success: true; data: SelectCategory } | { success: false; error: Resource }> {
        if (data.userId !== undefined) {
            const userService = new UserService();
            const user = await userService.getUserById(data.userId);

            if (!user.success || !user.data) {
                return { success: false, error: Resource.USER_NOT_FOUND };
            }
        }

        try {
            const updated = await this.categoryRepository.update(id, data);
            return { success: true, data: updated };
        } catch (error) {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        }
    }

    /**
     * Deletes a category by ID after validating its existence.
     *
     * @summary Removes a category from the database.
     * @param id - ID of the category to delete.
     * @returns Success with deleted ID, or error if category does not exist.
     */
    async deleteCategory(id: number): Promise<{ success: true; data: { id: number } } | { success: false; error: Resource }> {
        const existing = await this.categoryRepository.findById(id);
        if (!existing) {
            return { success: false, error: Resource.CATEGORY_NOT_FOUND };
        }

        try {
            await this.categoryRepository.delete(id);
            return { success: true, data: { id } };
        } catch (error) {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        }
    }
}
