import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import authRoutes from './routes/authRoutes';
import userRoutes from "./routes/userRoutes";
import cookieParser from 'cookie-parser';
import { createLog, formatError, sendErrorResponse } from "./utils/commons";
import { LogCategory, Operation, LogType } from "./utils/enum";
import { LanguageCode } from "./utils/resources/resourceTypes";
import { Resource } from "./utils/resources/resource";

const app = express();
const port = process.env.PORT || 5050;


app.use(express.json());
app.use(cookieParser());

app.use((req: Request, res: Response, next: NextFunction) => {
    const acceptedLanguages: LanguageCode[] = ['en-US', 'pt-BR', 'es-ES'];
    const lang = req.headers['accept-language'] as LanguageCode;

    req.language = acceptedLanguages.includes(lang) ? lang : 'pt-BR';

    next();
});

app.use("/users", userRoutes);
app.use('/auth', authRoutes);

/**
 * Global error handler to catch unhandled exceptions.
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
 */
function startServer() {
    app.listen(port, () => {
        createLog(
            LogType.DEBUG,
            Operation.STATUS,
            LogCategory.SERVER,
            `🚀 Server running on port ${port}`
        );
    });
}

startServer();
