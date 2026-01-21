import TagController from '../../controller/tagController';
import type { TagEntity } from '../../../../shared/domains/tag/tag.types';
import { SeedContext, executeController } from '../seed.utils';

type TagRequestBody = {
    name: string;
    userId: number;
    active?: boolean;
};

/**
 * Creates tags for a user using the TagController.
 *
 * @summary Generates and persists tags for a user.
 */
export async function createTags(context: SeedContext, userId: number): Promise<TagEntity[]> {
    const count = context.random.int(context.config.tagsPerUser.min, context.config.tagsPerUser.max);
    if (count === 0) {
        return [];
    }

    const names = context.random.pickMany(context.config.tagNames, count);
    const tags: TagEntity[] = [];

    for (const name of names) {
        const body: TagRequestBody = {
            name,
            userId,
            active: true,
        };

        const created = await executeController<TagEntity>(TagController.createTag, {
            body,
            language: context.language,
            userId,
        });
        tags.push(created);
    }

    return tags;
}
