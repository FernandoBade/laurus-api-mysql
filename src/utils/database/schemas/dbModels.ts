import "reflect-metadata";
import fs from "fs";
import path from "path";
import { createLog } from "../../commons"
import { LogType, LogOperation, LogCategory } from "../../enum";

/**
 * Recursively loads all model classes from the `/model` directory.
 * Excludes files that include "schema" in the name or are not `.ts` files.
 *
 * @param dir - Optional directory path (defaults to /model).
 * @returns Array of loaded model classes.
 */
type ModelClass = { tableName: string };

export function getModels(dir = path.resolve(__dirname, "../../../model/")): ModelClass[] {
    if (!fs.existsSync(dir)) {
        createLog
            (LogType.ERROR,
                LogOperation.SEARCH,
                LogCategory.DATABASE,
                {
                    message: `Directory '${dir}' not found.`
                });
        return [];
    }

    let models: ModelClass[] = [];
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            models = models.concat(getModels(fullPath));
        } else if (file.endsWith(".ts") && !file.toLowerCase().includes("schema")) {
            createLog(
                LogType.DEBUG,
                LogOperation.SEARCH,
                LogCategory.DATABASE,
                `Loading model: '${file}'`
            );
            models.push(require(fullPath).default as ModelClass);
        }
    }

    return models;
}