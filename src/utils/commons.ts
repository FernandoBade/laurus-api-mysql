import { HTTPStatus, LogType, Operation, LogCategory, TableName } from './enum';
import { createLogger, format, transports, addColors } from 'winston';
import { NextFunction } from 'express';
import { runQuery } from './database';
import { LogService } from '../service/logService';
import { Response } from 'express';
import { ZodError, ZodIssue } from 'zod';

// #region Logger
const customLogs = {
    levels: {
        [LogType.ERROR]: 0,
        [LogType.ALERT]: 1,
        [LogType.SUCCESS]: 2,
        [LogType.DEBUG]: 4
    },
    colors: {
        [LogType.ERROR]: 'red',
        [LogType.ALERT]: 'yellow',
        [LogType.SUCCESS]: 'green',
        [LogType.DEBUG]: 'magenta'
    }
};

addColors(customLogs.colors);

const logger = createLogger({
    levels: customLogs.levels,
    format: format.combine(
        format.timestamp(),
        format.colorize({ all: true }),
        format.printf(({ timestamp, level, message }) => `[${timestamp}][${level}]${message}`)
    ),
    transports: [
        new transports.Console({
            level: LogType.DEBUG,
        })
    ]
});

/**
 * Logs a message.
 *
 * @param logType - Type of log (ERROR, ALERT, SUCCESS, DEBUG. Except for the DEBUG level, every type is saved in the database).
 * @param operation - Type of operation performed.
 * @param category - Log category.
 * @param detail - Details of the operation or error.
 * @param userId - ID of the associated user (optional).
 * @param next - Express function to continue the flow (optional).
 */
export async function createLog(
    logType: LogType,
    operation: Operation,
    category: LogCategory,
    detail: any,
    userId?: number,
    next?: NextFunction
) {
    const logMessage = typeof detail === "object" ? detail : String(detail);

    logger.log(logType, `[${operation}][${category}]: ${JSON.stringify(logMessage)}`);

    if (logType === LogType.ERROR) {
        next?.(new Error(logMessage));
    }

    if (logType !== LogType.DEBUG) {
        await LogService.createLog(logType, operation, category, logMessage, userId);
    }
}

/**
 * Retrieves logs associated with a specific user.
 *
 * @param userId - ID of the user whose logs should be retrieved.
 * @returns A list of logs associated with the user.
 */
export async function getLogsByUser(userId: number) {
    try {
        const logs = await LogService.getLogsByUser(userId);
        return logs;
    } catch (error) {
        await createLog(
            LogType.DEBUG,
            Operation.SEARCH,
            LogCategory.LOG,
            JSON.stringify(error),
            userId
        );
        throw new Error('Failed to retrieve logs.');
    }
}
// #endregion Logger

// #region General response handling

/**
 * * Sends a standardized API response to the client.
 *
 * @param res - Express response object.
 * @param status - HTTP status code.
 * @param data - Data to be returned (optional).
 * @param message - Message to be returned (optional).
 */
export function answerAPI(res: Response, status: HTTPStatus, data?: any, message?: string) {
    const success = status === HTTPStatus.OK || status === HTTPStatus.CREATED;
    const response: any = {
        success,
        ...(message && { message }),
        ...(data !== undefined && data !== null ? { data } : {})
    };

    if (!res.headersSent) {
        return res.status(status).json(response);
    }
}

/**
 * Formats an error into an object suitable for logging.
 * Ensures that error objects are structured properly and not double-stringified.
 *
 * @param error - The error object to format.
 * @returns An object containing relevant error details.
 */
export function formatError(error: unknown): Record<string, any> {
    if (error instanceof Error) {
        return {
            message: error.message,
            name: error.name,
            stack: error.stack,
        };
    }

    if (typeof error === "object" && error !== null) {
        return error as Record<string, any>;
    }

    return { message: String(error) };
}


/**
 * * Converts validation errors from Zod into a standardized response format.
 *
 * @param error - The error generated by Zod.
 * @returns Formatted list of errors.
 */
export function formatZodValidationErrors(error: ZodError) {
    return error.errors.map((e: ZodIssue) => {
        let translatedMessage = e.message;
        let receivedValue = "received" in e ? `Received value: '${e.received}'` : "";
        let validOptions = "options" in e ? `Valid values: ${e.options.join(', ')}` : "";

        switch (e.code) {
            case "invalid_enum_value":
                translatedMessage = `Invalid value for '${e.path.join('.')}'. ${receivedValue} | ${validOptions}`;
                break;
            case "invalid_type":
                translatedMessage = `Field '${e.path.join('.')}' expects a value of type '${(e as any).expected}', but received '${(e as any).received}'`;
                break;
            case "too_small":
                translatedMessage = `Field '${e.path.join('.')}' must have at least ${(e as any).minimum} characters. ${receivedValue}`;
                break;
            case "too_big":
                translatedMessage = `Field '${e.path.join('.')}' must have at most ${(e as any).maximum} characters. ${receivedValue}`;
                break;
            case "unrecognized_keys":
                translatedMessage = `The field(s) '${(e as any).keys.join(", ")}' are unrecognized and should not be included in this request.`;
                break;
            case "invalid_date":
                translatedMessage = `Field '${e.path.join('.')}' must be a valid date. ${receivedValue}`;
                break;
            case "custom":
                translatedMessage = e.message;
                break;
            default:
                translatedMessage = `${e.message} ${receivedValue}`.trim();
        }

        return {
            property: e.path.join('.') || 'unknown',
            error: translatedMessage
        };
    });
}
// #endregion General response handling

// #region CRUD Methods

/**
 * Retrieves a record by ID from any table.
 * @param table - The name of the table.
 * @param id - The ID of the record to retrieve.
 * @returns The record if found, otherwise an error message.
 */
export async function getById(table: TableName, id: number) {
    const result: any = await runQuery(`SELECT * FROM ${table} WHERE id = ?`, [id]);
    return result.length ? result[0] : { error: `${table} record not found` };
}

/**
 * Inserts a new record into any table.
 * @param table - The name of the table.
 * @param data - The data to insert.
 * @returns The newly inserted record including its ID.
 */
export async function saveEntry(table: TableName, data: any) {
    const columns = Object.keys(data).join(', ');
    const values = Object.values(data);
    const placeholders = values.map(() => '?').join(', ');

    const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
    const result: any = await runQuery(query, values);

    return { id: result.insertId, ...data };
}

/**
 * Updates a record by ID in any table.
 * @param table - The name of the table.
 * @param id - The ID of the record to update.
 * @param data - The updated data.
 * @returns The updated record.
 */
export async function updateEntry(table: TableName, id: number, data: any) {
    const columns = Object.keys(data).map(column => `${column} = ?`).join(', ');
    const values = Object.values(data);
    values.push(id);

    const query = `UPDATE ${table} SET ${columns} WHERE id = ?`;
    await runQuery(query, values);

    return getById(table, id);
}

/**
 * Deletes a record by ID from any table.
 * @param table - The name of the table.
 * @param id - The ID of the record to delete.
 * @returns The ID of the deleted record or an error if not found.
 */
export async function deleteEntry(table: TableName, id: number) {
    const exists = await getById(table, id);
    if ('error' in exists) return exists;

    await runQuery(`DELETE FROM ${table} WHERE id = ?`, [id]);
    return { id };
}

/**
* Searches for records in the specified table, optionally filtering by a column and value.
 * @param table - The name of the table.
 * @param column - The column to filter by (optional).
 * @param value - The value to filter by (optional).
 * @returns A list of matching records.
 */
export async function searchEntry(table: TableName, column?: string, value?: any) {
    let query = `SELECT * FROM ${table}`;
    const params: any[] = [];

    if (column && value !== undefined) {
        query += ` WHERE ${column} = ?`;
        params.push(value);
    }

    return await runQuery(query, params);
}
// #endregion CRUD Methods