import { Operator } from '../utils/enum';
import { TagRepository } from '../repositories/tagRepository';
import { UserService } from './userService';
import { Resource } from '../utils/resources/resource';
import { SelectTag, InsertTag } from '../db/schema';
import { QueryOptions } from '../utils/pagination';

/**
 * Service for tag business logic.
 * Handles tag operations including validation and user linking.
 */
export class TagService {
    private tagRepository: TagRepository;

    constructor() {
        this.tagRepository = new TagRepository();
    }

    /**
     * Creates a new tag linked to a valid user.
     *
     * @summary Creates a new tag for a user.
     * @param data - Tag creation data.
     * @returns The created tag record.
     */
    async createTag(data: {
        name: string;
        userId: number;
        active?: boolean;
    }): Promise<{ success: true; data: SelectTag } | { success: false; error: Resource }> {
        const userService = new UserService();
        const user = await userService.getUserById(data.userId);

        if (!user.success || !user.data) {
            return { success: false, error: Resource.USER_NOT_FOUND };
        }

        const existing = await this.tagRepository.findMany({
            userId: { operator: Operator.EQUAL, value: data.userId },
            name: { operator: Operator.EQUAL, value: data.name }
        });

        if (existing.length > 0) {
            return { success: false, error: Resource.DATA_ALREADY_EXISTS };
        }

        try {
            const created = await this.tagRepository.create({
                name: data.name,
                active: data.active,
                userId: data.userId,
            } as InsertTag);
            return { success: true, data: created };
        } catch (error) {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        }
    }

    /**
     * Retrieves all tags in the database.
     *
     * @summary Gets all tags with optional pagination and sorting.
     * @param options - Query options for pagination and sorting.
     * @returns A list of all tags.
     */
    async getTags(options?: QueryOptions<SelectTag>): Promise<{ success: true; data: SelectTag[] } | { success: false; error: Resource }> {
        try {
            const tags = await this.tagRepository.findMany(undefined, {
                limit: options?.limit,
                offset: options?.offset,
                sort: options?.sort as keyof SelectTag,
                order: options?.order === Operator.DESC ? 'desc' : 'asc',
            });
            return { success: true, data: tags };
        } catch (error) {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        }
    }

    /**
     * Counts all tags.
     *
     * @summary Gets total count of tags.
     * @returns Total tag count.
     */
    async countTags(): Promise<{ success: true; data: number } | { success: false; error: Resource }> {
        try {
            const count = await this.tagRepository.count();
            return { success: true, data: count };
        } catch (error) {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        }
    }

    /**
     * Retrieves a tag by its ID.
     *
     * @summary Gets a tag by ID.
     * @param id - ID of the tag.
     * @returns Tag record if found.
     */
    async getTagById(id: number): Promise<{ success: true; data: SelectTag } | { success: false; error: Resource }> {
        const tag = await this.tagRepository.findById(id);
        if (!tag) {
            return { success: false, error: Resource.TAG_NOT_FOUND };
        }
        return { success: true, data: tag };
    }

    /**
     * Retrieves all tags associated with a given user ID.
     *
     * @summary Gets all tags for a user.
     * @param userId - ID of the user.
     * @returns A list of tags owned by the user.
     */
    async getTagsByUser(userId: number, options?: QueryOptions<SelectTag>): Promise<{ success: true; data: SelectTag[] } | { success: false; error: Resource }> {
        try {
            const tags = await this.tagRepository.findMany({
                userId: { operator: Operator.EQUAL, value: userId }
            }, {
                limit: options?.limit,
                offset: options?.offset,
                sort: options?.sort as keyof SelectTag,
                order: options?.order === Operator.DESC ? 'desc' : 'asc',
            });
            return { success: true, data: tags };
        } catch (error) {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        }
    }

    /**
     * Counts tags associated with a user.
     *
     * @summary Gets count of tags for a user.
     * @param userId - User ID.
     * @returns Count of user's tags.
     */
    async countTagsByUser(userId: number): Promise<{ success: true; data: number } | { success: false; error: Resource }> {
        try {
            const count = await this.tagRepository.count({
                userId: { operator: Operator.EQUAL, value: userId }
            });
            return { success: true, data: count };
        } catch (error) {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        }
    }

    /**
     * Updates a tag by ID.
     * Validates the user if the userId is being changed and enforces uniqueness.
     *
     * @summary Updates tag data.
     * @param id - ID of the tag.
     * @param data - Partial tag data to update.
     * @returns Updated tag record.
     */
    async updateTag(id: number, data: Partial<InsertTag>): Promise<{ success: true; data: SelectTag } | { success: false; error: Resource }> {
        if (data.userId !== undefined) {
            const userService = new UserService();
            const user = await userService.getUserById(data.userId);

            if (!user.success || !user.data) {
                return { success: false, error: Resource.USER_NOT_FOUND };
            }
        }

        if (data.userId !== undefined || data.name !== undefined) {
            const current = await this.tagRepository.findById(id);
            if (!current) {
                return { success: false, error: Resource.TAG_NOT_FOUND };
            }

            const effectiveUserId = data.userId ?? current.userId;
            const effectiveName = data.name ?? current.name;

            if (effectiveName) {
                const existing = await this.tagRepository.findMany({
                    userId: { operator: Operator.EQUAL, value: effectiveUserId },
                    name: { operator: Operator.EQUAL, value: effectiveName }
                });
                if (existing.length > 0 && existing[0].id !== id) {
                    return { success: false, error: Resource.DATA_ALREADY_EXISTS };
                }
            }
        }

        try {
            const updated = await this.tagRepository.update(id, data);
            return { success: true, data: updated };
        } catch (error) {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        }
    }

    /**
     * Deletes a tag by ID after validating its existence.
     *
     * @summary Removes a tag from the database.
     * @param id - ID of the tag to delete.
     * @returns Success with deleted ID, or error if tag does not exist.
     */
    async deleteTag(id: number): Promise<{ success: true; data: { id: number } } | { success: false; error: Resource }> {
        const existing = await this.tagRepository.findById(id);
        if (!existing) {
            return { success: false, error: Resource.TAG_NOT_FOUND };
        }

        try {
            await this.tagRepository.delete(id);
            return { success: true, data: { id } };
        } catch (error) {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        }
    }
}
