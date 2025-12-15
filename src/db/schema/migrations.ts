import { mysqlTable, int, varchar, text, timestamp, mysqlEnum } from 'drizzle-orm/mysql-core';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { LogOperation } from '../../utils/enum';

/**
 * Migrations table schema.
 * Stores database migration records.
 */
export const migrations = mysqlTable('migration', {
    id: int('id').primaryKey().autoincrement(),
    name: varchar('name', { length: 255 }).notNull(),
    tableName: varchar('tableName', { length: 255 }).notNull(),
    columnName: varchar('columnName', { length: 255 }).notNull(),
    operation: mysqlEnum('operation', Object.values(LogOperation) as [string, ...string[]]).notNull(),
    up: text('up').notNull(),
    down: text('down').notNull(),
    migrationGroupId: int('migrationGroup_id'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type SelectMigration = InferSelectModel<typeof migrations>;
export type InsertMigration = InferInsertModel<typeof migrations>;

