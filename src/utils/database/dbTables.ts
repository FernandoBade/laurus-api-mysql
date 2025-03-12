import db from "./dbConnection";
import { createLog } from "../commons";
import { LogType, LogOperation, LogCategory } from "../enum";

/**
 * Creates or adjusts the table structure based on the model definition.
 *
 * @param model The model whose table needs to be synchronized.
 */
export async function syncTable(Model: any) {
    const tableName = Model.tableName.toLowerCase();
    let columns: string[] = Reflect.getMetadata("columns", Model) || [];

    if (!columns.includes("id")) {
        columns.unshift("id");
    }

    createLog(
        LogType.DEBUG,
        LogOperation.SEARCH,
        LogCategory.DATABASE,
        `Checking table: ${tableName
        }`);

    const [tableExists]: any[] = await db.query(
        `SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema = DATABASE() AND LOWER(TABLE_NAME) = ?`,
        [tableName.toLowerCase()]
    );

    const existingTable = tableExists?.[0]?.TABLE_NAME || null;

    if (!existingTable) {

        const columnDefinitions = columns.map((col: string) =>
            col === "id" ? "id INT AUTO_INCREMENT PRIMARY KEY" : `${col} VARCHAR(255)`
        ).join(", ");

        await db.query(`CREATE TABLE ${tableName} (${columnDefinitions})`);

        createLog(
            LogType.SUCCESS,
            LogOperation.CREATION,
            LogCategory.DATABASE,
            { table: tableName, action: "table_created", columns }
        );
    } else {

        const [existingColumns]: any[] = await db.query(`SHOW COLUMNS FROM ${tableName}`);
        const existingColumnNames = existingColumns.map((col: any) => col.Field);

        let changes: { added: string[], removed: string[] } = { added: [], removed: [] };

        for (const column of columns) {
            if (!existingColumnNames.includes(column)) {
                await db.query(`ALTER TABLE ${tableName} ADD COLUMN ${column} VARCHAR(255)`);
                changes.added.push(column);
            }
        }

        for (const column of existingColumnNames) {
            if (!columns.includes(column) && column !== "id") {
                const [foreignKeyExists]: any[] = await db.query(`
                    SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE
                    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
                    [tableName, column]
                );

                if (foreignKeyExists.length > 0) {
                    createLog(LogType.DEBUG, LogOperation.UPDATE, LogCategory.DATABASE,
                        `Skipping removal of column '${column}' in '${tableName}' as it's part of a foreign key.`);
                    continue;
                }

                await db.query(`ALTER TABLE ${tableName} DROP COLUMN ${column}`);
                changes.removed.push(column);
            }
        }

        if (changes.added.length > 0 || changes.removed.length > 0) {
            createLog(
                LogType.SUCCESS,
                LogOperation.UPDATE,
                LogCategory.DATABASE,
                { table: tableName, action: "table_updated", changes }
            );
        } else {
            createLog(
                LogType.DEBUG,
                LogOperation.SEARCH,
                LogCategory.DATABASE,
                `No changes needed for table '${tableName}'.`
            );
        }
    }
}