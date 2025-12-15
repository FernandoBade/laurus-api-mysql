// #region Imports
import { HTTPStatus, LogType, LogOperation, LogCategory, SortOrder, Operator } from './enum';
import { createLogger, format, transports, addColors } from 'winston';
import { NextFunction, Response, Request } from 'express';
import { ResourceBase } from './resources/languages/resourceService';
import { Resource } from './resources/resource';
import { LanguageCode } from './resources/resourceTypes';
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
    const elapsedTime = getDurationMs(res);

    const response: any = {
        success,
        ...(resource && { message: ResourceBase.translate(resource, language) })
    };

    if (data !== undefined) {
        if (success && typeof data === 'object' && data !== null && 'data' in data && 'meta' in data) {
            const { data: payload, meta } = data as { data: any; meta: Record<string, any> };
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
            'Unknown error';
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
    error?: any
) {
    const language = req.language ?? 'pt-BR';
    const requestTimeMs = getDurationMs(res);

    return res.status(status).json({
        success: false,
        message: ResourceBase.translate(resource, language),
        ...(error ? { error: formatError(error) } : {}),
        elapsedTime: getDurationMs(res)

    });
}



/**
 * Parsed pagination parameters.
 */
export interface Pagination {
    page: number;
    pageSize: number;
    limit: number;
    offset: number;
    sort?: string;
    order?: SortOrder;
}

export type QueryOptions<T = any> = {
    limit?: number;
    offset?: number;
    sort?: keyof T | string;
    order?: Operator;
};


/**
 * Parses pagination information from a query object.
 *
 * @param query - The request query parameters.
 * @returns Pagination data with defaults applied.
 */
export function parsePagination(query: Record<string, unknown>): Pagination {
    const DEFAULT_PAGE = 1;
    const DEFAULT_PAGE_SIZE = 50;
    const MAX_PAGE_SIZE = 100;

    let page = Number(query.page) || DEFAULT_PAGE;
    page = page > 0 ? page : DEFAULT_PAGE;

    let pageSize = Number(query.pageSize) || DEFAULT_PAGE_SIZE;
    pageSize = pageSize > 0 ? pageSize : DEFAULT_PAGE_SIZE;
    pageSize = Math.min(pageSize, MAX_PAGE_SIZE);

    const sort = typeof query.sort === 'string' && query.sort.length > 0 ? query.sort : undefined;

    const orderParam = typeof query.order === 'string' ? query.order.toLowerCase() : undefined;
    const order: SortOrder = orderParam === SortOrder.ASC ? SortOrder.ASC : SortOrder.DESC;

    const offset = (page - 1) * pageSize;

    return {
        page,
        pageSize,
        limit: pageSize,
        offset,
        ...(sort ? { sort } : {}),
        order
    };
}


/**
 * Builds pagination metadata for API responses.
 *
 * @param params - Current pagination data and total item count.
 * @returns Metadata including total pages and navigation flags.
 */
export function buildMeta({ page, pageSize, total }: { page: number; pageSize: number; total: number }) {
    const totalPages = Math.ceil(total / pageSize);

    return {
        page,
        pageSize,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
    };
}

export function requestTimer() {
    return (_req: Request, res: Response, next: NextFunction) => {
        res.locals._startNs = process.hrtime.bigint();
        next();
    };
}

export function getDurationMs(res: Response): number {
    const start: bigint | undefined = res.locals?._startNs;
    if (!start) return 0;
    const end = process.hrtime.bigint();
    return Number((end - start) / BigInt(1000000));
}


// #endregion API Response Helpers
