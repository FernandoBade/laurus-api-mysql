import type {
    CreateSubcategoryInput,
    CreateSubcategoryOutput,
    DeleteSubcategoryInput,
    DeleteSubcategoryOutput,
    GetSubcategoriesByCategoryInput,
    GetSubcategoriesByCategoryOutput,
    GetSubcategoriesByUserInput,
    GetSubcategoriesByUserOutput,
    GetSubcategoriesInput,
    GetSubcategoriesOutput,
    GetSubcategoryByIdInput,
    GetSubcategoryByIdOutput,
    UpdateSubcategoryRequest,
    UpdateSubcategoryOutput,
} from './subcategory.types';
import { SubcategoryErrorCode } from './subcategory.enums';

/** @summary Resource definition for creating a subcategory. */
export const createSubcategoryResource = {
    input: {} as CreateSubcategoryInput,
    output: {} as CreateSubcategoryOutput,
    errors: {} as SubcategoryErrorCode,
};

/** @summary Resource definition for listing subcategories. */
export const getSubcategoriesResource = {
    input: {} as GetSubcategoriesInput,
    output: {} as GetSubcategoriesOutput,
    errors: {} as SubcategoryErrorCode,
};

/** @summary Resource definition for fetching a subcategory by id. */
export const getSubcategoryByIdResource = {
    input: {} as GetSubcategoryByIdInput,
    output: {} as GetSubcategoryByIdOutput,
    errors: {} as SubcategoryErrorCode,
};

/** @summary Resource definition for listing subcategories by category. */
export const getSubcategoriesByCategoryResource = {
    input: {} as GetSubcategoriesByCategoryInput,
    output: {} as GetSubcategoriesByCategoryOutput,
    errors: {} as SubcategoryErrorCode,
};

/** @summary Resource definition for listing subcategories by user. */
export const getSubcategoriesByUserResource = {
    input: {} as GetSubcategoriesByUserInput,
    output: {} as GetSubcategoriesByUserOutput,
    errors: {} as SubcategoryErrorCode,
};

/** @summary Resource definition for updating a subcategory. */
export const updateSubcategoryResource = {
    input: {} as UpdateSubcategoryRequest,
    output: {} as UpdateSubcategoryOutput,
    errors: {} as SubcategoryErrorCode,
};

/** @summary Resource definition for deleting a subcategory. */
export const deleteSubcategoryResource = {
    input: {} as DeleteSubcategoryInput,
    output: {} as DeleteSubcategoryOutput,
    errors: {} as SubcategoryErrorCode,
};