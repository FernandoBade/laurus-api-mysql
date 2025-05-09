import { z } from 'zod';
import { AccountType } from '../../utils/enum';

/**
 * Accepts valid ISO strings, timestamps or native Date objects.
 * Converts everything to Date and validates invalid entries.
 */
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

export const createAccountSchema = z.object({
    name: z.string().min(1),
    institution: z.string().min(1),
    type: z.enum([
        AccountType.CHECKING,
        AccountType.PAYROLL,
        AccountType.SAVINGS,
        AccountType.INVESTMENT,
        AccountType.LOAN,
        AccountType.OTHER
    ]),
    observation: z.string().optional(),
    user_id: z.number().int().positive(),
    active: z.boolean().optional(),
    createdAt: dateSchema.optional(),
    updatedAt: dateSchema.optional(),
}).strict();

export const updateAccountSchema = z.object({
    name: z.string().min(1).optional(),
    institution: z.string().min(1).optional(),
    type: z.enum([
        AccountType.CHECKING,
        AccountType.PAYROLL,
        AccountType.SAVINGS,
        AccountType.INVESTMENT,
        AccountType.LOAN,
        AccountType.OTHER
    ]).optional(),
    observation: z.string().optional(),
    user_id: z.number().int().positive().optional(),
    active: z.boolean().optional(),
    updatedAt: dateSchema.optional(),
}).strict();
