import db from "./dbConnection";
import fs from "fs";
import path from "path";
import { LogType, LogOperation, LogCategory } from "../enum";
import { createLog, formatError } from "../commons";

/**
 * Retrieves all model files from the 'model' directory, excluding `baseModel.ts` and schema files.
 *
 * @param {string} dir - Directory path where models are located.
 * @returns {any[]} - Array of imported model classes.
 */
function getModels(dir = path.resolve(__dirname, "../../model")) {
    if (!fs.existsSync(dir)) {
        createLog(
            LogType.ERROR,
            LogOperation.SEARCH,
            LogCategory.DATABASE,
            { message: `Directory '${dir}' not found.` }
        );
        return [];
    }

    let models: any[] = [];

    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            models = models.concat(getModels(fullPath));
        } else if (
            file.endsWith(".ts") &&
            file !== "baseModel.ts" &&
            !file.toLowerCase().includes("schema")
        ) {
            createLog(
                LogType.DEBUG,
                LogOperation.SEARCH,
                LogCategory.DATABASE,
                `Loading model: ${file}`
            );
            models.push(require(fullPath).default);
        }
    }

    return models;
}

/**
 * Synchronizes the database by ensuring tables and columns match the model definitions.
 *
 * - Creates tables if they do not exist.
 * - Adds missing columns to existing tables.
 * - Removes extra columns that are no longer defined in the models.
 *
 * @returns {Promise<void>}
 */
async function syncDatabase() {
    createLog(
        LogType.DEBUG,
        LogOperation.UPDATE,
        LogCategory.DATABASE,
        "Starting database synchronization..."
    );

    const models = getModels();

    for (const Model of models) {
        const tableName = (Model as any).tableName.toLowerCase();
        const columns = (Model as any).columns || [];

        if (!tableName) continue;

        createLog(
            LogType.DEBUG,
            LogOperation.SEARCH,
            LogCategory.DATABASE,
            `Checking table: ${tableName}`
        );

        const [tableExists]: any[] = await db.query(`SHOW TABLES LIKE '${tableName}'`);

        if (Array.isArray(tableExists) && tableExists.length === 0) {
            createLog(
                LogType.ALERT,
                LogOperation.CREATION,
                LogCategory.DATABASE,
                { message: `Table '${tableName}' does not exist. Creating now...` }
            );

            const filteredColumns = columns.filter((col: string) => col !== "id");
            const columnDefinitions = filteredColumns.map((col: string) => `${col} VARCHAR(255)`).join(", ");
            const createTableSQL = `CREATE TABLE ${tableName} (id INT AUTO_INCREMENT PRIMARY KEY, ${columnDefinitions})`;

            await db.query(createTableSQL);

            createLog(
                LogType.SUCCESS,
                LogOperation.CREATION,
                LogCategory.DATABASE,
                {
                    table: tableName,
                    action: "table_created",
                    columns: columns
                }
            );
        } else {
            createLog(
                LogType.DEBUG,
                LogOperation.SEARCH,
                LogCategory.DATABASE,
                `Table '${tableName}' found. Checking structure...`
            );

            const [existingColumns]: any[] = await db.query(`SHOW COLUMNS FROM ${tableName}`);
            const existingColumnNames = existingColumns.map((col: any) => col.Field);

            let changes: { added?: string[]; removed?: string[] } = { added: [], removed: [] };

            for (const column of columns) {
                if (!existingColumnNames.includes(column)) {
                    createLog(
                        LogType.DEBUG,
                        LogOperation.UPDATE,
                        LogCategory.DATABASE,
                        `Column '${column}' is missing in table '${tableName}'. Adding it...`
                    );
                    await db.query(`ALTER TABLE ${tableName} ADD COLUMN ${column} VARCHAR(255)`);
                    changes.added!.push(column);
                }
            }

            for (const column of existingColumnNames) {
                if (!columns.includes(column)) {
                    createLog(
                        LogType.DEBUG,
                        LogOperation.UPDATE,
                        LogCategory.DATABASE,
                        `Column '${column}' no longer exists in the model. Removing...`
                    );
                    await db.query(`ALTER TABLE ${tableName} DROP COLUMN ${column}`);
                    changes.removed!.push(column);
                }
            }

            if (changes.added!.length > 0 || changes.removed!.length > 0) {
                createLog(
                    LogType.SUCCESS,
                    LogOperation.UPDATE,
                    LogCategory.DATABASE,
                    {
                        table: tableName,
                        action: "table_updated",
                        changes: changes
                    }
                );
            } else {
                createLog(
                    LogType.DEBUG,
                    LogOperation.SEARCH,
                    LogCategory.DATABASE,
                    `No changes needed for table '${tableName}'. Structure is up to date.`
                );
            }
        }
    }

}

/**
 * Runs the database synchronization process manually.
 *
 * - If successful, logs completion and exits with code 0.
 * - If an error occurs, logs the error and exits with code 1.
 */
async function runSync() {
    try {
        await syncDatabase();
        createLog(
            LogType.DEBUG,
            LogOperation.UPDATE,
            LogCategory.DATABASE,
            "Database synchronization completed successfully."
        );
        process.exit(0);
    } catch (error) {
        createLog(
            LogType.ERROR,
            LogOperation.UPDATE,
            LogCategory.DATABASE,
            formatError(error)
        );
        process.exit(1);
    }
}

runSync();