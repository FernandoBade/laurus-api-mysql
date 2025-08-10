// #region Imports
import dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response, NextFunction } from "express";
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import redoc from 'redoc-express';

import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import { swaggerSpec } from './utils/docs/swaggerConfig';
import './utils/docs/userDocs';

import { createLog, sendErrorResponse, formatError } from './utils/commons';
import { LogCategory, LogOperation, LogType, HTTPStatus } from './utils/enum';
import { LanguageCode } from './utils/resources/resourceTypes';
import { Resource } from './utils/resources/resource';
import accountRoutes from './routes/accountRoutes';
import transactionRoutes from './routes/transactionRoutes';
import categoryRoutes from './routes/categoryRoutes';
import subcategoryRoutes from './routes/subcategoryRoutes';
// #endregion Imports

const app = express();
const port = process.env.PORT || 5050;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());

// Middleware to resolve language from Accept-Language header
app.use((req: Request, res: Response, next: NextFunction) => {
    const acceptedLanguages: LanguageCode[] = ['en-US', 'pt-BR', 'es-ES'];
    const lang = req.headers['accept-language'] as LanguageCode;
    req.language = acceptedLanguages.includes(lang) ? lang : 'pt-BR';
    next();
});

// Register application routes
app.use('/auth', authRoutes);
app.use("/accounts", accountRoutes);
app.use("/categories", categoryRoutes);
app.use("/subcategories", subcategoryRoutes);
app.use("/transactions", transactionRoutes);
app.use("/users", userRoutes);

// Swagger UI (OpenAPI JSON)
app.get('/docs/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Redoc rendering
app.get('/redoc', redoc({
    title: 'Laurus API Docs',
    specUrl: '/docs/swagger.json'
}));

/**
 * Global error handler to catch unhandled exceptions.
 *
 * @param error - Any unhandled error.
 * @param req - Express request object.
 * @param res - Express response object.
 * @param next - Next middleware function.
 */
async function errorHandler(error: unknown, req: Request, res: Response, next: NextFunction) {
    const isSyntaxError = error instanceof SyntaxError && 'body' in error;
    const resource = isSyntaxError ? Resource.INVALID_JSON : Resource.INTERNAL_SERVER_ERROR;
    const status = isSyntaxError ? HTTPStatus.BAD_REQUEST : HTTPStatus.INTERNAL_SERVER_ERROR;

    await createLog(LogType.ERROR, LogOperation.STATUS, LogCategory.SERVER, formatError(error));
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
            LogOperation.STATUS,
            LogCategory.SERVER,
            `🚀 Server running on port ${port}`
        );
    });
}

startServer();
