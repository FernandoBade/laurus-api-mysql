import { mysqlTable, int, varchar, timestamp, mysqlEnum, index } from 'drizzle-orm/mysql-core';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { TokenType } from '../../../../shared/enums';

/**
 * Tokens table schema.
 * Stores authentication tokens
 */
export const tokens = mysqlTable('token', {
    id: int('id').primaryKey().autoincrement(),
    userId: int('userId').notNull(),
    type: mysqlEnum('type', Object.values(TokenType) as [TokenType, ...TokenType[]]).notNull(),
    tokenHash: varchar('tokenHash', { length: 64 }).unique().notNull(),
    sessionId: varchar('sessionId', { length: 64 }),
    sessionExpiresAt: timestamp('sessionExpiresAt'),
    revokedAt: timestamp('revokedAt'),
    expiresAt: timestamp('expiresAt').notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
}, (table) => ({
    userIdIdx: index('token_userId_idx').on(table.userId),
    sessionIdIdx: index('token_sessionId_idx').on(table.sessionId),
    expiresAtIdx: index('token_expiresAt_idx').on(table.expiresAt),
}));

export type SelectToken = InferSelectModel<typeof tokens>;
export type InsertToken = InferInsertModel<typeof tokens>;
