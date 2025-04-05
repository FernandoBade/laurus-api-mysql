import express, { Request, Response, NextFunction } from "express";
import userRoutes from "./routes/userRoutes";
import { createLog } from "./utils/commons";
import { LogCategory, Operation, LogType, ErrorMessages } from "./utils/enum";
import { LanguageCode } from "./utils/resources/resourceTypes";

const app = express();
const PORT = process.env.PORT || 5050;

app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
    const acceptedLanguages: LanguageCode[] = ['en-US', 'pt-BR', 'es-ES'];
    const lang = req.headers['accept-language'] as LanguageCode;

    req.language = acceptedLanguages.includes(lang) ? lang : 'pt-BR';

    next();
});

app.use("/users", userRoutes);

function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    if (err instanceof SyntaxError && 'body' in err) {
        return res.status(400).json({
            success: false,
            message: ErrorMessages.INVALID_JSON,
            error: err.message
        });
    }

    return res.status(500).json({
        success: false,
        message: ErrorMessages.INTERNAL_SERVER_ERROR,
        error: err.message
    });
}

app.use(errorHandler as unknown as express.ErrorRequestHandler);

/**
 * Starts the Express server.
 */
function startServer() {
    app.listen(PORT, () => {
        createLog(
            LogType.DEBUG,
            Operation.STATUS,
            LogCategory.SERVER,
            `🚀 Server running on port ${PORT}`
        );
    });
}

startServer();
