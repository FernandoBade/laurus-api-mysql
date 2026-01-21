import { mysqlTable, int, varchar, boolean, timestamp, uniqueIndex } from 'drizzle-orm/mysql-core';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';

/**
 * Tags table schema.
 * Stores user-scoped labels for transaction organization.
 */
export const tags = mysqlTable('tag', {
    id: int('id').primaryKey().autoincrement(),
    userId: int('userId').notNull(),
    name: varchar('name', { length: 255 }),
    active: boolean('active').default(true).notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
}, (table) => ({
    userNameUnique: uniqueIndex('tag_userId_name_unique').on(table.userId, table.name),
}));

export type SelectTag = InferSelectModel<typeof tags>;
export type InsertTag = InferInsertModel<typeof tags>;
