"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrationGroups = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
/**
 * Migration groups table schema.
 * Groups related database migrations together.
 */
exports.migrationGroups = (0, mysql_core_1.mysqlTable)('migration_group', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    name: (0, mysql_core_1.varchar)('name', { length: 255 }).unique().notNull(),
    up: (0, mysql_core_1.text)('up').notNull(),
    down: (0, mysql_core_1.text)('down').notNull(),
    createdAt: (0, mysql_core_1.timestamp)('createdAt').defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updatedAt').defaultNow().onUpdateNow().notNull(),
});
