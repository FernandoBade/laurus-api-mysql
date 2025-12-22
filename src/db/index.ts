export { db, withTransaction, default } from './client';
export * from './schema';

import 'dotenv/config';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import { db } from './index';

async function main() {
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Database migrated successfully');
    process.exit(0);
}

main().catch((err) => {
    console.error('Migration failed', err);
    process.exit(1);
});
