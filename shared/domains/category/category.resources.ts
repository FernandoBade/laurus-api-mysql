import type {
    CreateCategoryInput,
    CreateCategoryOutput,
    DeleteCategoryInput,
    DeleteCategoryOutput,
    GetCategoryByIdInput,
    GetCategoryByIdOutput,
    GetCategoriesByUserInput,
    GetCategoriesByUserOutput,
    GetCategoriesInput,
    GetCategoriesOutput,
    UpdateCategoryRequest,
    UpdateCategoryOutput,
} from './category.types';
import { CategoryErrorCode } from './category.enums';

/** @summary Resource definition for creating a category. */
export const createCategoryResource = {
    input: {} as CreateCategoryInput,
    output: {} as CreateCategoryOutput,
    errors: {} as CategoryErrorCode,
};

/** @summary Resource definition for listing categories. */
export const getCategoriesResource = {
    input: {} as GetCategoriesInput,
    output: {} as GetCategoriesOutput,
    errors: {} as CategoryErrorCode,
};

/** @summary Resource definition for fetching a category by id. */
export const getCategoryByIdResource = {
    input: {} as GetCategoryByIdInput,
    output: {} as GetCategoryByIdOutput,
    errors: {} as CategoryErrorCode,
};

/** @summary Resource definition for listing categories by user. */
export const getCategoriesByUserResource = {
    input: {} as GetCategoriesByUserInput,
    output: {} as GetCategoriesByUserOutput,
    errors: {} as CategoryErrorCode,
};

/** @summary Resource definition for updating a category. */
export const updateCategoryResource = {
    input: {} as UpdateCategoryRequest,
    output: {} as UpdateCategoryOutput,
    errors: {} as CategoryErrorCode,
};

/** @summary Resource definition for deleting a category. */
export const deleteCategoryResource = {
    input: {} as DeleteCategoryInput,
    output: {} as DeleteCategoryOutput,
    errors: {} as CategoryErrorCode,
};