import { z } from 'zod';
import { AccountType } from '../../utils/enum';
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
 * Shared base schema for account creation and update.
 */
const baseAccountSchema = (lang?: LanguageCode) =>
  z.object({
    name: z.string().min(1, { message: t(Resource.TOO_SMALL, lang) }),
    institution: z.string().min(1, { message: t(Resource.TOO_SMALL, lang) }),
    type: z.enum([
      AccountType.CHECKING,
      AccountType.PAYROLL,
      AccountType.SAVINGS,
      AccountType.INVESTMENT,
      AccountType.LOAN,
      AccountType.OTHER,
    ], {
      errorMap: () => ({ message: t(Resource.INVALID_ENUM, lang) }),
    }),
    observation: z.string().optional(),
    user_id: z.number({
      required_error: t(Resource.VALIDATION_ERROR, lang),
      invalid_type_error: t(Resource.INVALID_TYPE, lang),
    }).int().positive({ message: t(Resource.TOO_SMALL, lang) }),
    active: z.boolean({ invalid_type_error: t(Resource.INVALID_TYPE, lang) }).optional(),
    createdAt: dateSchema(lang).optional(),
    updatedAt: dateSchema(lang).optional(),
  }).strict();

/**
 * Schema to validate account creation.
 */
export const createAccountSchema = (lang?: LanguageCode) => baseAccountSchema(lang);

/**
 * Schema to validate account update (all fields optional).
 */
export const updateAccountSchema = (lang?: LanguageCode) => baseAccountSchema(lang).partial();
