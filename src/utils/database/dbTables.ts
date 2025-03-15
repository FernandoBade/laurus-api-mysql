import { createLog } from "../commons";
import db from "../database";
import { ColumnType, LogType, LogOperation, LogCategory } from "../enum";

/**
 * Creates or adjusts the table structure based on the model definition.
 *
 * @param Model - The model whose table needs to be synchronized.
 */
export async function syncTable(Model: any) {
    const tableName = Model.tableName.toLowerCase();
    let columns: any[] = Reflect.getMetadata("columns", Model) || [];

    if (!columns.some((col: any) => col.name === "id")) {
        columns.unshift({ name: "id", type: ColumnType.INTEGER });
    }

    createLog(
        LogType.DEBUG,
        LogOperation.SEARCH,
        LogCategory.DATABASE,
        `Checking table: ${tableName}`
    );

    const [existingTable]: any[] = await db.query(`SHOW TABLES LIKE ?`, [tableName]);

    if (!existingTable.length) {
        const columnDefinitions = columns.map((col: any) => {
            if (col.name === "id") return "id INT AUTO_INCREMENT PRIMARY KEY";

            let columnType = col.type;
            if (col.type === ColumnType.ENUM && col.enumValues) {
                columnType = `ENUM(${col.enumValues.map((val: string) => `'${val}'`).join(",")})`;
            }

            const defaultClause = col.defaultValue === 'CURRENT_TIMESTAMP'
                ? col.onUpdate
                    ? ' DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
                    : ' DEFAULT CURRENT_TIMESTAMP'
                : col.defaultValue !== undefined && col.defaultValue !== null
                    ? col.type === ColumnType.BOOLEAN
                        ? ` DEFAULT ${col.defaultValue ? 1 : 0}`
                        : ` DEFAULT '${col.defaultValue}'`
                    : ' DEFAULT NULL';

            return `${col.name} ${columnType}${defaultClause}`;
        }).join(", ");

        await db.query(`CREATE TABLE ${tableName} (${columnDefinitions})`);

        createLog(
            LogType.SUCCESS,
            LogOperation.CREATE,
            LogCategory.DATABASE,
            { table: tableName }
        );

    } else {
        const [existingColumns]: any[] = await db.query(`SHOW COLUMNS FROM ${tableName}`);
        const existingColumnMap = existingColumns.reduce((map: any, col: any) => {
            map[col.Field] = col;
            return map;
        }, {});

        let changes: { added: string[], updated: string[] } = { added: [], updated: [] };

        for (const column of columns) {
            if (column.name === "id") continue;

            if (column.unique) {
                await db.query(`ALTER TABLE ${tableName} ADD UNIQUE(${column.name})`);
            } else if (column.index) {
                await db.query(`CREATE INDEX idx_${column.name} ON ${tableName}(${column.name})`);
            }

            const existingColumn = existingColumnMap[column.name];

            if (!existingColumn) {
                let columnType = column.type;
                if (column.type === ColumnType.ENUM && column.enumValues) {
                    columnType = `ENUM(${column.enumValues.map((val: string) => `'${val}'`).join(",")})`;
                }

                const defaultClause = column.defaultValue === 'CURRENT_TIMESTAMP'
                    ? column.onUpdate
                        ? ' DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
                        : ' DEFAULT CURRENT_TIMESTAMP'
                    : column.defaultValue !== undefined && column.defaultValue !== null
                        ? column.type === ColumnType.BOOLEAN
                            ? ` DEFAULT ${column.defaultValue ? 1 : 0}`
                            : ` DEFAULT '${column.defaultValue}'`
                        : ' DEFAULT NULL';

                await db.query(`ALTER TABLE ${tableName} ADD COLUMN ${column.name} ${columnType}${defaultClause}`);
                changes.added.push(column.name);
            } else {
                const existingColumn = existingColumnMap[column.name];

                const existingDefault = existingColumn.Default === null ? null : existingColumn.Default;
                const intendedDefault = column.defaultValue !== undefined && column.defaultValue !== null
                    ? column.defaultValue === 'CURRENT_TIMESTAMP'
                        ? 'CURRENT_TIMESTAMP'
                        : column.type === ColumnType.BOOLEAN
                            ? (column.defaultValue ? '1' : '0')
                            : column.defaultValue.toString()
                    : null;

                if (existingDefault !== intendedDefault) {
                    let columnType = column.type;
                    if (column.type === ColumnType.ENUM && column.enumValues) {
                        columnType = `ENUM(${column.enumValues.map((val: string) => `'${val}'`).join(",")})`;
                    }

                    const defaultClause = column.defaultValue === 'CURRENT_TIMESTAMP'
                        ? column.onUpdate
                            ? ' DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
                            : ' DEFAULT CURRENT_TIMESTAMP'
                        : column.defaultValue !== undefined && column.defaultValue !== null
                            ? column.type === ColumnType.BOOLEAN
                                ? ` DEFAULT ${column.defaultValue ? 1 : 0}`
                                : ` DEFAULT '${column.defaultValue}'`
                            : ' DEFAULT NULL';

                    await db.query(`ALTER TABLE ${tableName} MODIFY COLUMN ${column.name} ${columnType}${defaultClause}`);
                    changes.updated.push(column.name);
                }
            }
        }

        if (changes.added.length > 0 || changes.updated.length > 0) {
            createLog(LogType.SUCCESS, LogOperation.UPDATE, LogCategory.DATABASE, {
                table: tableName,
                action: "table_updated",
                changes
            });
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
