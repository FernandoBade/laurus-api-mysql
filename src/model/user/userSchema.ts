import { z } from 'zod';
import { Language, Theme, Currency, DateFormat } from '../../utils/enum';
import { ResourceBase } from '../../utils/resources/languages/resourceService';
import { Resource } from '../../utils/resources/resource';
import { LanguageCode } from '../../utils/resources/resourceTypes';

const t = (key: Resource, lang?: LanguageCode): string => ResourceBase.translate(key, lang);

/**
 * Schema to validate date formats.
 */
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

/**
 * Schema to validate user creation input with translated messages and enum refinements.
 */
export const createUserSchema = (lang?: LanguageCode) =>
    z
        .object({
            firstName: z.string().min(2, { message: t(Resource.FIRST_NAME_TOO_SHORT, lang) }),
            lastName: z.string().min(2, { message: t(Resource.LAST_NAME_TOO_SHORT, lang) }),
            email: z.string().toLowerCase().trim().email({ message: t(Resource.EMAIL_INVALID, lang) }),
            password: z.string().min(6, { message: t(Resource.PASSWORD_TOO_SHORT, lang) }),
            phone: z.string().optional(),
            birthDate: dateSchema(lang).optional(),
            createdAt: dateSchema(lang).optional(),
            active: z.boolean().optional(),
            theme: z.enum([Theme.DARK, Theme.LIGHT], {
                errorMap: () => ({ message: t(Resource.INVALID_THEME_VALUE, lang) }),
            }).optional(),
            language: z.enum([Language.PT_BR, Language.EN_US, Language.ES_ES], {
                errorMap: () => ({ message: t(Resource.INVALID_LANGUAGE_VALUE, lang) }),
            }).optional(),
            currency: z.enum([Currency.BRL, Currency.USD, Currency.EUR, Currency.ARS], {
                errorMap: () => ({ message: t(Resource.INVALID_CURRENCY_VALUE, lang) }),
            }).optional(),
            dateFormat: z.enum([DateFormat.DD_MM_YYYY, DateFormat.MM_DD_YYYY], {
                errorMap: () => ({ message: t(Resource.INVALID_DATE_FORMAT_VALUE, lang) }),
            }).optional(),
        })
        .strict();


/**
 * Schema to validate user update input with translated messages and enum refinements.
 */
export const updateUserSchema = (lang?: LanguageCode) =>
    createUserSchema(lang).partial().strict();

