import { LogCategory, Operation, LogType } from './enum';
import { createLog } from './commons';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const db = mysql.createPool({
    host: process.env.DB_URL,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

export default db;

/**
 * Executes a secure SQL query.
 * @param query - The SQL query to execute.
 * @param parameters - The parameters to be used in the query (optional).
 * @returns The result of the query execution.
 */
export async function runQuery(query: string, parameters: any[] = []): Promise<any> {
    const connection = await db.getConnection();
    try {
        const [result] = await connection.execute(query, parameters);
        return result;
    } catch (error) {
        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

/**
 * Checks if a table exists in the database.
 * @param tableName - The name of the table to check.
 * @returns True if the table exists, false otherwise.
 */
async function checkTableExists(tableName: string): Promise<boolean> {
    const result: any = await runQuery(`SHOW TABLES LIKE '${tableName}'`);
    return result.length > 0;
}

/**
 * Updates table columns if necessary.
 * @param table - The name of the table to update.
 * @param columns - The columns to be updated or added.
 */
async function updateTable(table: string, columns: { name: string; definition: string }[]) {
    try {
        const currentColumns: any[] = await runQuery(`SHOW COLUMNS FROM ${table}`);
        const primaryKeys: any[] = await runQuery(`SHOW KEYS FROM ${table} WHERE Key_name = 'PRIMARY'`);
        const existingPrimaryKeys = new Set(primaryKeys.map(c => c.Column_name));

        let changes: any[] = [];

        for (const { name, definition } of columns) {
            const currentColumn = currentColumns.find(c => c.Field === name);

            if (!currentColumn) {
                await runQuery(`ALTER TABLE ${table} ADD COLUMN ${name} ${definition}`);
                changes.push({ column: name, action: "added" });
            } else {
                if (definition.includes("PRIMARY KEY") && existingPrimaryKeys.has(name)) {
                    continue;
                }

                const currentType = currentColumn.Type.toUpperCase()
                    .replace(/INT\(\d+\)/, "INT")
                    .replace("TINYINT", "BOOLEAN");

                const newType = definition.split(" ")[0].toUpperCase()
                    .replace(/INT\(\d+\)/, "INT")
                    .replace("BOOLEAN", "BOOLEAN");

                if (currentType !== newType) {
                    await runQuery(`ALTER TABLE ${table} MODIFY COLUMN ${name} ${definition}`);
                    changes.push({ column: name, action: "type changed", oldType: currentType, newType: newType });
                }

                const currentDefault = currentColumn.Default;
                const newDefault = definition.match(/DEFAULT\s+'(.+?)'/)?.[1];

                if (newDefault && currentDefault !== newDefault) {
                    await runQuery(`ALTER TABLE ${table} MODIFY COLUMN ${name} ${definition}`);
                    changes.push({ column: name, action: "default changed", oldDefault: currentDefault, newDefault: newDefault });
                }
            }
        }

        if (changes.length > 0) {
            await createLog(LogType.SUCCESS, Operation.UPDATE, LogCategory.DATABASE,
                { table, changes }, undefined);
        }
    } catch (error: any) {
        await createLog(LogType.ERROR, Operation.UPDATE, LogCategory.DATABASE,
            { table, error: error.message }, undefined);
        throw error;
    }
}

/**
 * Creates tables if they do not exist or updates existing ones.
 */
export async function createTables() {
    const tables = [
        {
            name: "User",
            columns: [
                { name: 'id', definition: 'INT AUTO_INCREMENT PRIMARY KEY' },
                { name: 'firstName', definition: 'VARCHAR(255) NOT NULL' },
                { name: 'lastName', definition: 'VARCHAR(255) NOT NULL' },
                { name: 'email', definition: 'VARCHAR(255) NOT NULL UNIQUE' },
                { name: 'phone', definition: 'VARCHAR(255)' },
                { name: 'password', definition: 'VARCHAR(255) NOT NULL' },
                { name: 'birthDate', definition: 'DATETIME' },
                { name: 'active', definition: 'BOOLEAN NOT NULL DEFAULT TRUE' },
                { name: 'createdAt', definition: 'DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP' },
                { name: 'theme', definition: `VARCHAR(255) NOT NULL DEFAULT 'dark'` },
                { name: 'language', definition: `VARCHAR(255) NOT NULL DEFAULT 'en-US'` },
                { name: 'currency', definition: `VARCHAR(255) NOT NULL DEFAULT 'BRL'` },
                { name: 'dateFormat', definition: `VARCHAR(255) NOT NULL DEFAULT 'MM/DD/YYYY'` },
            ]
        },
        {
            name: "Log",
            columns: [
                { name: 'id', definition: 'INT AUTO_INCREMENT PRIMARY KEY' },
                { name: 'type', definition: 'VARCHAR(255) NOT NULL' },
                { name: 'operation', definition: 'VARCHAR(255)' },
                { name: 'category', definition: 'VARCHAR(255)' },
                { name: 'detail', definition: 'TEXT NOT NULL' },
                { name: 'userId', definition: 'INT' },
                { name: 'timestamp', definition: 'DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP' },
            ]
        },
        {
            name: "Account",
            columns: [
                { name: 'id', definition: 'INT AUTO_INCREMENT PRIMARY KEY' },
                { name: 'name', definition: 'VARCHAR(255) NOT NULL' },
                { name: 'bank', definition: 'VARCHAR(255) NOT NULL' },
                { name: 'type', definition: 'VARCHAR(255) NOT NULL' },
                { name: 'userId', definition: 'INT NOT NULL' },
            ]
        }
    ];

    try {
        for (const table of tables) {
            if (await checkTableExists(table.name)) {
                await updateTable(table.name, table.columns);
            } else {
                const columnsSQL = table.columns.map(col => `${col.name} ${col.definition}`).join(',\n  ');
                const createTableQuery = `CREATE TABLE ${table.name} (\n  ${columnsSQL}\n);`;
                await runQuery(createTableQuery);
                await createLog(LogType.SUCCESS, Operation.CREATION, LogCategory.DATABASE, { table: table.name }, undefined);
            }
        }
    } catch (error) {
        await createLog(LogType.ERROR, Operation.UPDATE, LogCategory.DATABASE, JSON.stringify(error), undefined);
        throw error;
    }
}


// (async () => {
//     try {
//         await createTables();
//     } catch (erro) {
//     }
// })();