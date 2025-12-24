import { mysqlTable, int, varchar, timestamp, mysqlEnum, index } from 'drizzle-orm/mysql-core';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { TokenType } from '../../utils/enum';

/**
 * Tokens table schema.
 * Stores authentication tokens
 */
export const tokens = mysqlTable('token', {
    id: int('id').primaryKey().autoincrement(),
    userId: int('user_id').notNull(),
    type: mysqlEnum('type', Object.values(TokenType) as [string, ...string[]]).notNull(),
    tokenHash: varchar('token_hash', { length: 64 }).unique().notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
}, (table) => ({
    userIdIdx: index('token_user_id_idx').on(table.userId),
    expiresAtIdx: index('token_expires_at_idx').on(table.expiresAt),
}));

export type SelectToken = InferSelectModel<typeof tokens>;
export type InsertToken = InferInsertModel<typeof tokens>;
