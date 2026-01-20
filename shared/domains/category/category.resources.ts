import type {
    CreateCategoryInput,
    CreateCategoryOutput,
    DeleteCategoryInput,
    DeleteCategoryOutput,
    GetCategoriesByUserInput,
    GetCategoriesByUserOutput,
    GetCategoriesInput,
    GetCategoriesOutput,
    GetCategoryByIdInput,
    GetCategoryByIdOutput,
    UpdateCategoryRequest,
    UpdateCategoryOutput,
} from './category.types';
import { CategoryErrorCode } from './category.enums';

export const createCategoryResource = {
    input: {} as CreateCategoryInput,
    output: {} as CreateCategoryOutput,
    errors: {} as CategoryErrorCode,
};

export const getCategoriesResource = {
    input: {} as GetCategoriesInput,
    output: {} as GetCategoriesOutput,
    errors: {} as CategoryErrorCode,
};

export const getCategoryByIdResource = {
    input: {} as GetCategoryByIdInput,
    output: {} as GetCategoryByIdOutput,
    errors: {} as CategoryErrorCode,
};

export const getCategoriesByUserResource = {
    input: {} as GetCategoriesByUserInput,
    output: {} as GetCategoriesByUserOutput,
    errors: {} as CategoryErrorCode,
};

export const updateCategoryResource = {
    input: {} as UpdateCategoryRequest,
    output: {} as UpdateCategoryOutput,
    errors: {} as CategoryErrorCode,
};

export const deleteCategoryResource = {
    input: {} as DeleteCategoryInput,
    output: {} as DeleteCategoryOutput,
    errors: {} as CategoryErrorCode,
};
