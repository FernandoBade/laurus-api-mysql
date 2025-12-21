"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrations = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const enum_1 = require("../../utils/enum");
/**
 * Migrations table schema.
 * Stores database migration records.
 */
exports.migrations = (0, mysql_core_1.mysqlTable)('migration', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    name: (0, mysql_core_1.varchar)('name', { length: 255 }).notNull(),
    tableName: (0, mysql_core_1.varchar)('tableName', { length: 255 }).notNull(),
    columnName: (0, mysql_core_1.varchar)('columnName', { length: 255 }).notNull(),
    operation: (0, mysql_core_1.mysqlEnum)('operation', Object.values(enum_1.LogOperation)).notNull(),
    up: (0, mysql_core_1.text)('up').notNull(),
    down: (0, mysql_core_1.text)('down').notNull(),
    migrationGroupId: (0, mysql_core_1.int)('migrationGroup_id'),
    createdAt: (0, mysql_core_1.timestamp)('createdAt').defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updatedAt').defaultNow().onUpdateNow().notNull(),
});
