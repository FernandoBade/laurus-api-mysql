import { mysqlTable, int, text, timestamp, mysqlEnum } from 'drizzle-orm/mysql-core';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { LogType, LogOperation, LogCategory } from '../../utils/enum';

/**
 * Logs table schema.
 * Stores application logs linked to users.
 */
export const logs = mysqlTable('log', {
    id: int('id').primaryKey().autoincrement(),
    type: mysqlEnum('type', Object.values(LogType) as [string, ...string[]]).notNull(),
    operation: mysqlEnum('operation', Object.values(LogOperation) as [string, ...string[]]).default(LogOperation.CREATE).notNull(),
    category: mysqlEnum('category', Object.values(LogCategory) as [string, ...string[]]).default(LogCategory.LOG).notNull(),
    detail: text('detail'),
    userId: int('user_id'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type SelectLog = InferSelectModel<typeof logs>;
export type InsertLog = InferInsertModel<typeof logs>;

