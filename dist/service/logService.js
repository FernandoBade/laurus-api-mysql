"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogService = void 0;
const enum_1 = require("../utils/enum");
const logRepository_1 = require("../repositories/logRepository");
const userRepository_1 = require("../repositories/userRepository");
const resource_1 = require("../utils/resources/resource");
const commons_1 = require("../utils/commons");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
/**
 * Service for log business logic.
 * Handles log operations including creation and cleanup.
 */
class LogService {
    constructor() {
        this.logRepository = new logRepository_1.LogRepository();
        this.userRepository = new userRepository_1.UserRepository();
    }
    /**
     * Creates a new log entry.
     * DEBUG logs are ignored and not persisted in the database.
     *
     * @summary Creates a log entry (skips DEBUG logs).
     * @param type - Severity of the log (e.g., DEBUG, ERROR).
     * @param operation - Action performed (e.g., CREATE, DELETE).
     * @param category - Functional category (e.g., USER, AUTH).
     * @param detail - Log message or payload.
     * @param userId - Optional ID of the user related to the log.
     * @returns Insertion result or success confirmation for DEBUG logs.
     */
    async createLog(type, operation, category, detail, userId) {
        const validUserId = await this.getValidUserId(userId);
        if (type !== enum_1.LogType.DEBUG) {
            try {
                const created = await this.logRepository.create({
                    type,
                    operation,
                    category,
                    detail,
                    userId: validUserId,
                });
                return { success: true, data: { id: created.id } };
            }
            catch (error) {
                return { success: false, error: resource_1.Resource.INTERNAL_SERVER_ERROR };
            }
        }
        return { success: true };
    }
    /**
     * Verifies whether a user ID exists before associating it with a log.
     *
     * @summary Validates a user ID for log association.
     * @param userId - ID to validate.
     * @returns Validated user ID or null if invalid.
     */
    async getValidUserId(userId) {
        var _a;
        if (!userId || isNaN(userId))
            return null;
        const user = await this.userRepository.findById(userId);
        return (_a = user === null || user === void 0 ? void 0 : user.id) !== null && _a !== void 0 ? _a : null;
    }
    /**
     * Deletes all log entries older than 120 days based on the timestamp field.
     * A DEBUG log is created to record the number of deleted entries.
     *
     * @summary Removes old log entries (older than 120 days).
     * @returns Total number of deleted entries or error on failure.
     */
    async deleteOldLogs() {
        var _a, _b;
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - 120);
            const result = await db_1.db.delete(schema_1.logs)
                .where((0, drizzle_orm_1.lt)(schema_1.logs.createdAt, cutoffDate));
            const total = (_b = (_a = result[0]) === null || _a === void 0 ? void 0 : _a.affectedRows) !== null && _b !== void 0 ? _b : 0;
            await (0, commons_1.createLog)(enum_1.LogType.DEBUG, enum_1.LogOperation.DELETE, enum_1.LogCategory.LOG, `Deleted ${total} logs older than 120 days`, undefined);
            return { success: true, data: { deleted: total } };
        }
        catch (error) {
            return { success: false, error: resource_1.Resource.INTERNAL_SERVER_ERROR };
        }
    }
    /**
     * Retrieves all logs associated with a given user ID.
     * Validates the input before executing the query.
     *
     * @summary Gets all logs for a user.
     * @param userId - User ID to filter logs by.
     * @returns Array of logs or error if ID is invalid.
     */
    async getLogsByUser(userId) {
        if (userId === null || isNaN(userId) || userId <= 0) {
            return { success: false, error: resource_1.Resource.INVALID_USER_ID };
        }
        try {
            const logList = await this.logRepository.findMany({
                userId: { operator: enum_1.Operator.EQUAL, value: userId }
            });
            return { success: true, data: logList };
        }
        catch (error) {
            return { success: false, error: resource_1.Resource.INTERNAL_SERVER_ERROR };
        }
    }
}
exports.LogService = LogService;
