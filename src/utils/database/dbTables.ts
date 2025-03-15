import { createLog } from "../commons";
import db from "../database";
import { ColumnType, LogType, LogOperation, LogCategory } from "../enum";

/**
 * Synchronizes table structure based on the model definition.
 *
 * @param Model The model whose table structure needs to be synchronized.
 */
export async function syncTable(Model: any) {
    const tableName = Model.tableName.toLowerCase();
    const columns: any[] = Reflect.getMetadata("columns", Model) || [];

    ensureIdColumn(columns);
    createLog(LogType.DEBUG, LogOperation.SEARCH, LogCategory.DATABASE, `Checking table: ${tableName}`);

    const [existingTable]: any[] = await db.query(`SHOW TABLES LIKE ?`, [tableName]);

    if (!existingTable.length) {
        await createNewTable(tableName, columns);
    } else {
        await updateExistingTable(tableName, columns);
    }
}

/**
 * Ensures that the 'id' column is present in the column definitions.
 *
 * @param columns The column definitions for the table.
 */
function ensureIdColumn(columns: any[]) {
    if (!columns.some((col: any) => col.name === "id")) {
        columns.unshift({ name: "id", type: ColumnType.INTEGER });
    }
}

/**
 * Creates a new table in the database based on the provided column definitions.
 *
 * @param tableName The name of the table to create.
 * @param columns The column definitions for the new table.
 */
async function createNewTable(tableName: string, columns: any[]) {
    const columnDefinitions = columns.map(generateColumnDefinition).join(", ");

    await db.query(`CREATE TABLE ${tableName} (${columnDefinitions})`);

    createLog(LogType.SUCCESS, LogOperation.CREATE, LogCategory.DATABASE, { table: tableName });
}

/**
 * Generates the SQL definition for a column based on its properties.
 *
 * @param col The column definition object.
 * @returns The SQL definition string for the column.
 */
function generateColumnDefinition(col: any) {
    if (col.name === "id") return "id INT AUTO_INCREMENT PRIMARY KEY";

    const colType = resolveColumnType(col);
    const defaultClause = resolveDefaultClause(col);

    return `${col.name} ${colType}${defaultClause}`;
}

/**
 * Updates an existing table in the database based on the provided column definitions.
 *
 * @param tableName The name of the table to update.
 * @param columns The column definitions to update in the table.
 */
async function updateExistingTable(tableName: string, columns: any[]) {
    const [existingColumns]: any[] = await db.query(`SHOW COLUMNS FROM ${tableName}`);
    const existingColumnMap = existingColumns.reduce((map: any, col: any) => {
        map[col.Field] = col;
        return map;
    }, {});

    let changes: { added: string[], updated: string[] } = { added: [], updated: [] };

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

    logChanges(tableName, changes);
}

/**
 * Applies indexes and constraints to a column in the specified table.
 *
 * @param tableName The name of the table.
 * @param column The column definition object.
 */
async function applyIndexesAndConstraints(tableName: string, column: any) {
    if (column.unique) {
        await db.query(`ALTER TABLE ${tableName} ADD UNIQUE(${column.name})`).catch(() => { });
    } else if (column.index) {
        await db.query(`CREATE INDEX idx_${column.name} ON ${tableName}(${column.name})`).catch(() => { });
    }
}

/**
 * Adds a new column to an existing table in the database.
 *
 * @param tableName The name of the table.
 * @param column The column definition object.
 */
async function addNewColumn(tableName: string, column: any) {
    const colType = resolveColumnType(column);
    const defaultClause = resolveDefaultClause(column);

    await db.query(`ALTER TABLE ${tableName} ADD COLUMN ${column.name} ${colType}${defaultClause}`);
}

/**
 * Checks and updates a column in an existing table if necessary.
 *
 * @param tableName The name of the table.
 * @param column The column definition object.
 * @param existingColumn The existing column definition from the database.
 * @returns A boolean indicating whether the column was updated.
 */
async function checkAndUpdateColumn(tableName: string, column: any, existingColumn: any) {
    const colType = resolveColumnType(column);
    const defaultClause = resolveDefaultClause(column);

    const enumNeedsUpdate = column.type === ColumnType.ENUM && !enumsMatch(existingColumn, column);
    const defaultNeedsUpdate = !defaultsMatch(existingColumn, column);

    if (enumNeedsUpdate || defaultNeedsUpdate) {
        await db.query(`ALTER TABLE ${tableName} MODIFY COLUMN ${column.name} ${colType}${defaultClause}`);
        return true;
    }

    return false;
}

/**
 * Checks if the ENUM values of a column match the existing ENUM values in the database.
 *
 * @param existingColumn The existing column definition from the database.
 * @param column The column definition object.
 * @returns A boolean indicating whether the ENUM values match.
 */
function enumsMatch(existingColumn: any, column: any) {
    const currentEnum = existingColumn.Type.replace(/^enum\((.*)\)$/i, '$1').split(",").map((v: string) => v.trim().replace(/'/g, ""));
    const intendedEnum = column.enumValues;

    return currentEnum.length === intendedEnum.length && currentEnum.every((v: string) => intendedEnum.includes(v));
}

/**
 * Checks if the default values of a column match the existing default values in the database.
 *
 * @param existingColumn The existing column definition from the database.
 * @param column The column definition object.
 * @returns A boolean indicating whether the default values match.
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
 * Resolves the SQL type definition for a column based on its properties.
 *
 * @param col The column definition object.
 * @returns The SQL type definition string for the column.
 */
function resolveColumnType(col: any) {
    return col.type === ColumnType.ENUM
        ? `ENUM(${col.enumValues.map((v: string) => `'${v}'`).join(",")})`
        : col.type;
}

/**
 * Resolves the SQL default clause for a column based on its properties.
 *
 * @param col The column definition object.
 * @returns The SQL default clause string for the column.
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

/**
 * Logs the changes made to a table during the update process.
 *
 * @param tableName The name of the table.
 * @param changes An object containing the added and updated columns.
 */
function logChanges(tableName: string, changes: { added: string[], updated: string[] }) {
    if (changes.added.length > 0 || changes.updated.length > 0) {
        createLog(LogType.SUCCESS, LogOperation.UPDATE, LogCategory.DATABASE, {
            table: tableName,
            action: "table_updated",
            changes
        });
    } else {
        createLog(LogType.DEBUG, LogOperation.SEARCH, LogCategory.DATABASE, `No changes needed for table '${tableName}'.`);
    }
}