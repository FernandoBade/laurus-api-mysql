import { mysqlTable, int, decimal, date, text, timestamp, mysqlEnum, boolean } from 'drizzle-orm/mysql-core';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { TransactionType, TransactionSource } from '../../../../shared/enums';

/**
 * Transactions table schema.
 * Stores financial transactions linked to accounts or credit cards.
 */
export const transactions = mysqlTable('transaction', {
    id: int('id').primaryKey().autoincrement(),
    value: decimal('value', { precision: 10, scale: 2 }).notNull(),
    date: date('date').notNull(),
    transactionType: mysqlEnum('transactionType', Object.values(TransactionType) as [TransactionType, ...TransactionType[]]).notNull(),
    observation: text('observation'),
    transactionSource: mysqlEnum('transactionSource', Object.values(TransactionSource) as [TransactionSource, ...TransactionSource[]]).notNull(),
    isInstallment: boolean('isInstallment').default(false).notNull(),
    totalMonths: int('totalMonths'),
    isRecurring: boolean('isRecurring').default(false).notNull(),
    paymentDay: int('paymentDay'),
    active: boolean('active').default(true).notNull(),
    accountId: int('accountId'),
    creditCardId: int('creditCardId'),
    categoryId: int('categoryId'),
    subcategoryId: int('subcategoryId'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type SelectTransaction = InferSelectModel<typeof transactions>;
export type InsertTransaction = InferInsertModel<typeof transactions>;

