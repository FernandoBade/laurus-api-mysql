"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logs = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const enum_1 = require("../../utils/enum");
/**
 * Logs table schema.
 * Stores application logs linked to users.
 */
exports.logs = (0, mysql_core_1.mysqlTable)('log', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    type: (0, mysql_core_1.mysqlEnum)('type', Object.values(enum_1.LogType)).notNull(),
    operation: (0, mysql_core_1.mysqlEnum)('operation', Object.values(enum_1.LogOperation)).default(enum_1.LogOperation.CREATE).notNull(),
    category: (0, mysql_core_1.mysqlEnum)('category', Object.values(enum_1.LogCategory)).default(enum_1.LogCategory.LOG).notNull(),
    detail: (0, mysql_core_1.text)('detail'),
    userId: (0, mysql_core_1.int)('user_id'),
    createdAt: (0, mysql_core_1.timestamp)('createdAt').defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updatedAt').defaultNow().onUpdateNow().notNull(),
});
