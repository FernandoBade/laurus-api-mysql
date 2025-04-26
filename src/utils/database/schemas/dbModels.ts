import "reflect-metadata";
import fs from "fs";
import path from "path";
import { createLog } from "../../commons"
import { LogType, Operation, LogCategory } from "../../enum";

/**
 * Retrieves all model files from the 'model' directory, excluding `baseModel.ts` and schema files.
 *
 * @param {string} dir - Directory path where models are located.
 * @returns {any[]} - Array of imported model classes.
 */
export function getModels(dir = path.resolve(__dirname, "../../../model/")) {
    if (!fs.existsSync(dir)) {
        createLog
            (LogType.ERROR,
                Operation.SEARCH,
                LogCategory.DATABASE,
                {
                    message: `Directory '${dir}' not found.`
                });
        return [];
    }

    let models: any[] = [];
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            models = models.concat(getModels(fullPath));
        } else if (file.endsWith(".ts") && !file.toLowerCase().includes("schema")) {
            createLog(
                LogType.DEBUG,
                Operation.SEARCH,
                LogCategory.DATABASE,
                `Loading model: '${file}'`
            );
            models.push(require(fullPath).default);
        }
    }

    return models;
}