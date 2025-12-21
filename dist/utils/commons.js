"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLog = createLog;
exports.getLogsByUser = getLogsByUser;
exports.answerAPI = answerAPI;
exports.formatError = formatError;
exports.sendErrorResponse = sendErrorResponse;
exports.parsePagination = parsePagination;
exports.buildMeta = buildMeta;
exports.requestTimer = requestTimer;
exports.getDurationMs = getDurationMs;
// #region Imports
const enum_1 = require("./enum");
const winston_1 = require("winston");
const resourceService_1 = require("./resources/languages/resourceService");
const resource_1 = require("./resources/resource");
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
    const { LogService } = await Promise.resolve().then(() => __importStar(require('../service/logService')));
    return new LogService();
}
const customLogs = {
    levels: {
        [enum_1.LogType.ERROR]: 0,
        [enum_1.LogType.ALERT]: 1,
        [enum_1.LogType.SUCCESS]: 2,
        [enum_1.LogType.DEBUG]: 3
    },
    colors: {
        [enum_1.LogType.ERROR]: 'red',
        [enum_1.LogType.ALERT]: 'yellow',
        [enum_1.LogType.SUCCESS]: 'green',
        [enum_1.LogType.DEBUG]: 'magenta'
    }
};
(0, winston_1.addColors)(customLogs.colors);
const logger = (0, winston_1.createLogger)({
    levels: customLogs.levels,
    format: winston_1.format.combine(winston_1.format.timestamp(), winston_1.format.colorize({ all: true }), winston_1.format.printf(({ timestamp, level, message }) => `[${timestamp}][${level}]${message}`)),
    transports: [
        new winston_1.transports.Console({ level: enum_1.LogType.DEBUG })
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
async function createLog(logType, operation, category, detail, userId, next) {
    const logMessage = typeof detail === 'object' ? JSON.stringify(detail) : String(detail);
    logger.log(logType, `[${operation}][${category}]: ${logMessage}`.trim());
    if (logType !== enum_1.LogType.DEBUG) {
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
async function getLogsByUser(userId) {
    try {
        const logService = await getLogService();
        return await logService.getLogsByUser(userId);
    }
    catch (error) {
        await createLog(enum_1.LogType.DEBUG, enum_1.LogOperation.SEARCH, enum_1.LogCategory.LOG, error, userId);
        throw resource_1.Resource.INTERNAL_SERVER_ERROR;
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
function answerAPI(req, res, status, data, resource) {
    var _a;
    if (res.headersSent)
        return;
    const success = status === enum_1.HTTPStatus.OK || status === enum_1.HTTPStatus.CREATED;
    const language = (_a = req.language) !== null && _a !== void 0 ? _a : 'en-US';
    const elapsedTime = getDurationMs(res);
    const response = Object.assign({ success }, (resource && { message: resourceService_1.ResourceBase.translate(resource, language) }));
    if (data !== undefined) {
        if (success && typeof data === 'object' && data !== null && 'data' in data && 'meta' in data) {
            const { data: payload, meta } = data;
            const _b = meta || {}, { page, pageSize, pageCount, total } = _b, restMeta = __rest(_b, ["page", "pageSize", "pageCount", "total"]);
            response.data = payload;
            if (Object.keys(restMeta).length) {
                response.meta = restMeta;
            }
            response.elapsedTime = `${elapsedTime} ms`;
            if (page !== undefined)
                response.page = page;
            if (pageSize !== undefined)
                response.pageSize = pageSize;
            if (pageCount !== undefined)
                response.pageCount = pageCount;
            if (total !== undefined)
                response.totalItems = total;
        }
        else {
            if (success) {
                response.data = data;
            }
            else {
                response.error = JSON.parse(JSON.stringify(data));
            }
            response.elapsedTime = elapsedTime;
        }
    }
    else {
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
function formatError(error) {
    if (error instanceof Error) {
        const detailedError = error;
        const message = error.message ||
            detailedError.sqlMessage ||
            detailedError.code ||
            'Unknown error';
        return Object.assign(Object.assign(Object.assign({ message, name: error.name }, (detailedError.code && { code: detailedError.code })), (detailedError.errno && { errno: detailedError.errno })), (detailedError.sqlState && { sqlState: detailedError.sqlState }));
    }
    if (typeof error === 'object' && error !== null) {
        return error;
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
function sendErrorResponse(req, res, status, resource, error) {
    var _a;
    const language = (_a = req.language) !== null && _a !== void 0 ? _a : 'pt-BR';
    const requestTimeMs = getDurationMs(res);
    return res.status(status).json(Object.assign(Object.assign({ success: false, message: resourceService_1.ResourceBase.translate(resource, language) }, (error ? { error: formatError(error) } : {})), { elapsedTime: getDurationMs(res) }));
}
/**
 * Parses pagination information from a query object.
 *
 * @param query - The request query parameters.
 * @returns Pagination data with defaults applied.
 */
function parsePagination(query) {
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
    const order = orderParam === enum_1.SortOrder.ASC ? enum_1.SortOrder.ASC : enum_1.SortOrder.DESC;
    const offset = (page - 1) * pageSize;
    return Object.assign(Object.assign({ page,
        pageSize, limit: pageSize, offset }, (sort ? { sort } : {})), { order });
}
/**
 * Builds pagination metadata for API responses.
 *
 * @param params - Current pagination data and total item count.
 * @returns Metadata including total pages and navigation flags.
 */
function buildMeta({ page, pageSize, total }) {
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
function requestTimer() {
    return (_req, res, next) => {
        res.locals._startNs = process.hrtime.bigint();
        next();
    };
}
function getDurationMs(res) {
    var _a;
    const start = (_a = res.locals) === null || _a === void 0 ? void 0 : _a._startNs;
    if (!start)
        return 0;
    const end = process.hrtime.bigint();
    return Number((end - start) / BigInt(1000000));
}
// #endregion API Response Helpers
