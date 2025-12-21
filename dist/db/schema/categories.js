"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categories = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const enum_1 = require("../../utils/enum");
/**
 * Categories table schema.
 * Stores transaction categories linked to users.
 */
exports.categories = (0, mysql_core_1.mysqlTable)('category', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    name: (0, mysql_core_1.varchar)('name', { length: 255 }),
    type: (0, mysql_core_1.mysqlEnum)('type', Object.values(enum_1.CategoryType)).notNull(),
    color: (0, mysql_core_1.mysqlEnum)('color', Object.values(enum_1.CategoryColor)).default(enum_1.CategoryColor.PURPLE).notNull(),
    active: (0, mysql_core_1.boolean)('active').default(true).notNull(),
    userId: (0, mysql_core_1.int)('user_id').notNull(),
    createdAt: (0, mysql_core_1.timestamp)('createdAt').defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updatedAt').defaultNow().onUpdateNow().notNull(),
});
