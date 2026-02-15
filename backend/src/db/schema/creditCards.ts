import { mysqlTable, int, varchar, text, timestamp, mysqlEnum, boolean, decimal } from 'drizzle-orm/mysql-core';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { CreditCardFlag } from '../../../../shared/enums/creditCard.enums';

/**
 * Credit cards table schema.
 * Stores credit card information linked to users and accounts.
 */
export const creditCards = mysqlTable('credit_card', {
    id: int('id').primaryKey().autoincrement(),
    name: varchar('name', { length: 255 }),
    flag: mysqlEnum('flag', Object.values(CreditCardFlag) as [CreditCardFlag, ...CreditCardFlag[]]).notNull(),
    observation: text('observation'),
    balance: decimal('balance', { precision: 10, scale: 2 }).default('0.00').notNull(),
    limit: decimal('limit', { precision: 10, scale: 2 }).default('0.00').notNull(),
    active: boolean('active').default(true).notNull(),
    userId: int('userId').notNull(),
    accountId: int('accountId'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type SelectCreditCard = InferSelectModel<typeof creditCards>;
export type InsertCreditCard = InferInsertModel<typeof creditCards>;

