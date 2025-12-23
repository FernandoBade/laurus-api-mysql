import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import dotenv from 'dotenv';
import * as schema from './schema';

dotenv.config();

/**
 * Creates and exports a MySQL connection pool using environment variables.
 * Manages connection pooling for performance and scalability.
 */
const pool = mysql.createPool({
    host: process.env.DB_HOST ?? process.env.DB_URL,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE ?? process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

/**
 * Drizzle database instance with schema types.
 * Provides type-safe database access using Drizzle ORM.
 */
export const db = drizzle(pool, { mode: 'default', schema });

/**
 * Executes a function within a database transaction.
 * Automatically commits on success or rolls back on error.
 *
 * @summary Executes operations within a database transaction.
 * @param callback - Function to execute within the transaction.
 * @returns The result of the callback function.
 * @throws Re-throws any error that occurs during transaction execution.
 */
export async function withTransaction<T>(
    callback: (tx: typeof db) => Promise<T>
): Promise<T> {
    // The Drizzle transaction callback provides a transaction object (tx),
    // which is not the same as the full db instance (missing . $client, etc).
    // We need to cast tx to the db type but also supply a fake $client, though
    // it's only required for type compatibility in callbacks that expect db.

    // If your code relies on db.$client or anything else not present on tx,
    // you'll need to provide a more advanced adapter here.
    // For now, we cast tx to type 'typeof db' to suppress type errors.
    return await db.transaction(async (tx: any) => {
        return await callback(tx as typeof db);
    });
}



export default db;

