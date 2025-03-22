import db from "./dbConnection";
import { createLog } from "../commons";
import { LogType, Operation, LogCategory } from "../enum";

/**
 * Synchronizes relationships between models.
 *
 * @param model The model whose relationships need to be synchronized.
 */
export async function syncRelationships(Model: any) {
    const tableName = Model.tableName.toLowerCase();
    const relationships = Reflect.getMetadata("relationships", Model) || [];
    const [existingColumns]: any[] = await db.query(`SHOW COLUMNS FROM ${tableName}`);
    const existingColumnNames = existingColumns.map((col: any) => col.Field);

    for (const relation of relationships) {
        if (relation.type === "OneToMany") continue;

        const targetModel = relation.target();
        if (!targetModel || typeof targetModel !== "function") {
            createLog(
                LogType.ERROR,
                Operation.UPDATE,
                LogCategory.DATABASE,
                {
                    message: `Invalid target function for relation '${relation.propertyKey}' in table '${tableName}'.`
                });
            continue;
        }

        const targetTable = (targetModel as any).tableName.toLowerCase();
        const foreignKeyColumn = `${relation.propertyKey}_id`;

        const [targetTableExists]: any[] = await db.query(
            `SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema = DATABASE() AND UPPER(TABLE_NAME) = ?`,
            [targetTable.toUpperCase()]
        );

        if (!targetTableExists.length) {
            createLog(
                LogType.ERROR,
                Operation.UPDATE,
                LogCategory.DATABASE,
                {
                    message: `Cannot add foreign key to '${tableName}'. Table '${targetTable}' does not exist.`
                });
            continue;
        }

        if (!existingColumnNames.includes(foreignKeyColumn)) {
            await db.query(`ALTER TABLE ${tableName} ADD COLUMN ${foreignKeyColumn} INT`);
            await db.query(`ALTER TABLE ${tableName} ADD CONSTRAINT fk_${tableName}_${foreignKeyColumn} FOREIGN KEY (${foreignKeyColumn}) REFERENCES ${targetTable}(id) ON DELETE CASCADE`);

            createLog(
                LogType.SUCCESS,
                Operation.UPDATE,
                LogCategory.DATABASE,
                {
                    table: tableName,
                    action: "foreign_key_added",
                    column: foreignKeyColumn,
                    references: targetTable
                });
        }
    }
}
