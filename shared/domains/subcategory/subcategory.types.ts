import type { CategoryId } from '../category/category.types';
import type { UserId } from '../user/user.types';
import type { ISODateString } from '../../types/format.types';
import type { PaginationInput, PaginatedResult } from '../../types/pagination.types';

/** @summary Unique identifier for a subcategory. */
export type SubcategoryId = number;

/** @summary Subcategory display name. */
export type SubcategoryName = string;

/** @summary Subcategory record persisted by the system. */
export interface SubcategoryEntity {
    id: SubcategoryId;
    name: SubcategoryName | null;
    active: boolean;
    categoryId: CategoryId;
    createdAt: ISODateString;
    updatedAt: ISODateString;
}

/** @summary Input payload for subcategory creation. */
export interface CreateSubcategoryInput {
    name: SubcategoryName;
    categoryId: CategoryId;
    active?: boolean;
}

/** @summary Input payload for subcategory updates. */
export interface UpdateSubcategoryInput {
    name?: SubcategoryName;
    categoryId?: CategoryId;
    active?: boolean;
}

/** @summary Input payload for listing subcategories. */
export interface GetSubcategoriesInput extends PaginationInput {}

/** @summary Input payload for fetching a subcategory by id. */
export interface GetSubcategoryByIdInput {
    id: SubcategoryId;
}

/** @summary Input payload for listing subcategories by category. */
export interface GetSubcategoriesByCategoryInput extends PaginationInput {
    categoryId: CategoryId;
}

/** @summary Input payload for listing subcategories by user. */
export interface GetSubcategoriesByUserInput extends PaginationInput {
    userId: UserId;
}

/** @summary Update request payload with target id and data. */
export interface UpdateSubcategoryRequest {
    id: SubcategoryId;
    data: UpdateSubcategoryInput;
}

/** @summary Input payload for deleting a subcategory. */
export interface DeleteSubcategoryInput {
    id: SubcategoryId;
}

/** @summary Output payload for subcategory creation. */
export type CreateSubcategoryOutput = SubcategoryEntity;

/** @summary Output payload for listing subcategories. */
export type GetSubcategoriesOutput = PaginatedResult<SubcategoryEntity>;

/** @summary Output payload for fetching a subcategory by id. */
export type GetSubcategoryByIdOutput = SubcategoryEntity;

/** @summary Output payload for listing subcategories by category. */
export type GetSubcategoriesByCategoryOutput = PaginatedResult<SubcategoryEntity>;

/** @summary Output payload for listing subcategories by user. */
export type GetSubcategoriesByUserOutput = PaginatedResult<SubcategoryEntity>;

/** @summary Output payload for subcategory updates. */
export type UpdateSubcategoryOutput = SubcategoryEntity;

/** @summary Output payload for subcategory deletion. */
export interface DeleteSubcategoryOutput {
    id: SubcategoryId;
}