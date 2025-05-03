import { createLog } from "../../commons";
import db from "../connections/dbConnection";
import { ColumnType, LogType, LogOperation, LogCategory } from "../../enum";
import { dbRecorder } from "../migrations/dbRecorder";

/**
 * Synchronizes table structure based on the model definition.
 *
 * @param Model The model whose table structure needs to be synchronized.
 */
export async function syncTable(Model: any) {
    const tableName = Model.tableName.toLowerCase();
    const columns: any[] = Reflect.getMetadata("columns", Model) || [];

    ensureIdColumn(columns);
    createLog(LogType.DEBUG, LogOperation.SEARCH, LogCategory.DATABASE, `Checking table: '${tableName}'`);

    const [existingTable]: any[] = await db.query(`SHOW TABLES LIKE ?`, [tableName]);

    if (!existingTable.length) {
        await createNewTable(tableName, columns);
    } else {
        await updateExistingTable(tableName, columns);
    }
}

/**
 * Ensures the 'id' column exists in the model.
 *
 * @param columns The column definitions from the model.
 */
function ensureIdColumn(columns: any[]) {
    if (!columns.some((col: any) => col.name === "id")) {
        columns.unshift({ name: "id", type: ColumnType.INTEGER });
    }
}

/**
 * Creates a new table with the given columns.
 *
 * @param tableName The name of the table.
 * @param columns The columns to create.
 */
async function createNewTable(tableName: string, columns: any[]) {
    const columnDefinitions = columns.map(generateColumnDefinition).join(", ");
    await db.query(`CREATE TABLE ${tableName} (${columnDefinitions})`);
    createLog(LogType.SUCCESS, LogOperation.CREATE, LogCategory.DATABASE, { table: tableName });
}

/**
 * Generates the SQL definition for a column.
 *
 * @param col Column metadata.
 * @returns SQL string for column creation.
 */
function generateColumnDefinition(col: any) {
    if (col.name === "id") return "id INT AUTO_INCREMENT PRIMARY KEY";
    const colType = resolveColumnType(col);
    const defaultClause = resolveDefaultClause(col);
    return `${col.name} ${colType}${defaultClause}`;
}

/**
 * Updates an existing table to match the current model definition.
 *
 * @param tableName The table to update.
 * @param columns The columns from the model.
 */
async function updateExistingTable(tableName: string, columns: any[]) {
    const [existingColumns]: any[] = await db.query(`SHOW COLUMNS FROM ${tableName}`);
    const existingColumnMap = existingColumns.reduce((map: any, col: any) => {
        map[col.Field] = col;
        return map;
    }, {});

    const columnNamesInModel = columns.map(col => col.name);

    const [foreignKeyColumns]: any[] = await db.query(`
        SELECT COLUMN_NAME FROM information_schema.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND REFERENCED_COLUMN_NAME IS NOT NULL
    `, [tableName]);
    const fkColumnNames = foreignKeyColumns.map((fk: any) => fk.COLUMN_NAME);

    let changes: { added: string[], updated: string[], removed: string[] } = { added: [], updated: [], removed: [] };

    for (const column of columns) {
        if (column.name === "id") continue;
        await applyIndexesAndConstraints(tableName, column);
        const existingColumn = existingColumnMap[column.name];

        if (!existingColumn) {
            await addNewColumn(tableName, column);
            changes.added.push(column.name);
            continue;
        }

        const updated = await checkAndUpdateColumn(tableName, column, existingColumn);
        if (updated) changes.updated.push(column.name);
    }

    for (const existingColumnName of Object.keys(existingColumnMap)) {
        if (!columnNamesInModel.includes(existingColumnName) && existingColumnName !== "id" && !fkColumnNames.includes(existingColumnName)) {
            changes.removed.push(existingColumnName);
            await removeColumn(tableName, existingColumnName);
        }
    }

    await dbRecorder(tableName, changes);
}

/**
 * Removes a column from the table and logs the migration.
 *
 * @param tableName Table name.
 * @param columnName Column to be removed.
 */
async function removeColumn(tableName: string, columnName: string) {
    try {
        await db.query(`ALTER TABLE ${tableName} DROP COLUMN ${columnName}`);
    } catch (error) {
        createLog(
            LogType.ERROR,
            LogOperation.DELETE,
            LogCategory.DATABASE,
            {
                message: `Error removing column ${columnName} from ${tableName}: ${(error as Error).message}`
            }
        );
    }
}

/**
 * Applies constraints to the column (unique or index).
 *
 * @param tableName The table name.
 * @param column Column metadata.
 */
async function applyIndexesAndConstraints(tableName: string, column: any) {
    if (column.unique) {
        await db.query(`ALTER TABLE ${tableName} ADD UNIQUE(${column.name})`).catch(() => { });
    } else if (column.index) {
        await db.query(`CREATE INDEX idx_${column.name} ON ${tableName}(${column.name})`).catch(() => { });
    }
}

/**
 * Adds a column to an existing table.
 *
 * @param tableName The table name.
 * @param column Column metadata.
 */
async function addNewColumn(tableName: string, column: any) {
    const colType = resolveColumnType(column);
    const defaultClause = resolveDefaultClause(column);
    await db.query(`ALTER TABLE ${tableName} ADD COLUMN ${column.name} ${colType}${defaultClause}`);
}

/**
 * Updates column definition if it differs from the model.
 *
 * @param tableName Table name.
 * @param column Column metadata.
 * @param existingColumn Column info from DB.
 * @returns Whether an update was performed.
 */
async function checkAndUpdateColumn(tableName: string, column: any, existingColumn: any) {
    const colType = resolveColumnType(column);
    const defaultClause = resolveDefaultClause(column);

    const enumNeedsUpdate = column.type === ColumnType.ENUM && !enumsMatch(existingColumn, column);
    const defaultNeedsUpdate = !defaultsMatch(existingColumn, column);

    const onUpdateNeedsUpdate = column.onUpdate && !existingColumn.Extra.includes("on update CURRENT_TIMESTAMP");

    if (enumNeedsUpdate || defaultNeedsUpdate || onUpdateNeedsUpdate) {
        await db.query(`ALTER TABLE ${tableName} MODIFY COLUMN ${column.name} ${colType}${defaultClause}`);
        return true;
    }

    return false;
}

/**
 * Compares enum values to determine if an update is required.
 *
 * @param existingColumn Column from DB.
 * @param column Column from model.
 * @returns Whether enums match.
 */
function enumsMatch(existingColumn: any, column: any) {
    const currentEnum = existingColumn.Type.replace(/^enum\((.*)\)$/i, '$1').split(",").map((v: string) => v.trim().replace(/'/g, ""));
    const intendedEnum = column.enumValues;
    return currentEnum.length === intendedEnum.length && currentEnum.every((v: string) => intendedEnum.includes(v));
}

/**
 * Compares default values.
 *
 * @param existingColumn Column from DB.
 * @param column Column from model.
 * @returns Whether default values match.
 */
function defaultsMatch(existingColumn: any, column: any) {
    let existingDefault = existingColumn.Default ?? 'NULL';
    existingDefault = existingDefault === null ? 'NULL' : existingDefault.toUpperCase();

    let intendedDefault: string;
    if (column.defaultValue === 'CURRENT_TIMESTAMP') {
        intendedDefault = 'CURRENT_TIMESTAMP';
    } else if (column.defaultValue === null || column.defaultValue === undefined) {
        intendedDefault = 'NULL';
    } else if (column.type === ColumnType.BOOLEAN) {
        intendedDefault = column.defaultValue ? '1' : '0';
    } else {
        intendedDefault = column.defaultValue.toString().toUpperCase();
    }

    return existingDefault === intendedDefault ||
        (existingDefault.includes('CURRENT_TIMESTAMP') && intendedDefault === 'CURRENT_TIMESTAMP');
}

/**
 * Converts column type into SQL representation.
 *
 * @param col Column metadata.
 * @returns SQL type string.
 */
function resolveColumnType(col: any) {
    return col.type === ColumnType.ENUM
        ? `ENUM(${col.enumValues.map((v: string) => `'${v}'`).join(",")})`
        : col.type;
}

/**
 * Returns SQL default clause string.
 *
 * @param col Column metadata.
 * @returns SQL string for default value.
 */
function resolveDefaultClause(col: any) {
    return col.defaultValue === 'CURRENT_TIMESTAMP'
        ? col.onUpdate
            ? ' DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
            : ' DEFAULT CURRENT_TIMESTAMP'
        : col.defaultValue !== undefined && col.defaultValue !== null
            ? col.type === ColumnType.BOOLEAN
                ? ` DEFAULT ${col.defaultValue ? 1 : 0}`
                : ` DEFAULT '${col.defaultValue}'`
            : ' DEFAULT NULL';
}