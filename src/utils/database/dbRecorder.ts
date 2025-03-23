import db from "../database";
import { createLog } from "../commons";
import { Operation, LogCategory, LogType } from "../enum";

/**
 * @summary Records all schema changes for a table and stores them under a grouped migration.
 *
 * @param tableName The name of the modified table.
 * @param changes Added, updated, and removed columns for this table.
 */
export async function dbRecorder(
    tableName: string,
    changes: { added: string[]; updated: string[]; removed: string[] }
) {
    if (changes.added.length === 0 && changes.updated.length === 0 && changes.removed.length === 0) {
        createLog(LogType.DEBUG, Operation.SEARCH, LogCategory.DATABASE, `No changes needed for table '${tableName}'.`);
        return;
    }

    createLog(
        LogType.SUCCESS,
        Operation.UPDATE,
        LogCategory.DATABASE,
        {
            table: tableName,
            action: Operation.UPDATE,
            changes,
        }
    );

    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, "");
    const groupName = `group--${tableName}--${timestamp}`;
    const upQueries: string[] = [];
    const downQueries: string[] = [];

    const [result]: any = await db.query(
        `INSERT INTO migration_group (name, up, down) VALUES (?, ?, ?)`,
        [groupName, "", ""]
    );
    const migrationGroupId = result.insertId;

    for (const columnName of changes.added) {
        const migrationName = `${tableName}--${Operation.CREATE}-${columnName}-${timestamp}`;
        const columnDefinition = "TEXT DEFAULT NULL";

        const upQuery = JSON.stringify({ query: `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition}` });
        const downQuery = JSON.stringify({ query: `ALTER TABLE ${tableName} DROP COLUMN ${columnName}` });
        upQueries.push(upQuery);
        downQueries.unshift(downQuery);

        await db.query(
            `INSERT INTO migration (name, tableName, columnName, operation, up, down, migrationGroup_id)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                migrationName,
                tableName,
                columnName,
                Operation.CREATE,
                upQuery,
                downQuery,
                migrationGroupId
            ]
        );

        createLog(
            LogType.SUCCESS,
            Operation.CREATE,
            LogCategory.MIGRATION,
            `Migration ${migrationName} saved to database.`
        );
    }

    for (const columnName of changes.removed) {
        const migrationName = `${tableName}--${Operation.DELETE}--${columnName}--${timestamp}`;

        const upQuery = JSON.stringify({ query: `ALTER TABLE ${tableName} DROP COLUMN ${columnName}` });
        const downQuery = JSON.stringify({ query: `ALTER TABLE ${tableName} ADD COLUMN ${columnName} VARCHAR(255) DEFAULT NULL` });
        upQueries.push(upQuery);
        downQueries.unshift(downQuery);

        await db.query(
            `INSERT INTO migration (name, tableName, columnName, operation, up, down, migrationGroup_id)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [migrationName, tableName, columnName, Operation.DELETE, upQuery, downQuery, migrationGroupId]
        );

        createLog(
            LogType.SUCCESS,
            Operation.DELETE,
            LogCategory.MIGRATION,
            `Migration ${migrationName} saved to database.`
        );
    }

    const up = JSON.stringify({ queries: upQueries.map(q => JSON.parse(q).query) });
    const down = JSON.stringify({ queries: downQueries.map(q => JSON.parse(q).query) });

    await db.query(
        `UPDATE migration_group SET up = ?, down = ? WHERE id = ?`,
        [up, down, migrationGroupId]
    );

    createLog(
        LogType.SUCCESS,
        Operation.CREATE,
        LogCategory.MIGRATION,
        `Migration group '${groupName}' saved with ${upQueries.length} operations.`
    );
}
