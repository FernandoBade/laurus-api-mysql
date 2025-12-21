"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subcategories = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
/**
 * Subcategories table schema.
 * Stores transaction subcategories linked to categories.
 */
exports.subcategories = (0, mysql_core_1.mysqlTable)('subcategory', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    name: (0, mysql_core_1.varchar)('name', { length: 255 }),
    active: (0, mysql_core_1.boolean)('active').default(true).notNull(),
    categoryId: (0, mysql_core_1.int)('category_id').notNull(),
    createdAt: (0, mysql_core_1.timestamp)('createdAt').defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updatedAt').defaultNow().onUpdateNow().notNull(),
});
