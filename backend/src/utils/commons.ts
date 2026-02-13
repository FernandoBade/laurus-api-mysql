import { translateResource } from '../../../shared/i18n/resource.utils';
// #region Imports
import { HTTPStatus, LogType, LogOperation, LogCategory } from '../../../shared/enums';
import { createLogger, format, transports, addColors } from 'winston';
import { NextFunction, Response, Request } from 'express';
import { ResourceKey as Resource } from '../../../shared/i18n/resource.keys';
// #endregion Imports

// #region Logger Configuration
/*
    * Logger configuration using Winston for structured logging.
    * Custom log levels and colors are defined for better readability.
    * Logs are sent to the console and can be persisted to a database.
    *
    * @module logger
    */
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

const LOG_DETAIL_IGNORED_FIELDS = ['createdAt', 'updatedAt'];

/**
 * Checks whether a value is a plain object.
 *
 * @summary Detects plain objects for log normalization.
 * @param value - Value to inspect.
 * @returns True when the value is a plain object.
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === 'object' && value?.constructor === Object;
}

function isPaginatedData(value: unknown): value is { data: unknown; meta: Record<string, unknown> } {
    if (!isPlainObject(value)) {
        return false;
    }
    if (!('data' in value) || !('meta' in value)) {
        return false;
    }
    return isPlainObject(value.meta);
}

/**
 * Removes timestamp fields from a log detail payload.
 *
 * @summary Strips timestamps from log detail objects.
 * @param detail - Log detail object to sanitize.
 * @param ignoreKeys - Optional list of extra keys to remove.
 * @returns Sanitized log detail without timestamp fields.
 */
export function sanitizeLogDetail<T extends object>(detail: T, ignoreKeys: string[] = []): Record<string, unknown> {
    const ignored = new Set([...LOG_DETAIL_IGNORED_FIELDS, ...ignoreKeys]);
    const payload = detail as Record<string, unknown>;
    return Object.keys(payload).reduce((acc, key) => {
        if (!ignored.has(key)) {
            acc[key] = payload[key];
        }
        return acc;
    }, {} as Record<string, unknown>);
}

/**
 * Compares two log values with support for Date objects.
 *
 * @summary Checks equality for audit log comparisons.
 * @param left - Previous value.
 * @param right - Current value.
 * @returns True when the values are equivalent.
 */
function areLogValuesEqual(left: unknown, right: unknown): boolean {
    if (left === right) return true;

    if (left instanceof Date && right instanceof Date) {
        return left.getTime() === right.getTime();
    }

    if (left && right && typeof left === 'object' && typeof right === 'object') {
        return JSON.stringify(left) === JSON.stringify(right);
    }

    return false;
}

/**
 * Builds a delta payload for update audit logs.
 *
 * @summary Generates field-level changes between two objects.
 * @param before - Previous state of the entity.
 * @param after - Current state of the entity.
 * @param ignoreKeys - Optional list of keys to exclude from the delta.
 * @returns Object containing only changed fields with from/to values.
 */
export function buildLogDelta<T extends object>(
    before: T,
    after: T,
    ignoreKeys: string[] = []
): Record<string, { from: unknown; to: unknown }> {
    const safeBefore = sanitizeLogDetail(before, ignoreKeys);
    const safeAfter = sanitizeLogDetail(after, ignoreKeys);
    const keys = new Set([...Object.keys(safeBefore), ...Object.keys(safeAfter)]);
    const delta: Record<string, { from: unknown; to: unknown }> = {};

    for (const key of keys) {
        const previousValue = safeBefore[key];
        const currentValue = safeAfter[key];
        if (!areLogValuesEqual(previousValue, currentValue)) {
            delta[key] = { from: previousValue, to: currentValue };
        }
    }

    return delta;
}

/**
 * Logs a message to the console and, if appropriate, persists it to the database.
 * Used across the system for centralized logging with support for log levels, user context, and categories.
 *
 * @summary Logs to console and delegates persistence.
 * @param LogType - Severity level of the log (e.g., ERROR, DEBUG).
 * @param operation - Type of operation being logged (e.g., CREATE, DELETE).
 * @param category - Area of the system the log relates to (e.g., USER, AUTH).
 * @param detail - Log message or object, automatically serialized if needed.
 * @param userId - Optional user ID to associate the log with.
 * @param next - Optional Express error handler for chaining errors.
 */
export async function createLog(
    LogType: LogType,
    operation: LogOperation,
    category: LogCategory,
    detail: unknown,
    userId?: number,
    _next?: NextFunction
) {
    const normalizedDetail = isPlainObject(detail) ? sanitizeLogDetail(detail) : detail;
    const logMessage = typeof normalizedDetail === 'object' ? JSON.stringify(normalizedDetail) : String(normalizedDetail);

    logger.log(LogType, `[${operation}][${category}]: ${logMessage}`.trim());

    const logService = await getLogService();
    await logService.createLog(LogType, operation, category, logMessage, userId);
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
    data?: unknown,
    resource?: Resource
) {
    if (res.headersSent) return;

    const success = status === HTTPStatus.OK || status === HTTPStatus.CREATED;
    const language = req.language ?? 'en-US';
    const elapsedTime = getDurationMs(res);

    const response: Record<string, unknown> = {
        success,
        ...(resource && { message: translateResource(resource, language) })
    };

    if (data !== undefined) {
        if (success && isPaginatedData(data)) {
            const { data: payload, meta } = data;
            const { page, pageSize, pageCount, total, ...restMeta } = meta || {};

            response.data = payload;
            if (Object.keys(restMeta).length) {
                response.meta = restMeta;
            }

            response.elapsedTime = `${elapsedTime} ms`;
            if (page !== undefined) response.page = page;
            if (pageSize !== undefined) response.pageSize = pageSize;
            if (pageCount !== undefined) response.pageCount = pageCount;
            if (total !== undefined) response.totalItems = total;
        } else {
            if (success) {
                response.data = data;
            } else {
                response.error = JSON.parse(JSON.stringify(data));
            }
            response.elapsedTime = elapsedTime;
        }
    } else {
        response.elapsedTime = `${elapsedTime} ms`;

    }

    return res.status(status).json(response);
}

/**
 * Normalizes different types of thrown errors (Error, object, or primitive)
 * into a consistent and serializable format for logging or display.
 *
 * @param error - Unknown error object.
 * @returns A structured object with message, name and stack trace (if applicable).
 */
export function formatError(error: unknown): Record<string, unknown> {
    if (error instanceof Error) {

        const detailedError = (error as unknown) as Record<string, unknown> & {
            sqlMessage?: string;
            code?: string;
            errno?: number;
            sqlState?: string;
        };
        const message =
            error.message ||
            detailedError.sqlMessage ||
            detailedError.code ||
            Resource.UNEXPECTED_ERROR;
        return {
            message,
            name: error.name,
            ...(detailedError.code && { code: detailedError.code }),
            ...(detailedError.errno && { errno: detailedError.errno }),
            ...(detailedError.sqlState && { sqlState: detailedError.sqlState }),
        };
    }

    if (typeof error === 'object' && error !== null) {
        return error as Record<string, unknown>;
    }

    return { message: error };
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
    error?: unknown
) {
    const language = req.language ?? 'pt-BR';
    return res.status(status).json({
        success: false,
        message: translateResource(resource, language),
        ...(error ? { error: formatError(error) } : {}),
        elapsedTime: getDurationMs(res)

    });
}

export function requestTimer() {
    return (_req: Request, res: Response, next: NextFunction) => {
        res.locals._startNs = process.hrtime.bigint();
        next();
    };
}

function getDurationMs(res: Response): number {
    const start: bigint | undefined = res.locals?._startNs;
    if (!start) return 0;
    const end = process.hrtime.bigint();
    return Number((end - start) / BigInt(1000000));
}


// #endregion API Response Helpers

