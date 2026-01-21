import { mysqlTable, int, timestamp, primaryKey, foreignKey } from 'drizzle-orm/mysql-core';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { transactions } from './transactions';
import { tags } from './tags';

/**
 * Transaction tags table schema.
 * Stores many-to-many relationships between transactions and tags.
 * It uses composite primary key on (transactionId, tagId).
 */
export const transactionTags = mysqlTable('transactions__to__tags', {
    transactionId: int('transactionId').notNull(),
    tagId: int('tagId').notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
}, (table) => ({
    transactionTagsPk: primaryKey({ name: 'transactions__to__tags_pk', columns: [table.transactionId, table.tagId] }),
    transactionFk: foreignKey({
        name: 'transactions__to__tags_transactionId_fk',
        columns: [table.transactionId],
        foreignColumns: [transactions.id],
    }).onDelete('no action').onUpdate('no action'),
    tagFk: foreignKey({
        name: 'transactions__to__tags_tagId_fk',
        columns: [table.tagId],
        foreignColumns: [tags.id],
    }).onDelete('no action').onUpdate('no action'),
}));

export type SelectTransactionTag = InferSelectModel<typeof transactionTags>;
export type InsertTransactionTag = InferInsertModel<typeof transactionTags>;
