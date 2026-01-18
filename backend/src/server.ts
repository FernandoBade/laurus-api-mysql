// #region Imports
import dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response, NextFunction } from "express";
import cookieParser from 'cookie-parser';

import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import accountRoutes from './routes/accountRoutes';
import transactionRoutes from './routes/transactionRoutes';
import categoryRoutes from './routes/categoryRoutes';
import subcategoryRoutes from './routes/subcategoryRoutes';
import creditCardRoutes from './routes/creditCardRoutes';
import tagRoutes from './routes/tagRoutes';
import feedbackRoutes from './routes/feedbackRoutes';

import { createLog, sendErrorResponse, requestTimer } from './utils/commons';
import { LogCategory, LogOperation, LogType } from './utils/enum';
import { LanguageCode } from './utils/resources/resourceTypes';
import { Resource } from './utils/resources/resource';

// #endregion Imports

const app = express();
const port = process.env.PORT || 5050;

const envOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
const allowedOrigins = envOrigins.length > 0
    ? envOrigins
    : [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://laurus.bade.digital',
    ];

app.use((req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Vary', 'Origin');
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    const requestHeaders = req.headers['access-control-request-headers'];
    res.setHeader(
        'Access-Control-Allow-Headers',
        typeof requestHeaders === 'string'
            ? requestHeaders
            : 'Content-Type, Authorization, Accept-Language'
    );

    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }

    return next();
});

// Middleware to track request time
app.use(requestTimer());


// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());

// Middleware to resolve language from Accept-Language header
app.use((req: Request, res: Response, next: NextFunction) => {
    const acceptedLanguages: LanguageCode[] = ['en-US', 'pt-BR', 'es-ES'];
    const lang = req.headers['accept-language'] as LanguageCode;
    req.language = acceptedLanguages.includes(lang) ? lang : 'en-US';
    next();
});

// Register application routes
app.use('/auth', authRoutes);
app.use("/accounts", accountRoutes);
app.use("/creditCards", creditCardRoutes);
app.use("/categories", categoryRoutes);
app.use("/subcategories", subcategoryRoutes);
app.use("/tags", tagRoutes);
app.use("/transactions", transactionRoutes);
app.use("/users", userRoutes);
app.use("/feedback", feedbackRoutes);


/**
 * Global error handler to catch unhandled exceptions.
 *
 * @param error - Any unhandled error.
 * @param req - Express request object.
 * @param res - Express response object.
 * @param next - Next middleware function.
 */
function errorHandler(error: any, req: Request, res: Response, next: NextFunction) {
    const isSyntaxError = error instanceof SyntaxError && 'body' in error;

    const resource = isSyntaxError
        ? Resource.INVALID_JSON
        : Resource.INTERNAL_SERVER_ERROR;

    const status = isSyntaxError ? 400 : 500;

    return sendErrorResponse(req, res, status, resource, error);
}

app.use(errorHandler as unknown as express.ErrorRequestHandler);

/**
 * Starts the Express server.
 * Logs the active port to the console.
 */
function startServer() {
    app.listen(port, () => {
        createLog(
            LogType.DEBUG,
            LogOperation.CREATE,
            LogCategory.LOG,
            `🚀 Server running on port ${port}`
        );
    });
}

startServer();
