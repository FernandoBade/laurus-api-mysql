import { mysqlTable, int, varchar, date, timestamp, mysqlEnum, boolean } from 'drizzle-orm/mysql-core';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { Theme, Language, DateFormat, Currency, Profile } from '../../../../shared/enums';

/**
 * Users table schema.
 * Stores user account information including preferences and authentication data.
 */
export const users = mysqlTable('user', {
    id: int('id').primaryKey().autoincrement(),
    firstName: varchar('firstName', { length: 255 }),
    lastName: varchar('lastName', { length: 255 }),
    email: varchar('email', { length: 255 }).unique().notNull(),
    password: varchar('password', { length: 255 }),
    birthDate: date('birthDate'),
    phone: varchar('phone', { length: 255 }),
    avatarUrl: varchar('avatarUrl', { length: 512 }),
    theme: mysqlEnum('theme', Object.values(Theme) as [Theme, ...Theme[]]).default(Theme.DARK).notNull(),
    language: mysqlEnum('language', Object.values(Language) as [Language, ...Language[]]).default(Language.EN_US).notNull(),
    dateFormat: mysqlEnum('dateFormat', Object.values(DateFormat) as [DateFormat, ...DateFormat[]]).default(DateFormat.DD_MM_YYYY).notNull(),
    currency: mysqlEnum('currency', Object.values(Currency) as [Currency, ...Currency[]]).default(Currency.BRL).notNull(),
    profile: mysqlEnum('profile', Object.values(Profile) as [Profile, ...Profile[]]).default(Profile.STARTER).notNull(),
    hideValues: boolean('hideValues').default(false).notNull(),
    active: boolean('active').default(true).notNull(),
    emailVerifiedAt: timestamp('emailVerifiedAt'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type SelectUser = InferSelectModel<typeof users>;
export type InsertUser = InferInsertModel<typeof users>;

