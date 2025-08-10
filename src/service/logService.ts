import { DbService } from '../utils/database/services/dbService';
import { TableName, LogType, LogOperation, LogCategory, Operator } from '../utils/enum';
import { DbResponse } from '../utils/database/services/dbResponse';
import { insert, removeOlderThan } from '../utils/database/helpers/dbHelpers';
import { createLog } from '../utils/commons';
import { Resource } from '../utils/resources/resource';

interface LogData {
    type: LogType;
    operation: LogOperation;
    detail: string;
    category: LogCategory;
    user_id?: number | null;
    timestamp?: Date;
}

export class LogService extends DbService {
    constructor() {
        super(TableName.LOG);
    }

    /**
     * Creates a new log entry.
     * DEBUG logs are ignored and not persisted in the database.
     *
     * @param type - Severity of the log (e.g., DEBUG, ERROR).
     * @param operation - Action performed (e.g., CREATE, DELETE).
     * @param category - Functional category (e.g., USER, AUTH).
     * @param detail - Log message or payload.
     * @param userId - Optional ID of the user related to the log.
     * @returns Insertion result or success confirmation for DEBUG logs.
     */
    async createLog(
        type: LogType,
        operation: LogOperation,
        category: LogCategory,
        detail: string,
        userId?: number
    ): Promise<DbResponse<{ id?: number }>> {
        const validUserId = await this.getValidUserId(userId);

        const log: LogData = {
            type,
            operation,
            category,
            detail,
            user_id: validUserId,
            timestamp: new Date(),
        };

        if (type !== LogType.DEBUG) {
            return insert(TableName.LOG, log);
        }

        return { success: true };
    }


    /**
     * Verifies whether a user ID exists before associating it with a log.
     *
     * @param userId - ID to validate.
     * @returns Validated user ID or null if invalid.
     */
    private async getValidUserId(userId?: number): Promise<number | null> {
        if (!userId || isNaN(userId)) return null;

        const user = await this.findWithFilters<{ id: number }>({ id: { operator: Operator.EQUAL, value: userId } });
        return user.success ? user.data?.[0]?.id ?? null : null;
    }


    /**
     * Deletes all log entries older than 120 days based on the timestamp field.
     * A DEBUG log is created to record the number of deleted entries.
     *
     * @returns Total number of deleted entries or error on failure.
     */
    async deleteOldLogs(): Promise<DbResponse<{ deleted: number }>> {
        const result = await removeOlderThan(TableName.LOG, 'timestamp', 120);

        const total = result.data?.deleted ?? 0;

        await createLog(
            LogType.DEBUG,
            LogOperation.DELETE,
            LogCategory.LOG,
            `Deleted ${total} logs older than 120 days`,
            undefined,
        );

        if (!result.success) {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        }

        return result;
    }

    /**
     * Retrieves all logs associated with a given user ID.
     * Validates the input before executing the query.
     *
     * @param user_id - User ID to filter logs by.
     * @returns Array of logs or error if ID is invalid.
     */
    async getLogsByUser(user_id: number | null): Promise<DbResponse<any[]>> {
        if (user_id === null || isNaN(user_id) || user_id <= 0) {
            return { success: false, error: Resource.INVALID_USER_ID };
        }

        return this.findWithFilters(
            {
                user_id: { operator: Operator.EQUAL, value: user_id }
            });
    }

}
