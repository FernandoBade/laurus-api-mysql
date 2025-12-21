"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokens = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
/**
 * Refresh tokens table schema.
 * Stores refresh tokens for user authentication.
 */
exports.refreshTokens = (0, mysql_core_1.mysqlTable)('refresh_token', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    token: (0, mysql_core_1.varchar)('token', { length: 255 }).unique().notNull(),
    expiresAt: (0, mysql_core_1.timestamp)('expiresAt').notNull(),
    userId: (0, mysql_core_1.int)('user_id'),
    createdAt: (0, mysql_core_1.timestamp)('createdAt').defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updatedAt').defaultNow().onUpdateNow().notNull(),
});
