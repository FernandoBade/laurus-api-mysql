import { relations } from 'drizzle-orm';
import { users } from './users';
import { accounts } from './accounts';
import { transactions } from './transactions';
import { categories } from './categories';
import { subcategories } from './subcategories';
import { creditCards } from './creditCards';
import { logs } from './logs';
import { refreshTokens } from './refreshTokens';
import { migrations } from './migrations';
import { migrationGroups } from './migrationGroups';

/**
 * User relations.
 * Defines one-to-many relationships from users to other entities.
 */
export const usersRelations = relations(users, ({ many }) => ({
    logs: many(logs),
    refreshTokens: many(refreshTokens),
    accounts: many(accounts),
    creditCards: many(creditCards),
    categories: many(categories),
}));

/**
 * Account relations.
 * Defines relationships between accounts, users, credit cards, and transactions.
 */
export const accountsRelations = relations(accounts, ({ one, many }) => ({
    user: one(users, {
        fields: [accounts.userId],
        references: [users.id],
    }),
    creditCard: one(creditCards),
    transactions: many(transactions),
}));

/**
 * Transaction relations.
 * Defines relationships between transactions and accounts, credit cards, categories, and subcategories.
 */
export const transactionsRelations = relations(transactions, ({ one }) => ({
    account: one(accounts, {
        fields: [transactions.accountId],
        references: [accounts.id],
    }),
    creditCard: one(creditCards, {
        fields: [transactions.creditCardId],
        references: [creditCards.id],
    }),
    category: one(categories, {
        fields: [transactions.categoryId],
        references: [categories.id],
    }),
    subcategory: one(subcategories, {
        fields: [transactions.subcategoryId],
        references: [subcategories.id],
    }),
}));

/**
 * Category relations.
 * Defines relationships between categories, users, subcategories, and transactions.
 */
export const categoriesRelations = relations(categories, ({ one, many }) => ({
    user: one(users, {
        fields: [categories.userId],
        references: [users.id],
    }),
    subcategories: many(subcategories),
    transactions: many(transactions),
}));

/**
 * Subcategory relations.
 * Defines relationships between subcategories, categories, and transactions.
 */
export const subcategoriesRelations = relations(subcategories, ({ one, many }) => ({
    category: one(categories, {
        fields: [subcategories.categoryId],
        references: [categories.id],
    }),
    transactions: many(transactions),
}));

/**
 * Credit card relations.
 * Defines relationships between credit cards, users, accounts, and transactions.
 */
export const creditCardsRelations = relations(creditCards, ({ one, many }) => ({
    user: one(users, {
        fields: [creditCards.userId],
        references: [users.id],
    }),
    account: one(accounts, {
        fields: [creditCards.accountId],
        references: [accounts.id],
    }),
    transactions: many(transactions),
}));

/**
 * Log relations.
 * Defines relationships between logs and users.
 */
export const logsRelations = relations(logs, ({ one }) => ({
    user: one(users, {
        fields: [logs.userId],
        references: [users.id],
    }),
}));

/**
 * Refresh token relations.
 * Defines relationships between refresh tokens and users.
 */
export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
    user: one(users, {
        fields: [refreshTokens.userId],
        references: [users.id],
    }),
}));

/**
 * Migration relations.
 * Defines relationships between migrations and migration groups.
 */
export const migrationsRelations = relations(migrations, ({ one }) => ({
    migrationGroup: one(migrationGroups, {
        fields: [migrations.migrationGroupId],
        references: [migrationGroups.id],
    }),
}));

/**
 * Migration group relations.
 * Defines one-to-many relationships from migration groups to migrations.
 */
export const migrationGroupsRelations = relations(migrationGroups, ({ many }) => ({
    migrations: many(migrations),
}));

