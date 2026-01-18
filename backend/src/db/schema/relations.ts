import { relations } from 'drizzle-orm';
import { users } from './users';
import { accounts } from './accounts';
import { transactions } from './transactions';
import { categories } from './categories';
import { subcategories } from './subcategories';
import { creditCards } from './creditCards';
import { tags } from './tags';
import { transactionTags } from './transactionTags';
import { logs } from './logs';
import { tokens } from './tokens';

export const usersRelations = relations(users, ({ many }) => ({
    logs: many(logs),
    tokens: many(tokens),
    accounts: many(accounts),
    creditCards: many(creditCards),
    categories: many(categories),
    tags: many(tags),
}));

export const tagsRelations = relations(tags, ({ one, many }) => ({
    user: one(users, {
        fields: [tags.userId],
        references: [users.id],
    }),
    transactionTags: many(transactionTags),
}));

export const transactionTagsRelations = relations(transactionTags, ({ one }) => ({
    transaction: one(transactions, {
        fields: [transactionTags.transactionId],
        references: [transactions.id],
    }),
    tag: one(tags, {
        fields: [transactionTags.tagId],
        references: [tags.id],
    }),
}));

export const logsRelations = relations(logs, ({ one }) => ({
    user: one(users, {
        fields: [logs.userId],
        references: [users.id],
    }),
}));

export const tokensRelations = relations(tokens, ({ one }) => ({
    user: one(users, {
        fields: [tokens.userId],
        references: [users.id],
    }),
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
export const transactionsRelations = relations(transactions, ({ one, many }) => ({
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
    transactionTags: many(transactionTags),
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




