import "reflect-metadata";
import { getModels } from "./dbModels";
import { syncTable } from "./dbTables";
import { syncRelationships } from "./dbRelations";
import { createLog, formatError } from "../commons";
import { LogType, Operation, LogCategory } from "../enum";

/**
 * @summary Synchronizes the database structure to match model definitions.
 *
 * This function ensures that:
 * - Tables are created if they do not exist.
 * - Columns are added or removed as necessary.
 * - Foreign key relationships are established.
 * - Pending migrations are applied.
 */
async function syncDatabase() {
    createLog(
        LogType.DEBUG,
        Operation.UPDATE,
        LogCategory.DATABASE,
        "Starting database synchronization..."
    );

    const models = getModels();

    for (const Model of models) {
        if (!Model || !Model.tableName) {
            createLog(
                LogType.ERROR,
                Operation.UPDATE,
                LogCategory.DATABASE,
                {
                    message: `Invalid model detected: ${Model}`
                });
            continue;
        }

        await syncTable(Model);
    }


    for (const Model of models) {
        await syncRelationships(Model);
    }
}

/**
 * @summary Manually triggers the database synchronization process.
 *
 * Handles:
 * - Executing `syncDatabase` to ensure database consistency.
 * - Logging the completion status.
 * - Handling errors and terminating the process accordingly.
 */
async function runSync() {
    try {
        await syncDatabase();
        createLog(
            LogType.DEBUG,
            Operation.UPDATE,
            LogCategory.DATABASE,
            "Database synchronization completed successfully."
        );
        process.exit(0);
    } catch (error) {
        createLog(
            LogType.ERROR,
            Operation.UPDATE,
            LogCategory.DATABASE,
            formatError(error)
        );
        process.exit(1);
    }
}

runSync();
