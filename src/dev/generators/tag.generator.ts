import TagController from '../../controller/tagController';
import { SelectTag } from '../../db/schema';
import { SeedContext, executeController } from '../seed.utils';

type TagRequestBody = {
    name: string;
    user_id: number;
    active?: boolean;
};

/**
 * Creates tags for a user using the TagController.
 *
 * @summary Generates and persists tags for a user.
 */
export async function createTags(context: SeedContext, userId: number): Promise<SelectTag[]> {
    const count = context.random.int(context.config.tagsPerUser.min, context.config.tagsPerUser.max);
    if (count === 0) {
        return [];
    }

    const names = context.random.pickMany(context.config.tagNames, count);
    const tags: SelectTag[] = [];

    for (const name of names) {
        const body: TagRequestBody = {
            name,
            user_id: userId,
            active: true,
        };

        const created = await executeController<SelectTag>(TagController.createTag, {
            body,
            language: context.language,
            userId,
        });
        tags.push(created);
    }

    return tags;
}
