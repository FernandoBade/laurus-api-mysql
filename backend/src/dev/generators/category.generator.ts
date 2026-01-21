import CategoryController from '../../controller/categoryController';
import SubcategoryController from '../../controller/subcategoryController';
import type { CategoryEntity } from '../../../../shared/domains/category/category.types';
import type { SubcategoryEntity } from '../../../../shared/domains/subcategory/subcategory.types';
import { CategoryColor, CategoryType } from '../../../../shared/enums';
import { CategoryTemplate } from '../seed.config';
import { SeedContext, executeController } from '../seed.utils';

type CategoryRequestBody = {
    name: string;
    type: CategoryType;
    color?: CategoryColor;
    active?: boolean;
    userId: number;
};

type SubcategoryRequestBody = {
    name: string;
    categoryId: number;
    userId: number;
    active?: boolean;
};

export type CategorySeed = {
    template: CategoryTemplate;
    category: CategoryEntity;
    subcategories: SubcategoryEntity[];
};

/**
 * Creates categories and subcategories for a user using controller flows.
 *
 * @summary Generates category structures linked to a user.
 */
export async function createCategories(context: SeedContext, userId: number): Promise<CategorySeed[]> {
    const seeds: CategorySeed[] = [];

    for (const template of context.config.categories) {
        const categoryBody: CategoryRequestBody = {
            name: template.name,
            type: template.type,
            color: template.color,
            active: true,
            userId,
        };

        const category = await executeController<CategoryEntity>(CategoryController.createCategory, {
            body: categoryBody,
            language: context.language,
            userId,
        });

        const subcategories: SubcategoryEntity[] = [];
        for (const name of template.subcategories) {
            const subcategoryBody: SubcategoryRequestBody = {
                name,
                categoryId: category.id,
                userId,
                active: true,
            };

            const created = await executeController<SubcategoryEntity>(SubcategoryController.createSubcategory, {
                body: subcategoryBody,
                language: context.language,
                userId,
            });
            subcategories.push(created);
        }

        seeds.push({ template, category, subcategories });
    }

    return seeds;
}
