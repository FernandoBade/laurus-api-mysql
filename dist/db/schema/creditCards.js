"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.creditCards = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const enum_1 = require("../../utils/enum");
/**
 * Credit cards table schema.
 * Stores credit card information linked to users and accounts.
 */
exports.creditCards = (0, mysql_core_1.mysqlTable)('credit_card', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    name: (0, mysql_core_1.varchar)('name', { length: 255 }),
    flag: (0, mysql_core_1.mysqlEnum)('flag', Object.values(enum_1.CreditCardFlag)).notNull(),
    observation: (0, mysql_core_1.text)('observation'),
    active: (0, mysql_core_1.boolean)('active').default(true).notNull(),
    userId: (0, mysql_core_1.int)('user_id').notNull(),
    accountId: (0, mysql_core_1.int)('account_id'),
    createdAt: (0, mysql_core_1.timestamp)('createdAt').defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updatedAt').defaultNow().onUpdateNow().notNull(),
});
