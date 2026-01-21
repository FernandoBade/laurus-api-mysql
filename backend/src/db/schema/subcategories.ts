import { mysqlTable, int, varchar, timestamp, boolean } from 'drizzle-orm/mysql-core';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';

/**
 * Subcategories table schema.
 * Stores transaction subcategories linked to categories.
 */
export const subcategories = mysqlTable('subcategory', {
    id: int('id').primaryKey().autoincrement(),
    name: varchar('name', { length: 255 }),
    active: boolean('active').default(true).notNull(),
    categoryId: int('categoryId').notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type SelectSubcategory = InferSelectModel<typeof subcategories>;
export type InsertSubcategory = InferInsertModel<typeof subcategories>;

