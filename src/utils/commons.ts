import { HTTPStatus, LogType, Operation, LogCategory, ErrorMessages } from './enum';
import { createLogger, format, transports, addColors } from 'winston';
import { NextFunction, Response } from 'express';
import { LogService } from '../service/logService';
import { ZodError, ZodIssue } from 'zod';

// #region Logger Configuration

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
 * Logs a message and optionally saves it to the database.
 */
export async function createLog(
    logType: LogType,
    operation: Operation,
    category: LogCategory,
    detail: any,
    userId?: number,
    next?: NextFunction
) {
    const logMessage = typeof detail === 'object' ? JSON.stringify(detail) : String(detail);

    logger.log(logType, `[${operation}][${category}]: ${logMessage}`.trim());

    if (logType === LogType.ERROR) {
        next?.(new Error(logMessage));
    }

    if (logType !== LogType.DEBUG) {
        const logService = new LogService();
        await logService.createLog(logType, operation, category, logMessage, userId);
    }
}

/**
 * Retrieves logs associated with a specific user.
 */
export async function getLogsByUser(userId: number) {
    try {
        const logService = new LogService();
        return await logService.getLogsByUser(userId);
    } catch (error) {
        await createLog(LogType.DEBUG, Operation.SEARCH, LogCategory.LOG, error, userId);
        throw new Error(ErrorMessages.INTERNAL_SERVER_ERROR);
    }
}

// #endregion

// #region API Response Helpers

/**
 * Sends a standardized API response to the client.
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
 * Converts error object into a structured loggable format.
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

    return { message: String(error) };
}

/**
 * Formats Zod validation errors into readable messages.
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

// #endregion
