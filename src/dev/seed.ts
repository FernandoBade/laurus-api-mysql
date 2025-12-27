import { seedConfig } from './seed.config';
import { createAccounts, createCategories, createCreditCards, createTags, createTransactions, createUser } from './generators';
import { SeedContext, SeedControllerError, SeedLogger, SeedRandom, parseUserCount, suppressNonSeedOutput } from './seed.utils';
import { db } from '../db';

type SeedTotals = {
    users: number;
    categories: number;
    subcategories: number;
    accounts: number;
    creditCards: number;
    tags: number;
    transactions: number;
};

/**
 * Development seed entrypoint.
 *
 * @summary Generates realistic dev data exclusively through controllers.
 *
 * Notes:
 * - Seed runs are additive and do not de-duplicate existing records.
 * - Expense values are stored as positive numbers and classified via TransactionType.
 * - Account balances are derived from transaction snapshots and updated during seed creation.
 * - createdAt/updatedAt are set by database defaults and are not user-controlled.
 */
export async function runSeed() {
    const restoreOutput = suppressNonSeedOutput();
    const logger = new SeedLogger();
    const userCount = parseUserCount(process.argv.slice(2), process.env);
    const seedValue = parseSeedValue(process.env.SEED_RANDOM);

    try {
        const context: SeedContext = {
            config: seedConfig,
            random: new SeedRandom(seedValue),
            logger,
            language: seedConfig.language,
            registry: { emails: new Set() },
        };

        const totals: SeedTotals = {
            users: 0,
            categories: 0,
            subcategories: 0,
            accounts: 0,
            creditCards: 0,
            tags: 0,
            transactions: 0,
        };

        logger.section('Seed started');
        logger.info(`Users requested: ${userCount}`);
        if (seedValue !== undefined) {
            logger.info(`Random seed: ${seedValue}`);
        }
        logger.info('Seed runs are additive and do not de-duplicate existing data.');
        logger.info('Expense amounts are stored as positive values with TransactionType.EXPENSE.');

        const endDate = new Date();
        const startDate = new Date();
        startDate.setFullYear(endDate.getFullYear() - context.config.dateRangeYears);

        for (let index = 0; index < userCount; index += 1) {
            const userNumber = index + 1;
            logger.section(`User ${userNumber}/${userCount}`);

            const user = await createUser(context, index);
            totals.users += 1;
            logger.info(`Created user ${user.firstName} ${user.lastName} (${user.email}).`);

            const categories = await createCategories(context, user.id);
            totals.categories += categories.length;
            totals.subcategories += categories.reduce((sum, seed) => sum + seed.subcategories.length, 0);
            logger.info(`Created ${categories.length} categories and ${categories.reduce((sum, seed) => sum + seed.subcategories.length, 0)} subcategories.`);

            const accounts = await createAccounts(context, user.id);
            totals.accounts += accounts.length;
            logger.info(`Created ${accounts.length} accounts.`);

            const creditCards = await createCreditCards(context, user.id, accounts);
            totals.creditCards += creditCards.length;
            logger.info(`Created ${creditCards.length} credit cards.`);

            const tags = await createTags(context, user.id);
            totals.tags += tags.length;
            logger.info(`Created ${tags.length} tags.`);

            const transactionSummary = await createTransactions(context, {
                userId: user.id,
                accounts,
                creditCards,
                categories,
                tags,
                startDate,
                endDate,
            });
            totals.transactions += transactionSummary.total;
            logger.info(`Created ${transactionSummary.total} transactions.`);
        }

        logger.section('Seed completed');
        logger.info(`Users: ${totals.users}`);
        logger.info(`Categories: ${totals.categories}`);
        logger.info(`Subcategories: ${totals.subcategories}`);
        logger.info(`Accounts: ${totals.accounts}`);
        logger.info(`Credit cards: ${totals.creditCards}`);
        logger.info(`Tags: ${totals.tags}`);
        logger.info(`Transactions: ${totals.transactions}`);
        logger.info(`Elapsed: ${logger.elapsedSeconds()}s`);
    } finally {
        await closeDatabaseConnection();
        restoreOutput();
    }
}

if (require.main === module) {
    runSeed().catch(error => {
        const message = formatSeedError(error);
        console.error(`[seed] ${message}`);
        process.exitCode = 1;
    });
}

/**
 * Parses an optional numeric seed for deterministic randomness.
 *
 * @summary Converts SEED_RANDOM into a usable numeric seed.
 */
function parseSeedValue(value: string | undefined): number | undefined {
    if (!value) return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
}

/**
 * Formats seed execution errors for display.
 *
 * @summary Builds a concise error message for seed failures.
 */
function formatSeedError(error: unknown): string {
    if (error instanceof SeedControllerError) {
        const status = error.statusCode ? ` (status ${error.statusCode})` : '';
        return `${error.message}${status}`;
    }

    if (error instanceof Error) {
        return error.message;
    }

    return String(error);
}

/**
 * Closes the database pool after seeding.
 *
 * @summary Ensures the seed process exits cleanly.
 */
async function closeDatabaseConnection(): Promise<void> {
    const client = (db as { $client?: { end?: () => Promise<void> | void } }).$client;
    if (client?.end) {
        await client.end();
    }
}
