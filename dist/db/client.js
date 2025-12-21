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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.withTransaction = withTransaction;
const promise_1 = __importDefault(require("mysql2/promise"));
const mysql2_1 = require("drizzle-orm/mysql2");
const dotenv_1 = __importDefault(require("dotenv"));
const schema = __importStar(require("./schema"));
dotenv_1.default.config();
/**
 * Creates and exports a MySQL connection pool using environment variables.
 * Manages connection pooling for performance and scalability.
 */
const pool = promise_1.default.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});
/**
 * Drizzle database instance with schema types.
 * Provides type-safe database access using Drizzle ORM.
 */
exports.db = (0, mysql2_1.drizzle)(pool, { mode: 'default', schema });
/**
 * Executes a function within a database transaction.
 * Automatically commits on success or rolls back on error.
 *
 * @summary Executes operations within a database transaction.
 * @param callback - Function to execute within the transaction.
 * @returns The result of the callback function.
 * @throws Re-throws any error that occurs during transaction execution.
 */
async function withTransaction(callback) {
    // The Drizzle transaction callback provides a transaction object (tx),
    // which is not the same as the full db instance (missing . $client, etc).
    // We need to cast tx to the db type but also supply a fake $client, though
    // it's only required for type compatibility in callbacks that expect db.
    // If your code relies on db.$client or anything else not present on tx,
    // you'll need to provide a more advanced adapter here.
    // For now, we cast tx to type 'typeof db' to suppress type errors.
    return await exports.db.transaction(async (tx) => {
        return await callback(tx);
    });
}
exports.default = exports.db;
