import db from "../database";
import { LogType, Operation, LogCategory } from "../enum";
import { createLog } from "../commons";

/**
 * @summary Saves a migration entry for a column addition or removal.
 *
 * @param tableName The table where the change occurred.
 * @param columnName The name of the column changed.
 * @param operation The type of change (CREATE or DELETE).
 * @param up SQL to apply the change.
 * @param down SQL to revert the change.
 */
export async function saveMigration(
    tableName: string,
    columnName: string,
    operation: Operation.CREATE | Operation.DELETE,
    up: string,
    down: string,
    migrationGroupId?: number
) {
    const timestamp = new Date().toISOString().replace('T', '-').slice(0, 19);
    const migrationName = operation === Operation.CREATE
        ? `${tableName}--creation-${columnName}-${timestamp}`
        : `${tableName}--deletion--${columnName}--${timestamp}`;

    const upQuery = JSON.stringify({ query: up });
    const downQuery = JSON.stringify({ query: down });

    try {
        await db.query(`
                INSERT INTO migration (name, tableName, columnName, operation, up, down, migrationGroup_id)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
            migrationName,
            tableName,
            columnName,
            operation,
            upQuery,
            downQuery,
            migrationGroupId ?? null
        ]);


        createLog(
            LogType.SUCCESS,
            operation,
            LogCategory.MIGRATION,
            `Migration ${migrationName} saved to database.`
        );
    } catch (error) {
        createLog(
            LogType.ERROR,
            operation,
            LogCategory.MIGRATION,
            {
                message: `Error saving migration for ${tableName}.${columnName}: ${(error as Error).message}`
            }
        );
    }
}

/**
 * @summary Creates a new migration group with batched up/down queries.
 *
 * @param name Group name (optional – will be generated if not provided)
 * @param upQueries Array of `up` SQL strings
 * @param downQueries Array of `down` SQL strings
 * @returns The ID of the created migration group
 */
export async function createMigrationGroup(upQueries: string[], downQueries: string[], name?: string): Promise<number> {
    const groupName = name ?? `group-${new Date().toISOString().replace(/[-:.TZ]/g, "")}`;

    const upQuery = JSON.stringify({ queries: upQueries });
    const downQuery = JSON.stringify({ queries: downQueries });

    const result = await db.query(`
        INSERT INTO migration_group (name, up, down)
        VALUES (?, ?, ?)
    `, [groupName, upQuery, downQuery]);

    const insertedId = (result as any).insertId;
    return insertedId;
}

/**
 * @summary Executes UP or DOWN migrations for a given group.
 * @param migrationGroupId ID of the group to execute.
 * @param operation Either Operation.APPLY or Operation.ROLLBACK
 */
export async function executeMigrationGroup(
    migrationGroupId: number,
    operation: Operation
) {
    try {
        if (operation !== Operation.APPLY && operation !== Operation.ROLLBACK) {
            createLog(
                LogType.ERROR,
                Operation.SEARCH,
                LogCategory.MIGRATION,
                `Invalid migration operation: ${operation}`);
            return;
        }

        const field = operation === Operation.APPLY ? "up" : "down";

        const [rows]: any = await db.query(
            `SELECT ${field} FROM migration_group WHERE id = ?`,
            [migrationGroupId]
        );

        if (!rows.length) {
            createLog(
                LogType.ERROR,
                Operation.SEARCH,
                LogCategory.MIGRATION,
                `Migration group ${migrationGroupId} not found.`
            );
            return;
        }

        const { queries } = JSON.parse(rows[0][field]);

        createLog(LogType.DEBUG, Operation.SEARCH, LogCategory.MIGRATION, {
            action: operation === Operation.APPLY ? "apply" : "rollback",
            group: migrationGroupId,
            steps: queries.length,
        });

        await db.query("START TRANSACTION");

        for (const query of queries) {
            await db.query(query);
        }

        await db.query("COMMIT");

        createLog(
            LogType.SUCCESS,
            operation === Operation.APPLY ? Operation.CREATE : Operation.DELETE,
            LogCategory.MIGRATION,
            `Migration group ${migrationGroupId} ${operation === Operation.APPLY ? "applied" : "rolled back"} successfully.`
        );
    } catch (error) {
        await db.query("ROLLBACK");
        createLog(
            LogType.ERROR,
            operation === Operation.APPLY ? Operation.CREATE : Operation.DELETE,
            LogCategory.MIGRATION,
            {
                message: `Migration group ${migrationGroupId} ${operation === Operation.APPLY ? "apply" : "rollback"} failed: ${(error as Error).message}`,
            }
        );
    }
}
