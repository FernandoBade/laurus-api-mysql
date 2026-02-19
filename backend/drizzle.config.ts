import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Drizzle Kit configuration for database migrations and schema management.
 * Configures connection to MySQL database using environment variables.
 */
export default {
    schema: './src/db/schema/index.ts',
    out: './drizzle',
    dialect: 'mysql',
    dbCredentials: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_DATABASE || 'zinero',
        port: Number(process.env.DB_PORT) || 3306,
    },
} satisfies Config;

