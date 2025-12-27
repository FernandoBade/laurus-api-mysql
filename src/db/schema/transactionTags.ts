import { mysqlTable, int, timestamp, uniqueIndex } from 'drizzle-orm/mysql-core';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';

/**
 * Transaction tags table schema.
 * Stores many-to-many relationships between transactions and tags.
 */
export const transactionTags = mysqlTable('transaction_tag', {
    transactionId: int('transaction_id').notNull(),
    tagId: int('tag_id').notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
}, (table) => ({
    transactionTagUnique: uniqueIndex('transaction_tag_unique').on(table.transactionId, table.tagId),
}));

export type SelectTransactionTag = InferSelectModel<typeof transactionTags>;
export type InsertTransactionTag = InferInsertModel<typeof transactionTags>;
