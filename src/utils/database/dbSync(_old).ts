// import "reflect-metadata";
// import db from "./dbConnection";
// import fs from "fs";
// import path from "path";
// import { LogType, LogOperation, LogCategory } from "../enum";
// import { createLog, formatError } from "../commons";

// /**
//  * Retrieves all model files from the 'model' directory, excluding `baseModel.ts` and schema files.
//  *
//  * @param {string} dir - Directory path where models are located.
//  * @returns {any[]} - Array of imported model classes.
//  */
// function getModels(dir = path.resolve(__dirname, "../../model")) {
//     if (!fs.existsSync(dir)) {
//         createLog(LogType.ERROR, LogOperation.SEARCH, LogCategory.DATABASE, { message: `Directory '${dir}' not found.` });
//         return [];
//     }

//     let models: any[] = [];
//     const files = fs.readdirSync(dir);

//     for (const file of files) {
//         const fullPath = path.join(dir, file);
//         const stat = fs.statSync(fullPath);

//         if (stat.isDirectory()) {
//             models = models.concat(getModels(fullPath));
//         } else if (file.endsWith(".ts") && file !== "baseModel.ts" && !file.toLowerCase().includes("schema")) {
//             createLog(LogType.DEBUG, LogOperation.SEARCH, LogCategory.DATABASE, `Loading model: ${file}`);
//             models.push(require(fullPath).default);
//         }
//     }

//     return models;
// }


// /**
//  * Synchronizes the database, ensuring tables, columns, and relationships match the model definitions.
//  */
// async function syncDatabase() {
//     createLog(LogType.DEBUG, LogOperation.UPDATE, LogCategory.DATABASE, "Starting database synchronization...");
//     const models = getModels();
//     await new Promise(resolve => setTimeout(resolve, 100));

//     for (const Model of models) {
//         const tableName = (Model as any).tableName.toLowerCase();
//         let columns = Reflect.getMetadata("columns", Model) || [];
//         const relationships = Reflect.getMetadata("relationships", Model) || [];

//         if (!tableName) continue;
//         createLog(LogType.DEBUG, LogOperation.SEARCH, LogCategory.DATABASE, `Checking table: ${tableName}`);

//         const [tableExists]: any[] = await db.query(
//             `SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema = DATABASE() AND UPPER(TABLE_NAME) = ?`,
//             [tableName.toUpperCase()]
//         );

//         if (!columns.includes("id")) {
//             columns = ["id", ...columns];
//         }

//         if (!tableExists || tableExists.length === 0) {
//             createLog(LogType.ALERT, LogOperation.CREATION, LogCategory.DATABASE, { message: `Table '${tableName}' does not exist. Creating now...` });

//             if (columns.length === 0) {
//                 throw new Error(`Table '${tableName}' cannot be created without columns.`);
//             }

//             const columnDefinitions = columns.map((col: string) =>
//                 col === "id" ? "id INT AUTO_INCREMENT PRIMARY KEY" : `${col} VARCHAR(255)`
//             ).join(", ");

//             const createTableSQL = `CREATE TABLE ${tableName} (${columnDefinitions})`;
//             await db.query(createTableSQL);

//             createLog(LogType.SUCCESS, LogOperation.CREATION, LogCategory.DATABASE, { table: tableName, action: "table_created", columns: columns });
//         } else {
//             createLog(LogType.DEBUG, LogOperation.SEARCH, LogCategory.DATABASE, `Table '${tableName}' found. Checking structure...`);

//             const [existingColumns]: any[] = await db.query(`SHOW COLUMNS FROM ${tableName}`);
//             const existingColumnNames = existingColumns.map((col: any) => col.Field);

//             let changes: { added?: string[]; removed?: string[] } = { added: [], removed: [] };

//             // ✅ **Adicionar colunas ausentes**
//             for (const column of columns) {
//                 if (!existingColumnNames.includes(column)) {
//                     await db.query(`ALTER TABLE ${tableName} ADD COLUMN ${column} VARCHAR(255)`);
//                     changes.added!.push(column);
//                 }
//             }

//             // ✅ **Verificar se a coluna está no modelo antes de remover**
//             for (const column of existingColumnNames) {
//                 if (!columns.includes(column) && column !== "id") {
//                     // 🔹 **Evita remover colunas de Foreign Keys ativas**
//                     const [foreignKeyExists]: any[] = await db.query(`
//                         SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE
//                         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
//                         [tableName, column]
//                     );

//                     if (foreignKeyExists.length > 0) {
//                         createLog(LogType.DEBUG, LogOperation.UPDATE, LogCategory.DATABASE,
//                             `Skipping removal of column '${column}' in '${tableName}' as it's part of a foreign key.`);
//                         continue;
//                     }

//                     await db.query(`ALTER TABLE ${tableName} DROP COLUMN ${column}`);
//                     changes.removed!.push(column);
//                 }
//             }

//             if (changes.added!.length > 0 || changes.removed!.length > 0) {
//                 createLog(LogType.SUCCESS, LogOperation.UPDATE, LogCategory.DATABASE, { table: tableName, action: "table_updated", changes: changes });
//             } else {
//                 createLog(LogType.DEBUG, LogOperation.SEARCH, LogCategory.DATABASE, `No changes needed for table '${tableName}'. Structure is up to date.`);
//             }
//         }
//     }

//     for (const Model of models) {
//         const tableName = (Model as any).tableName.toLowerCase();
//         const relationships = Reflect.getMetadata("relationships", Model) || [];
//         const [existingColumns]: any[] = await db.query(`SHOW COLUMNS FROM ${tableName}`);
//         const existingColumnNames = existingColumns.map((col: any) => col.Field);

//         for (const relation of relationships) {
//             if (relation.type === "OneToMany") continue;

//             const targetModel = relation.target();
//             if (!targetModel || typeof targetModel !== "function") {
//                 createLog(LogType.ERROR, LogOperation.UPDATE, LogCategory.DATABASE, {
//                     message: `Invalid target function for relation '${relation.propertyKey}' in table '${tableName}'.`
//                 });
//                 continue;
//             }

//             const targetTable = (targetModel as any).tableName.toLowerCase();
//             const foreignKeyColumn = `${relation.propertyKey}_id`;

//             const [targetTableExists]: any[] = await db.query(
//                 `SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema = DATABASE() AND UPPER(TABLE_NAME) = ?`,
//                 [targetTable.toUpperCase()]
//             );

//             if (!targetTableExists || targetTableExists.length === 0) {
//                 createLog(LogType.ERROR, LogOperation.UPDATE, LogCategory.DATABASE, {
//                     message: `Cannot add foreign key to '${tableName}'. Table '${targetTable}' does not exist.`
//                 });
//                 continue;
//             }

//             if (!existingColumnNames.includes(foreignKeyColumn)) {
//                 await db.query(`ALTER TABLE ${tableName} ADD COLUMN ${foreignKeyColumn} INT`);
//                 await db.query(`ALTER TABLE ${tableName} ADD CONSTRAINT fk_${tableName}_${foreignKeyColumn} FOREIGN KEY (${foreignKeyColumn}) REFERENCES ${targetTable}(id) ON DELETE CASCADE`);

//                 createLog(LogType.SUCCESS, LogOperation.UPDATE, LogCategory.DATABASE, {
//                     table: tableName,
//                     action: "foreign_key_added",
//                     column: foreignKeyColumn,
//                     references: targetTable
//                 });
//             }
//         }
//     }
// }

// /**
//  * Runs the database synchronization process manually.
//  *
//  * - If successful, logs completion and exits with code 0.
//  * - If an error occurs, logs the error and exits with code 1.
//  */
// async function runSync() {
//     try {
//         await syncDatabase();
//         createLog(LogType.DEBUG, LogOperation.UPDATE, LogCategory.DATABASE, "Database synchronization completed successfully.");
//         process.exit(0);
//     } catch (error) {
//         createLog(LogType.ERROR, LogOperation.UPDATE, LogCategory.DATABASE, formatError(error));
//         process.exit(1);
//     }
// }

// runSync();
