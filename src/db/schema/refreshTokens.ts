import { mysqlTable, int, varchar, timestamp } from 'drizzle-orm/mysql-core';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';

/**
 * Refresh tokens table schema.
 * Stores refresh tokens for user authentication.
 */
export const refreshTokens = mysqlTable('refresh_token', {
    id: int('id').primaryKey().autoincrement(),
    token: varchar('token', { length: 255 }).unique().notNull(),
    expiresAt: timestamp('expiresAt').notNull(),
    userId: int('user_id'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type SelectRefreshToken = InferSelectModel<typeof refreshTokens>;
export type InsertRefreshToken = InferInsertModel<typeof refreshTokens>;

