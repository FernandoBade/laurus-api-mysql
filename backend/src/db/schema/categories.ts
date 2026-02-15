import { mysqlTable, int, varchar, timestamp, mysqlEnum, boolean } from 'drizzle-orm/mysql-core';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { CategoryType, CategoryColor } from '../../../../shared/enums/category.enums';

/**
 * Categories table schema.
 * Stores transaction categories linked to users.
 */
export const categories = mysqlTable('category', {
    id: int('id').primaryKey().autoincrement(),
    name: varchar('name', { length: 255 }),
    type: mysqlEnum('type', Object.values(CategoryType) as [CategoryType, ...CategoryType[]]).notNull(),
    color: mysqlEnum('color', Object.values(CategoryColor) as [CategoryColor, ...CategoryColor[]]).default(CategoryColor.PURPLE).notNull(),
    active: boolean('active').default(true).notNull(),
    userId: int('userId').notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type SelectCategory = InferSelectModel<typeof categories>;
export type InsertCategory = InferInsertModel<typeof categories>;

