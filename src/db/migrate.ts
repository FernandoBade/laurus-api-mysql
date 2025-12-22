import 'dotenv/config';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import { db } from './client';

async function runMigrations() {
    try {
        await migrate(db, { migrationsFolder: './drizzle' });
        console.log('Database migrated successfully');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed', error);
        process.exit(1);
    }
}

runMigrations();
