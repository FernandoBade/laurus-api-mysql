"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accounts = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const enum_1 = require("../../utils/enum");
/**
 * Accounts table schema.
 * Stores financial account information linked to users.
 */
exports.accounts = (0, mysql_core_1.mysqlTable)('account', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    name: (0, mysql_core_1.varchar)('name', { length: 255 }),
    institution: (0, mysql_core_1.varchar)('institution', { length: 255 }),
    type: (0, mysql_core_1.mysqlEnum)('type', Object.values(enum_1.AccountType)).default(enum_1.AccountType.OTHER).notNull(),
    observation: (0, mysql_core_1.text)('observation'),
    active: (0, mysql_core_1.boolean)('active').default(true).notNull(),
    userId: (0, mysql_core_1.int)('user_id').notNull(),
    createdAt: (0, mysql_core_1.timestamp)('createdAt').defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updatedAt').defaultNow().onUpdateNow().notNull(),
});
