import type { CategoryId } from '../category/category.types';
import type { UserId } from '../user/user.types';
import type { PaginationInput, PaginatedResult } from '../../types/pagination.types';

export type SubcategoryId = number;
export type SubcategoryName = string;

export interface SubcategoryEntity {
    id: SubcategoryId;
    name: SubcategoryName | null;
    active: boolean;
    categoryId: CategoryId;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateSubcategoryInput {
    name: SubcategoryName;
    categoryId: CategoryId;
    active?: boolean;
}

export interface UpdateSubcategoryInput {
    name?: SubcategoryName;
    categoryId?: CategoryId;
    active?: boolean;
}

export interface GetSubcategoriesInput extends PaginationInput {}

export interface GetSubcategoryByIdInput {
    id: SubcategoryId;
}

export interface GetSubcategoriesByCategoryInput extends PaginationInput {
    categoryId: CategoryId;
}

export interface GetSubcategoriesByUserInput extends PaginationInput {
    userId: UserId;
}

export interface UpdateSubcategoryRequest {
    id: SubcategoryId;
    data: UpdateSubcategoryInput;
}

export interface DeleteSubcategoryInput {
    id: SubcategoryId;
}

export type CreateSubcategoryOutput = SubcategoryEntity;
export type GetSubcategoriesOutput = PaginatedResult<SubcategoryEntity>;
export type GetSubcategoryByIdOutput = SubcategoryEntity;
export type GetSubcategoriesByCategoryOutput = PaginatedResult<SubcategoryEntity>;
export type GetSubcategoriesByUserOutput = PaginatedResult<SubcategoryEntity>;
export type UpdateSubcategoryOutput = SubcategoryEntity;
export interface DeleteSubcategoryOutput {
    id: SubcategoryId;
}
