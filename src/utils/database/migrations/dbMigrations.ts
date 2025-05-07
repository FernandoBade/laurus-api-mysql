import db from "../connections/dbConnection";
import { LogType, LogOperation, LogCategory } from "../../enum";
import { createLog } from "../../commons";

/**
 * Registers a migration entry in the `migration` table for a column creation or deletion.
 *
 * @param tableName - Table name being modified.
 * @param columnName - Column being created or removed.
 * @param operation - Type of operation (CREATE or DELETE).
 * @param up - SQL to apply the change.
 * @param down - SQL to revert the change.
 * @param migrationGroupId - Optional group ID to associate the migration with.
 */
export async function saveMigration(
    tableName: string,
    columnName: string,
    operation: LogOperation.CREATE | LogOperation.DELETE,
    up: string,
    down: string,
    migrationGroupId?: number
) {
    const timestamp = new Date().toISOString().replace('T', '-').slice(0, 19);
    const migrationName = operation === LogOperation.CREATE
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
            {
                migrationName: migrationName,
            }
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
    operation: LogOperation
) {
    try {
        if (operation !== LogOperation.APPLY && operation !== LogOperation.ROLLBACK) {
            createLog(
                LogType.ERROR,
                LogOperation.SEARCH,
                LogCategory.MIGRATION,
                `Invalid migration operation: ${operation}`);
            return;
        }

        const field = operation === LogOperation.APPLY ? "up" : "down";

        const [rows]: any = await db.query(
            `SELECT ${field} FROM migration_group WHERE id = ?`,
            [migrationGroupId]
        );

        if (!rows.length) {
            createLog(
                LogType.ERROR,
                LogOperation.SEARCH,
                LogCategory.MIGRATION,
                {
                    action: "search",
                    group: migrationGroupId,
                    error: "Migration group not found"
                }
            );
            return;
        }

        const { queries } = JSON.parse(rows[0][field]);

        createLog(
            LogType.DEBUG,
            LogOperation.SEARCH,
            LogCategory.MIGRATION,
            {
                action: operation === LogOperation.APPLY ? "apply" : "rollback",
                group: migrationGroupId,
                steps: queries.length,
            }
        );

        await db.query("START TRANSACTION");

        for (const query of queries) {
            await db.query(query);
        }

        await db.query("COMMIT");

        createLog(
            LogType.SUCCESS,
            operation === LogOperation.APPLY ? LogOperation.CREATE : LogOperation.DELETE,
            LogCategory.MIGRATION_GROUP,
            {
                action: operation === LogOperation.APPLY ? "apply" : "rollback",
                group: migrationGroupId,
            }
        );
    } catch (error) {
        await db.query("ROLLBACK");
        createLog(
            LogType.ERROR,
            operation === LogOperation.APPLY ? LogOperation.CREATE : LogOperation.DELETE,
            LogCategory.MIGRATION_GROUP,
            {
                action: operation === LogOperation.APPLY ? "apply" : "rollback",
                group: migrationGroupId,
                error: (error as Error).message
            }
        );
    }
}
