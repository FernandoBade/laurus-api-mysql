import { z } from 'zod';
import { Language, Theme, Currency, DateFormat } from '../../utils/enum'

const dateSchema = z
    .union([
        z.string().refine((value) => {
            const convertedDate = new Date(value);
            return !isNaN(convertedDate.getTime());
        }, { message: "Invalid format. Use a valid ISO 8601 string." }),

        z.number().refine((value) => value > 0, {
            message: "Timestamp must be a positive number representing milliseconds since 1970."
        }).transform((value) => new Date(value)),

        z.date().refine((value) => !isNaN(value.getTime()), {
            message: "The provided date is not valid.",
        }),
    ])
    .transform((value) => {
        if (typeof value === "string" || typeof value === "number") {
            const convertedDate = new Date(value);
            if (isNaN(convertedDate.getTime())) {
                throw new z.ZodError([
                    {
                        code: "custom",
                        path: ["date"],
                        message: `Invalid date: ${value}. Use ISO 8601 or timestamp.`,
                    },
                ]);
            }
            return convertedDate;
        }
        return value;
    });

export const createUserSchema = z.object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    email: z.string().toLowerCase().trim().email(),
    password: z.string().min(6),
    phone: z.string().optional(),
    birthDate: dateSchema.optional(),
    createdAt: dateSchema.optional(),
    active: z.boolean().optional(),
    theme: z.enum([Theme.DARK, Theme.LIGHT]).optional(),
    language: z.enum([Language.PT_BR, Language.EN_US, Language.ES_ES]).optional(),
    currency: z.enum([Currency.BRL, Currency.USD, Currency.EUR, Currency.ARS]).optional(),
    dateFormat: z.enum([DateFormat.DD_MM_YYYY, DateFormat.MM_DD_YYYY]).optional(),
}).strict();

export const updateUserSchema = z.object({
    firstName: z.string().min(2).optional(),
    lastName: z.string().min(2).optional(),
    email: z.string().toLowerCase().trim().email().optional(),
    password: z.string().min(6).optional(),
    phone: z.string().optional(),
    birthDate: dateSchema.optional(),
    active: z.boolean().optional(),
    theme: z.enum([Theme.DARK, Theme.LIGHT]).optional(),
    language: z.enum([Language.PT_BR, Language.EN_US, Language.ES_ES]).optional(),
    currency: z.enum([Currency.BRL, Currency.USD, Currency.EUR, Currency.ARS]).optional(),
    dateFormat: z.enum([DateFormat.DD_MM_YYYY, DateFormat.MM_DD_YYYY]).optional(),
}).strict();
