import CategoryController from '../../controller/categoryController';
import SubcategoryController from '../../controller/subcategoryController';
import { SelectCategory, SelectSubcategory } from '../../db/schema';
import { CategoryColor, CategoryType } from '../../../../shared/enums';
import { CategoryTemplate } from '../seed.config';
import { SeedContext, executeController } from '../seed.utils';

type CategoryRequestBody = {
    name: string;
    type: CategoryType;
    color?: CategoryColor;
    active?: boolean;
    user_id: number;
};

type SubcategoryRequestBody = {
    name: string;
    category_id: number;
    user_id: number;
    active?: boolean;
};

export type CategorySeed = {
    template: CategoryTemplate;
    category: SelectCategory;
    subcategories: SelectSubcategory[];
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
            user_id: userId,
        };

        const category = await executeController<SelectCategory>(CategoryController.createCategory, {
            body: categoryBody,
            language: context.language,
            userId,
        });

        const subcategories: SelectSubcategory[] = [];
        for (const name of template.subcategories) {
            const subcategoryBody: SubcategoryRequestBody = {
                name,
                category_id: category.id,
                user_id: userId,
                active: true,
            };

            const created = await executeController<SelectSubcategory>(SubcategoryController.createSubcategory, {
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
