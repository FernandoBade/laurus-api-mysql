import { mysqlTable, int, varchar, text, timestamp, mysqlEnum, boolean, decimal } from 'drizzle-orm/mysql-core';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { AccountType } from '../../utils/enum';

/**
 * Accounts table schema.
 * Stores financial account information linked to users.
 */
export const accounts = mysqlTable('account', {
    id: int('id').primaryKey().autoincrement(),
    name: varchar('name', { length: 255 }),
    institution: varchar('institution', { length: 255 }),
    type: mysqlEnum('type', Object.values(AccountType) as [string, ...string[]]).default(AccountType.OTHER).notNull(),
    observation: text('observation'),
    balance: decimal('balance', { precision: 10, scale: 2 }).default('0.00').notNull(),
    active: boolean('active').default(true).notNull(),
    userId: int('user_id').notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type SelectAccount = InferSelectModel<typeof accounts>;
export type InsertAccount = InferInsertModel<typeof accounts>;

