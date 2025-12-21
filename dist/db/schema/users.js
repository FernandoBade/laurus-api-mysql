"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.users = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const enum_1 = require("../../utils/enum");
/**
 * Users table schema.
 * Stores user account information including preferences and authentication data.
 */
exports.users = (0, mysql_core_1.mysqlTable)('user', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    firstName: (0, mysql_core_1.varchar)('firstName', { length: 255 }),
    lastName: (0, mysql_core_1.varchar)('lastName', { length: 255 }),
    email: (0, mysql_core_1.varchar)('email', { length: 255 }).unique().notNull(),
    password: (0, mysql_core_1.varchar)('password', { length: 255 }),
    birthDate: (0, mysql_core_1.date)('birthDate'),
    phone: (0, mysql_core_1.varchar)('phone', { length: 255 }),
    theme: (0, mysql_core_1.mysqlEnum)('theme', Object.values(enum_1.Theme)).default(enum_1.Theme.DARK).notNull(),
    language: (0, mysql_core_1.mysqlEnum)('language', Object.values(enum_1.Language)).default(enum_1.Language.EN_US).notNull(),
    dateFormat: (0, mysql_core_1.mysqlEnum)('dateFormat', Object.values(enum_1.DateFormat)).default(enum_1.DateFormat.DD_MM_YYYY).notNull(),
    currency: (0, mysql_core_1.mysqlEnum)('currency', Object.values(enum_1.Currency)).default(enum_1.Currency.BRL).notNull(),
    profile: (0, mysql_core_1.mysqlEnum)('profile', Object.values(enum_1.Profile)).default(enum_1.Profile.STARTER).notNull(),
    active: (0, mysql_core_1.boolean)('active').default(true).notNull(),
    createdAt: (0, mysql_core_1.timestamp)('createdAt').defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updatedAt').defaultNow().onUpdateNow().notNull(),
});
