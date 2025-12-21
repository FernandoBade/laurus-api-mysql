"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrationGroupsRelations = exports.migrationsRelations = exports.refreshTokensRelations = exports.logsRelations = exports.creditCardsRelations = exports.subcategoriesRelations = exports.categoriesRelations = exports.transactionsRelations = exports.accountsRelations = exports.usersRelations = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const users_1 = require("./users");
const accounts_1 = require("./accounts");
const transactions_1 = require("./transactions");
const categories_1 = require("./categories");
const subcategories_1 = require("./subcategories");
const creditCards_1 = require("./creditCards");
const logs_1 = require("./logs");
const refreshTokens_1 = require("./refreshTokens");
const migrations_1 = require("./migrations");
const migrationGroups_1 = require("./migrationGroups");
/**
 * User relations.
 * Defines one-to-many relationships from users to other entities.
 */
exports.usersRelations = (0, drizzle_orm_1.relations)(users_1.users, ({ many }) => ({
    logs: many(logs_1.logs),
    refreshTokens: many(refreshTokens_1.refreshTokens),
    accounts: many(accounts_1.accounts),
    creditCards: many(creditCards_1.creditCards),
    categories: many(categories_1.categories),
}));
/**
 * Account relations.
 * Defines relationships between accounts, users, credit cards, and transactions.
 */
exports.accountsRelations = (0, drizzle_orm_1.relations)(accounts_1.accounts, ({ one, many }) => ({
    user: one(users_1.users, {
        fields: [accounts_1.accounts.userId],
        references: [users_1.users.id],
    }),
    creditCard: one(creditCards_1.creditCards),
    transactions: many(transactions_1.transactions),
}));
/**
 * Transaction relations.
 * Defines relationships between transactions and accounts, credit cards, categories, and subcategories.
 */
exports.transactionsRelations = (0, drizzle_orm_1.relations)(transactions_1.transactions, ({ one }) => ({
    account: one(accounts_1.accounts, {
        fields: [transactions_1.transactions.accountId],
        references: [accounts_1.accounts.id],
    }),
    creditCard: one(creditCards_1.creditCards, {
        fields: [transactions_1.transactions.creditCardId],
        references: [creditCards_1.creditCards.id],
    }),
    category: one(categories_1.categories, {
        fields: [transactions_1.transactions.categoryId],
        references: [categories_1.categories.id],
    }),
    subcategory: one(subcategories_1.subcategories, {
        fields: [transactions_1.transactions.subcategoryId],
        references: [subcategories_1.subcategories.id],
    }),
}));
/**
 * Category relations.
 * Defines relationships between categories, users, subcategories, and transactions.
 */
exports.categoriesRelations = (0, drizzle_orm_1.relations)(categories_1.categories, ({ one, many }) => ({
    user: one(users_1.users, {
        fields: [categories_1.categories.userId],
        references: [users_1.users.id],
    }),
    subcategories: many(subcategories_1.subcategories),
    transactions: many(transactions_1.transactions),
}));
/**
 * Subcategory relations.
 * Defines relationships between subcategories, categories, and transactions.
 */
exports.subcategoriesRelations = (0, drizzle_orm_1.relations)(subcategories_1.subcategories, ({ one, many }) => ({
    category: one(categories_1.categories, {
        fields: [subcategories_1.subcategories.categoryId],
        references: [categories_1.categories.id],
    }),
    transactions: many(transactions_1.transactions),
}));
/**
 * Credit card relations.
 * Defines relationships between credit cards, users, accounts, and transactions.
 */
exports.creditCardsRelations = (0, drizzle_orm_1.relations)(creditCards_1.creditCards, ({ one, many }) => ({
    user: one(users_1.users, {
        fields: [creditCards_1.creditCards.userId],
        references: [users_1.users.id],
    }),
    account: one(accounts_1.accounts, {
        fields: [creditCards_1.creditCards.accountId],
        references: [accounts_1.accounts.id],
    }),
    transactions: many(transactions_1.transactions),
}));
/**
 * Log relations.
 * Defines relationships between logs and users.
 */
exports.logsRelations = (0, drizzle_orm_1.relations)(logs_1.logs, ({ one }) => ({
    user: one(users_1.users, {
        fields: [logs_1.logs.userId],
        references: [users_1.users.id],
    }),
}));
/**
 * Refresh token relations.
 * Defines relationships between refresh tokens and users.
 */
exports.refreshTokensRelations = (0, drizzle_orm_1.relations)(refreshTokens_1.refreshTokens, ({ one }) => ({
    user: one(users_1.users, {
        fields: [refreshTokens_1.refreshTokens.userId],
        references: [users_1.users.id],
    }),
}));
/**
 * Migration relations.
 * Defines relationships between migrations and migration groups.
 */
exports.migrationsRelations = (0, drizzle_orm_1.relations)(migrations_1.migrations, ({ one }) => ({
    migrationGroup: one(migrationGroups_1.migrationGroups, {
        fields: [migrations_1.migrations.migrationGroupId],
        references: [migrationGroups_1.migrationGroups.id],
    }),
}));
/**
 * Migration group relations.
 * Defines one-to-many relationships from migration groups to migrations.
 */
exports.migrationGroupsRelations = (0, drizzle_orm_1.relations)(migrationGroups_1.migrationGroups, ({ many }) => ({
    migrations: many(migrations_1.migrations),
}));
