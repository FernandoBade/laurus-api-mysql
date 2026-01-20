import type {
    CreateSubcategoryInput,
    CreateSubcategoryOutput,
    DeleteSubcategoryInput,
    DeleteSubcategoryOutput,
    GetSubcategoryByIdInput,
    GetSubcategoryByIdOutput,
    GetSubcategoriesByCategoryInput,
    GetSubcategoriesByCategoryOutput,
    GetSubcategoriesByUserInput,
    GetSubcategoriesByUserOutput,
    GetSubcategoriesInput,
    GetSubcategoriesOutput,
    UpdateSubcategoryRequest,
    UpdateSubcategoryOutput,
} from './subcategory.types';
import { SubcategoryErrorCode } from './subcategory.enums';

export const createSubcategoryResource = {
    input: {} as CreateSubcategoryInput,
    output: {} as CreateSubcategoryOutput,
    errors: {} as SubcategoryErrorCode,
};

export const getSubcategoriesResource = {
    input: {} as GetSubcategoriesInput,
    output: {} as GetSubcategoriesOutput,
    errors: {} as SubcategoryErrorCode,
};

export const getSubcategoryByIdResource = {
    input: {} as GetSubcategoryByIdInput,
    output: {} as GetSubcategoryByIdOutput,
    errors: {} as SubcategoryErrorCode,
};

export const getSubcategoriesByCategoryResource = {
    input: {} as GetSubcategoriesByCategoryInput,
    output: {} as GetSubcategoriesByCategoryOutput,
    errors: {} as SubcategoryErrorCode,
};

export const getSubcategoriesByUserResource = {
    input: {} as GetSubcategoriesByUserInput,
    output: {} as GetSubcategoriesByUserOutput,
    errors: {} as SubcategoryErrorCode,
};

export const updateSubcategoryResource = {
    input: {} as UpdateSubcategoryRequest,
    output: {} as UpdateSubcategoryOutput,
    errors: {} as SubcategoryErrorCode,
};

export const deleteSubcategoryResource = {
    input: {} as DeleteSubcategoryInput,
    output: {} as DeleteSubcategoryOutput,
    errors: {} as SubcategoryErrorCode,
};
