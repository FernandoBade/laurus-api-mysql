import { mysqlTable, int, text, timestamp, mysqlEnum } from 'drizzle-orm/mysql-core';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { LogType, LogOperation, LogCategory } from '../../../../shared/enums';

/**
 * Logs table schema.
 * Stores application logs linked to users.
 */
export const logs = mysqlTable('log', {
    id: int('id').primaryKey().autoincrement(),
    type: mysqlEnum('type', Object.values(LogType) as [LogType, ...LogType[]]).notNull(),
    operation: mysqlEnum('operation', Object.values(LogOperation) as [LogOperation, ...LogOperation[]]).default(LogOperation.CREATE).notNull(),
    category: mysqlEnum('category', Object.values(LogCategory) as [LogCategory, ...LogCategory[]]).default(LogCategory.LOG).notNull(),
    detail: text('detail'),
    userId: int('user_id'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type SelectLog = InferSelectModel<typeof logs>;
export type InsertLog = InferInsertModel<typeof logs>;

