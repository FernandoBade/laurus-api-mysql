"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// #region Imports
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const commons_1 = require("./utils/commons");
const enum_1 = require("./utils/enum");
const resource_1 = require("./utils/resources/resource");
const accountRoutes_1 = __importDefault(require("./routes/accountRoutes"));
const transactionRoutes_1 = __importDefault(require("./routes/transactionRoutes"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const subcategoryRoutes_1 = __importDefault(require("./routes/subcategoryRoutes"));
const creditCardRoutes_1 = __importDefault(require("./routes/creditCardRoutes"));
// #endregion Imports
const app = (0, express_1.default)();
const port = process.env.PORT || 5050;
// Middleware to track request time
app.use((0, commons_1.requestTimer)());
// Middleware to parse JSON bodies
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Middleware to resolve language from Accept-Language header
app.use((req, res, next) => {
    const acceptedLanguages = ['en-US', 'pt-BR', 'es-ES'];
    const lang = req.headers['accept-language'];
    req.language = acceptedLanguages.includes(lang) ? lang : 'pt-BR';
    next();
});
// Register application routes
app.use('/auth', authRoutes_1.default);
app.use("/accounts", accountRoutes_1.default);
app.use("/credit-cards", creditCardRoutes_1.default);
app.use("/categories", categoryRoutes_1.default);
app.use("/subcategories", subcategoryRoutes_1.default);
app.use("/transactions", transactionRoutes_1.default);
app.use("/users", userRoutes_1.default);
/**
 * Global error handler to catch unhandled exceptions.
 *
 * @param error - Any unhandled error.
 * @param req - Express request object.
 * @param res - Express response object.
 * @param next - Next middleware function.
 */
function errorHandler(error, req, res, next) {
    const isSyntaxError = error instanceof SyntaxError && 'body' in error;
    const resource = isSyntaxError
        ? resource_1.Resource.INVALID_JSON
        : resource_1.Resource.INTERNAL_SERVER_ERROR;
    const status = isSyntaxError ? 400 : 500;
    return (0, commons_1.sendErrorResponse)(req, res, status, resource, error);
}
app.use(errorHandler);
/**
 * Starts the Express server.
 * Logs the active port to the console.
 */
function startServer() {
    app.listen(port, () => {
        (0, commons_1.createLog)(enum_1.LogType.DEBUG, enum_1.LogOperation.STATUS, enum_1.LogCategory.SERVER, `🚀 Server running on port ${port}`);
    });
}
startServer();
