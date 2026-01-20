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

export const createTagResource = {
    input: {} as CreateTagInput,
    output: {} as CreateTagOutput,
    errors: {} as TagErrorCode,
};

export const getTagsResource = {
    input: {} as GetTagsInput,
    output: {} as GetTagsOutput,
    errors: {} as TagErrorCode,
};

export const getTagByIdResource = {
    input: {} as GetTagByIdInput,
    output: {} as GetTagByIdOutput,
    errors: {} as TagErrorCode,
};

export const getTagsByUserResource = {
    input: {} as GetTagsByUserInput,
    output: {} as GetTagsByUserOutput,
    errors: {} as TagErrorCode,
};

export const updateTagResource = {
    input: {} as UpdateTagRequest,
    output: {} as UpdateTagOutput,
    errors: {} as TagErrorCode,
};

export const deleteTagResource = {
    input: {} as DeleteTagInput,
    output: {} as DeleteTagOutput,
    errors: {} as TagErrorCode,
};
