import { mysqlTable, int, varchar, text, timestamp, mysqlEnum, boolean } from 'drizzle-orm/mysql-core';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { CreditCardFlag } from '../../utils/enum';

/**
 * Credit cards table schema.
 * Stores credit card information linked to users and accounts.
 */
export const creditCards = mysqlTable('credit_card', {
    id: int('id').primaryKey().autoincrement(),
    name: varchar('name', { length: 255 }),
    flag: mysqlEnum('flag', Object.values(CreditCardFlag) as [string, ...string[]]).notNull(),
    observation: text('observation'),
    active: boolean('active').default(true).notNull(),
    userId: int('user_id').notNull(),
    accountId: int('account_id'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type SelectCreditCard = InferSelectModel<typeof creditCards>;
export type InsertCreditCard = InferInsertModel<typeof creditCards>;

