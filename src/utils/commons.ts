import { HTTPStatus, LogType, LogOperation, LogCategory } from './enum';
import { createLogger, format, transports, addColors } from 'winston';
import { NextFunction, Response, Request } from 'express';
import { ZodError, ZodIssue } from 'zod';
import { ResourceBase } from './resources/languages/resourceService';
import { Resource } from './resources/resource';

// #region Logger Configuration
async function getLogService() {
    const { LogService } = await import('../service/logService');
    return new LogService();
}

const customLogs = {
    levels: {
        [LogType.ERROR]: 0,
        [LogType.ALERT]: 1,
        [LogType.SUCCESS]: 2,
        [LogType.DEBUG]: 3
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
        format.printf(({ timestamp, level, message }) =>
            `[${timestamp}][${level}]${message}`
        )
    ),
    transports: [
        new transports.Console({ level: LogType.DEBUG })
    ]
});

/**
 * Logs a message to the console and, if appropriate, persists it to the database.
 * Used across the system for centralized logging with support for log levels, user context, and categories.
 *
 * @param logType - Severity level of the log (e.g., ERROR, DEBUG).
 * @param operation - Type of operation being logged (e.g., CREATE, DELETE).
 * @param category - Area of the system the log relates to (e.g., USER, AUTH).
 * @param detail - Log message or object, automatically serialized if needed.
 * @param userId - Optional user ID to associate the log with.
 * @param next - Optional Express error handler for chaining errors.
 */
export async function createLog(
    logType: LogType,
    operation: LogOperation,
    category: LogCategory,
    detail: any,
    userId?: number,
    next?: NextFunction
) {
    const logMessage = typeof detail === 'object' ? JSON.stringify(detail) : String(detail);

    logger.log(logType, `[${operation}][${category}]: ${logMessage}`.trim());

    if (logType !== LogType.DEBUG) {
        const logService = await getLogService();
        await logService.createLog(logType, operation, category, logMessage, userId);
    }
}

/**
 * Retrieves all logs associated with a specific user ID.
 * Uses the log service internally. If an error occurs during retrieval, a debug log is recorded.
 *
 * @param userId - User ID to retrieve logs for.
 * @returns A list of logs or throws an internal server error resource key.
 */
export async function getLogsByUser(userId: number) {
    try {
        const logService = await getLogService();
        return await logService.getLogsByUser(userId);
    } catch (error) {
        await createLog(LogType.DEBUG, LogOperation.SEARCH, LogCategory.LOG, error, userId);
        throw Resource.INTERNAL_SERVER_ERROR;
    }
}

// #endregion Logger Configuration

// #region API Response Helpers
/**
 * Sends a standardized and translated JSON response to the client.
 * Automatically formats the payload according to success or failure, and includes a localized message if available.
 *
 * @param req - Express request, used to detect the user's language preference.
 * @param res - Express response object.
 * @param status - HTTP status code to send.
 * @param data - Optional response payload (success: data, error: details).
 * @param resource - Optional resource key for localized message.
 */
export function answerAPI(
    req: Request,
    res: Response,
    status: HTTPStatus,
    data?: any,
    resource?: Resource
) {
    if (res.headersSent) return;

    const success = status === HTTPStatus.OK || status === HTTPStatus.CREATED;
    const language = req.language ?? 'en-US';

    const response = {
        success,
        ...(resource && { message: ResourceBase.translate(resource, language) }),
        ...(data && (success ? { data } : { error: JSON.parse(JSON.stringify(data)) }))
    };

    return res.status(status).json(response);
}

/**
 * Normalizes different types of thrown errors (Error, object, or primitive)
 * into a consistent and serializable format for logging or display.
 *
 * @param error - Unknown error object.
 * @returns A structured object with message, name and stack trace (if applicable).
 */
export function formatError(error: unknown): Record<string, any> {
    if (error instanceof Error) {
        return {
            message: error.message,
            name: error.name,
            stack: error.stack
        };
    }

    if (typeof error === 'object' && error !== null) {
        return error as Record<string, any>;
    }

    return { message: error };
}

/**
 * Transforms Zod validation errors into a list of user-friendly messages.
 * Supports common error codes such as invalid enums, size constraints, and unrecognized keys.
 *
 * @param error - A ZodError object containing one or more validation issues.
 * @returns An array of objects with the invalid property and the associated error message.
 */
export function formatZodValidationErrors(error: ZodError) {
    return error.errors.map((e: ZodIssue) => {
        let message = e.message;
        const path = e.path.join('.') || 'unknown';

        switch (e.code) {
            case 'invalid_enum_value':
                message = `Invalid value for '${path}'. Received: '${(e as any).received}'. Valid: ${(e as any).options?.join(', ')}`;
                break;
            case 'invalid_type':
                message = `Expected '${(e as any).expected}' for '${path}', received '${(e as any).received}'`;
                break;
            case 'too_small':
                message = `'${path}' must have at least ${(e as any).minimum} characters`;
                break;
            case 'too_big':
                message = `'${path}' must have at most ${(e as any).maximum} characters`;
                break;
            case 'unrecognized_keys':
                message = `Unrecognized keys: ${(e as any).keys.join(', ')}`;
                break;
            case 'invalid_date':
                message = `'${path}' must be a valid date`;
                break;
        }

        return {
            property: path,
            error: message
        };
    });
}

/**
 * Sends a localized error response to the client, following the same structure
 * as successful API responses, but explicitly marking success as false.
 *
 * @param req - Express request, used to determine language for translation.
 * @param res - Express response to write the error into.
 * @param status - HTTP status code to return.
 * @param resource - Resource key for localized error message.
 * @param error - Optional raw error object to include in the payload.
 * @returns The formatted error response in JSON format.
 */
export function sendErrorResponse(
    req: Request,
    res: Response,
    status: HTTPStatus,
    resource: Resource,
    error?: any
) {
    const language = req.language ?? 'pt-BR';

    return res.status(status).json({
        success: false,
        message: ResourceBase.translate(resource, language),
        ...(error ? { error: formatError(error) } : {})
    });
}

// #endregion API Response Helpers
