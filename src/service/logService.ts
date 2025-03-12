import { TableName, LogType, LogOperation, LogCategory } from '../utils/enum';
import { getById, saveEntry, searchEntry, createLog } from '../utils/commons';
import { runQuery } from '../utils/database';

export class LogService {
    private static readonly table = TableName.LOG_OLD;

    /**
     * Creates a log entry.
     * @param logType - Type of log (ERROR, ALERT, SUCCESS, DEBUG).
     * @param logOperation - Type of operation performed.
     * @param logCategory - Log category.
     * @param logDetail - Details of the operation or error.
     * @param userId - ID of the associated user (optional).
     */
    static async createLog(
        logType: LogType,
        logOperation: LogOperation,
        logCategory: LogCategory,
        logDetail: string,
        userId?: number
    ) {
        let user = null;

        if (userId && !isNaN(userId)) {
            const foundUser = await getById(TableName.USER, userId);
            if (!('error' in foundUser)) {
                user = foundUser;
            }
        }

        if (logType !== LogType.DEBUG) {
            await saveEntry(this.table, {
                type: logType,
                operation: logOperation,
                detail: JSON.stringify(logDetail),
                category: logCategory,
                userId: user ? user.id : null,
                timestamp: new Date(),
            });
        }
    }

    /**
     * Deletes old logs older than 120 days.
     * @returns The total number of logs deleted.
     */
    static async deleteLogs() {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 120);
        const formattedCutoffDate = cutoffDate.toISOString().slice(0, 19).replace('T', ' ');

        const result: any = await runQuery(
            `DELETE FROM ${this.table} WHERE timestamp < ?`,
            [formattedCutoffDate]
        );

        const total = result.affectedRows ?? 0;

        await createLog(
            LogType.DEBUG,
            LogOperation.DELETION,
            LogCategory.LOG,
            `Total logs deleted: ${total}`
        );

        return total;
    }

    /**
     * Retrieves logs associated with a specific user.
     * @param userId - ID of the user whose logs should be retrieved.
     * @returns A list of logs associated with the user.
     */
    static async getLogsByUser(userId: number) {
        if (isNaN(userId)) throw new Error("Invalid user ID");
        return await searchEntry(this.table, "userId", userId);
    }
}
