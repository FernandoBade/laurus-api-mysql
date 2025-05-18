import { z } from 'zod';
import { CategoryColor, CategoryType } from '../../utils/enum';
import { Resource } from '../../utils/resources/resource';
import { LanguageCode } from '../../utils/resources/resourceTypes';
import { ResourceBase } from '../../utils/resources/languages/resourceService';

const t = (key: Resource, lang?: LanguageCode): string => ResourceBase.translate(key, lang);

/**
 * Schema to validate date formats.
 */
const dateSchema = (lang?: LanguageCode) =>
    z.union([
        z.string().refine((value) => !isNaN(new Date(value).getTime()), {
            message: t(Resource.INVALID_DATE_FORMAT, lang),
        }),
        z.date().refine((value) => !isNaN(value.getTime()), {
            message: t(Resource.INVALID_DATE_FORMAT, lang),
        }),
    ]).transform((value) => {
        if (typeof value === 'string') {
            const convertedDate = new Date(value);
            if (isNaN(convertedDate.getTime())) {
                throw new z.ZodError([{
                    code: 'custom',
                    path: ['date'],
                    message: t(Resource.INVALID_DATE_FORMAT, lang),
                }]);
            }
            return convertedDate;
        }
        return value;
    });

/**
 * Shared base schema for category creation and update.
 */
const baseCategorySchema = (lang?: LanguageCode) =>
    z.object({
        name: z.string().min(1, { message: t(Resource.TOO_SMALL, lang) }),
        type: z.enum([CategoryType.INCOME, CategoryType.EXPENSE], {
            errorMap: () => ({ message: t(Resource.INVALID_ENUM, lang) }),
        }),
        color: z.enum(Object.values(CategoryColor) as [string, ...string[]], {
            errorMap: () => ({ message: t(Resource.INVALID_ENUM, lang) }),
        }).optional(),
        active: z.boolean({ invalid_type_error: t(Resource.INVALID_TYPE, lang) }).optional(),
        user_id: z.number().int().positive(),
        createdAt: dateSchema(lang).optional(),
        updatedAt: dateSchema(lang).optional(),
    }).strict();

/**
 * Schema to validate category creation.
 */
export const createCategorySchema = (lang?: LanguageCode) => baseCategorySchema(lang);

/**
 * Schema to validate category update.
 */
export const updateCategorySchema = (lang?: LanguageCode) => baseCategorySchema(lang).partial();
