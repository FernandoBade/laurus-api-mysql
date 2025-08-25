import { z } from 'zod';
import { CreditCardFlag } from '../../utils/enum';
import { Resource } from '../../utils/resources/resource';
import { LanguageCode } from '../../utils/resources/resourceTypes';
import { ResourceBase } from '../../utils/resources/languages/resourceService';

const t = (key: Resource, lang?: LanguageCode): string => ResourceBase.translate(key, lang);

const dateSchema = (lang?: LanguageCode) =>
    z.union([
        z.string().refine((value) => {
            const convertedDate = new Date(value);
            return !isNaN(convertedDate.getTime());
        }, { message: t(Resource.INVALID_DATE_FORMAT, lang) }),

        z.date().refine((value) => !isNaN(value.getTime()), {
            message: t(Resource.INVALID_DATE_FORMAT, lang),
        }),
    ]).transform((value) => {
        if (typeof value === 'string' || typeof value === 'number') {
            const convertedDate = new Date(value);
            if (isNaN(convertedDate.getTime())) {
                throw new z.ZodError([
                    {
                        code: 'custom',
                        path: ['date'],
                        message: t(Resource.INVALID_DATE_FORMAT, lang),
                    },
                ]);
            }
            return convertedDate;
        }
        return value;
    });
    
const flagSchema = (lang?: LanguageCode) =>
    z.preprocess(
        (val) => (typeof val === 'string' ? val.toUpperCase().trim() : val),
        z.nativeEnum(CreditCardFlag, {
            errorMap: () => ({ message: t(Resource.INVALID_ENUM, lang) }),
        }),
    );

const baseCreditCardSchema = (lang?: LanguageCode) =>
    z.object({
        name: z.string().min(1, { message: t(Resource.TOO_SMALL, lang) }),

        // <- Campo correto para cartão: flag
        flag: flagSchema(lang),

        observation: z.string().optional(),

        user_id: z.number({
            required_error: t(Resource.VALIDATION_ERROR, lang),
            invalid_type_error: t(Resource.INVALID_TYPE, lang),
        }).int().positive({ message: t(Resource.TOO_SMALL, lang) }),

        account_id: z.number({ invalid_type_error: t(Resource.INVALID_TYPE, lang) })
            .int().positive({ message: t(Resource.TOO_SMALL, lang) }).optional(),

        active: z.boolean({ invalid_type_error: t(Resource.INVALID_TYPE, lang) }).optional(),

        createdAt: dateSchema(lang).optional(),
        updatedAt: dateSchema(lang).optional(),
    }).strict();

export const createCreditCardSchema = (lang?: LanguageCode) => baseCreditCardSchema(lang);

export const updateCreditCardSchema = (lang?: LanguageCode) => baseCreditCardSchema(lang).partial();

