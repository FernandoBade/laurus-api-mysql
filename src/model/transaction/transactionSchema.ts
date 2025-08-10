import { z } from 'zod';
import { TransactionSource, TransactionType } from '../../utils/enum';
import { Resource } from '../../utils/resources/resource';
import { LanguageCode } from '../../utils/resources/resourceTypes';
import { ResourceBase } from '../../utils/resources/languages/resourceService';

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

        z.number().refine((value) => value > 0, {
            message: t(Resource.INVALID_DATE_FORMAT, lang),
        }).transform((value) => new Date(value)),

        z.date().refine((value) => !isNaN(value.getTime()), {
            message: t(Resource.INVALID_DATE_FORMAT, lang),
        }),
    ]).transform((value) => {
        if (typeof value === 'string' || typeof value === 'number') {
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
 * Shared base schema for transaction creation and update
 */
const baseTransactionSchema = (lang?: LanguageCode) =>
    z.object({
        value: z.number().positive({ message: t(Resource.TOO_SMALL, lang) }),
        date: dateSchema(lang),
        category_id: z.number().int().positive().optional().nullable(),
        subcategory_id: z.number().int().positive().optional().nullable(),
        observation: z.string().optional(),
        transactionType: z.enum([TransactionType.INCOME, TransactionType.EXPENSE]),
        transactionSource: z.enum([TransactionSource.ACCOUNT, TransactionSource.CREDIT_CARD]),
        isInstallment: z.boolean({ invalid_type_error: t(Resource.INVALID_TYPE, lang) }),
        totalMonths: z.number().int().positive({ message: t(Resource.TOO_SMALL, lang) }).optional(),
        isRecurring: z.boolean({ invalid_type_error: t(Resource.INVALID_TYPE, lang) }),
        paymentDay: z.number()
            .int({ message: t(Resource.INVALID_TYPE, lang) })
            .min(1, { message: t(Resource.PAYMENT_DAY_OUT_OF_RANGE, lang) })
            .max(31, { message: t(Resource.PAYMENT_DAY_OUT_OF_RANGE, lang) })
            .optional(),
        account_id: z.number().int().positive({ message: t(Resource.TOO_SMALL, lang) }),
        active: z.boolean().optional(),
    }).strict();

/**
 * Common validation logic for installment and recurring rules
 */
const withTransactionRefinements = (schema: z.ZodTypeAny, lang?: LanguageCode, isUpdate = false) =>
    schema.superRefine((data, ctx) => {
        if (isUpdate) {
            const hasCat = Object.prototype.hasOwnProperty.call(data, 'category_id');
            const hasSub = Object.prototype.hasOwnProperty.call(data, 'subcategory_id');
            if (hasCat || hasSub) {
                if (!data.category_id && !data.subcategory_id) {
                    ctx.addIssue({
                        path: ['category_id'],
                        code: z.ZodIssueCode.custom,
                        message: t(Resource.CATEGORY_OR_SUBCATEGORY_REQUIRED, lang),
                    });
                    ctx.addIssue({
                        path: ['subcategory_id'],
                        code: z.ZodIssueCode.custom,
                        message: t(Resource.CATEGORY_OR_SUBCATEGORY_REQUIRED, lang),
                    });
                }
            }
        } else {
            if (!data.category_id && !data.subcategory_id) {
                ctx.addIssue({
                    path: ['category_id'],
                    code: z.ZodIssueCode.custom,
                    message: t(Resource.CATEGORY_OR_SUBCATEGORY_REQUIRED, lang),
                });
                ctx.addIssue({
                    path: ['subcategory_id'],
                    code: z.ZodIssueCode.custom,
                    message: t(Resource.CATEGORY_OR_SUBCATEGORY_REQUIRED, lang),
                });
            }
        }

        if (data.isInstallment) {
            if (!data.totalMonths) {
                ctx.addIssue({
                    path: ['totalMonths'],
                    code: z.ZodIssueCode.custom,
                    message: t(Resource.TOTAL_MONTHS_REQUIRED, lang),
                });
            }
        } else if (data.totalMonths !== undefined) {
            ctx.addIssue({
                path: ['totalMonths'],
                code: z.ZodIssueCode.custom,
                message: t(Resource.TOTAL_MONTHS_NOT_ALLOWED, lang),
            });
        }

        if (data.isRecurring) {
            if (!data.paymentDay) {
                ctx.addIssue({
                    path: ['paymentDay'],
                    code: z.ZodIssueCode.custom,
                    message: t(Resource.PAYMENT_DAY_REQUIRED, lang),
                });
            }
        } else if (data.paymentDay !== undefined) {
            ctx.addIssue({
                path: ['paymentDay'],
                code: z.ZodIssueCode.custom,
                message: t(Resource.PAYMENT_DAY_NOT_ALLOWED, lang),
            });
        }

        if (data.isInstallment && data.isRecurring) {
            ctx.addIssue({
                path: ['isRecurring'],
                code: z.ZodIssueCode.custom,
                message: t(Resource.CONFLICT_INSTALLMENT_RECURRING, lang),
            });
        }
    });

/**
 * Schema to validate transaction creation
 */
export const createTransactionSchema = (lang?: LanguageCode) =>
    withTransactionRefinements(baseTransactionSchema(lang), lang);

/**
 * Schema to validate transaction update (all fields optional)
 */
export const updateTransactionSchema = (lang?: LanguageCode) =>
    withTransactionRefinements(baseTransactionSchema(lang).partial(), lang, true);
