import type { UserId } from '../user/user.types';
import type { PaginationInput, PaginatedResult } from '../../types/pagination.types';

export type TagId = number;
export type TagName = string;

export interface TagEntity {
    id: TagId;
    userId: UserId;
    name: TagName | null;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateTagInput {
    name: TagName;
    userId: UserId;
    active?: boolean;
}

export interface UpdateTagInput {
    name?: TagName;
    userId?: UserId;
    active?: boolean;
}

export interface GetTagsInput extends PaginationInput {}

export interface GetTagByIdInput {
    id: TagId;
}

export interface GetTagsByUserInput extends PaginationInput {
    userId: UserId;
}

export interface UpdateTagRequest {
    id: TagId;
    data: UpdateTagInput;
}

export interface DeleteTagInput {
    id: TagId;
}

export type CreateTagOutput = TagEntity;
export type GetTagsOutput = PaginatedResult<TagEntity>;
export type GetTagByIdOutput = TagEntity;
export type GetTagsByUserOutput = PaginatedResult<TagEntity>;
export type UpdateTagOutput = TagEntity;
export interface DeleteTagOutput {
    id: TagId;
}
