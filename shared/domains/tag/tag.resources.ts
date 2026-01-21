import type {
    CreateTagInput,
    CreateTagOutput,
    DeleteTagInput,
    DeleteTagOutput,
    GetTagByIdInput,
    GetTagByIdOutput,
    GetTagsByUserInput,
    GetTagsByUserOutput,
    GetTagsInput,
    GetTagsOutput,
    UpdateTagRequest,
    UpdateTagOutput,
} from './tag.types';
import { TagErrorCode } from './tag.enums';

/** @summary Resource definition for creating a tag. */
export const createTagResource = {
    input: {} as CreateTagInput,
    output: {} as CreateTagOutput,
    errors: {} as TagErrorCode,
};

/** @summary Resource definition for listing tags. */
export const getTagsResource = {
    input: {} as GetTagsInput,
    output: {} as GetTagsOutput,
    errors: {} as TagErrorCode,
};

/** @summary Resource definition for fetching a tag by id. */
export const getTagByIdResource = {
    input: {} as GetTagByIdInput,
    output: {} as GetTagByIdOutput,
    errors: {} as TagErrorCode,
};

/** @summary Resource definition for listing tags by user. */
export const getTagsByUserResource = {
    input: {} as GetTagsByUserInput,
    output: {} as GetTagsByUserOutput,
    errors: {} as TagErrorCode,
};

/** @summary Resource definition for updating a tag. */
export const updateTagResource = {
    input: {} as UpdateTagRequest,
    output: {} as UpdateTagOutput,
    errors: {} as TagErrorCode,
};

/** @summary Resource definition for deleting a tag. */
export const deleteTagResource = {
    input: {} as DeleteTagInput,
    output: {} as DeleteTagOutput,
    errors: {} as TagErrorCode,
};