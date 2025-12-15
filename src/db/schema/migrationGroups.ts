import { mysqlTable, int, varchar, text, timestamp } from 'drizzle-orm/mysql-core';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';

/**
 * Migration groups table schema.
 * Groups related database migrations together.
 */
export const migrationGroups = mysqlTable('migration_group', {
    id: int('id').primaryKey().autoincrement(),
    name: varchar('name', { length: 255 }).unique().notNull(),
    up: text('up').notNull(),
    down: text('down').notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type SelectMigrationGroup = InferSelectModel<typeof migrationGroups>;
export type InsertMigrationGroup = InferInsertModel<typeof migrationGroups>;

