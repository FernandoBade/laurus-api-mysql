import { DbService } from '../utils/database/services/dbService';
import { TableName, LogType, LogOperation, LogCategory, Operator } from '../utils/enum';
import { DbResponse } from '../utils/database/services/dbResponse';
import { findById, findMany, findWithColumnFilters, insert, removeOlderThan } from '../utils/database/helpers/dbHelpers';
import { createLog } from '../utils/commons';
import { Resource } from '../utils/resources/resource';
import { number } from 'zod';

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
     * Creates a new log entry, with optional user validation.
     */

    async createLog(
        type: LogType,
        operation: LogOperation,
        category: LogCategory,
        detail: string,
        userId?: number
    ): Promise<DbResponse<any>> {
        const validUserId = await (async () => {
            if (!userId || isNaN(userId)) return null;

            const user = await this.findWithFilters<{ id: number }>(
                {
                    id: { operator: Operator.EQUAL, value: userId }
                });

            return user.success ? user.data?.[0]?.id ?? null : null;
        })();

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
     * Deletes logs older than 120 days.
     * @returns Number of deleted logs or error message.
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
     * Retrieves logs for a given user ID.
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
