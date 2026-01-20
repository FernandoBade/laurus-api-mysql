import type { CategoryColor, CategoryType } from './category.enums';
import type { UserId } from '../user/user.types';
import type { PaginationInput, PaginatedResult } from '../../types/pagination.types';

export type CategoryId = number;
export type CategoryName = string;

export interface CategoryEntity {
    id: CategoryId;
    name: CategoryName | null;
    type: CategoryType;
    color: CategoryColor;
    active: boolean;
    userId: UserId;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateCategoryInput {
    name: CategoryName;
    type: CategoryType;
    color?: CategoryColor;
    active?: boolean;
    userId: UserId;
}

export interface UpdateCategoryInput {
    name?: CategoryName;
    type?: CategoryType;
    color?: CategoryColor;
    active?: boolean;
    userId?: UserId;
}

export interface GetCategoriesInput extends PaginationInput {}

export interface GetCategoryByIdInput {
    id: CategoryId;
}

export interface GetCategoriesByUserInput extends PaginationInput {
    userId: UserId;
}

export interface UpdateCategoryRequest {
    id: CategoryId;
    data: UpdateCategoryInput;
}

export interface DeleteCategoryInput {
    id: CategoryId;
}

export type CreateCategoryOutput = CategoryEntity;
export type GetCategoriesOutput = PaginatedResult<CategoryEntity>;
export type GetCategoryByIdOutput = CategoryEntity;
export type GetCategoriesByUserOutput = PaginatedResult<CategoryEntity>;
export type UpdateCategoryOutput = CategoryEntity;
export interface DeleteCategoryOutput {
    id: CategoryId;
}
