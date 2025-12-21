"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactions = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const enum_1 = require("../../utils/enum");
/**
 * Transactions table schema.
 * Stores financial transactions linked to accounts or credit cards.
 */
exports.transactions = (0, mysql_core_1.mysqlTable)('transaction', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    value: (0, mysql_core_1.decimal)('value', { precision: 10, scale: 2 }).notNull(),
    date: (0, mysql_core_1.date)('date').notNull(),
    transactionType: (0, mysql_core_1.mysqlEnum)('transactionType', Object.values(enum_1.TransactionType)).notNull(),
    observation: (0, mysql_core_1.text)('observation'),
    transactionSource: (0, mysql_core_1.mysqlEnum)('transactionSource', Object.values(enum_1.TransactionSource)).notNull(),
    isInstallment: (0, mysql_core_1.boolean)('isInstallment').default(false).notNull(),
    totalMonths: (0, mysql_core_1.int)('totalMonths'),
    isRecurring: (0, mysql_core_1.boolean)('isRecurring').default(false).notNull(),
    paymentDay: (0, mysql_core_1.int)('paymentDay'),
    active: (0, mysql_core_1.boolean)('active').default(true).notNull(),
    accountId: (0, mysql_core_1.int)('account_id'),
    creditCardId: (0, mysql_core_1.int)('credit_card_id'),
    categoryId: (0, mysql_core_1.int)('category_id'),
    subcategoryId: (0, mysql_core_1.int)('subcategory_id'),
    createdAt: (0, mysql_core_1.timestamp)('createdAt').defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updatedAt').defaultNow().onUpdateNow().notNull(),
});
