"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const enum_1 = require("../utils/enum");
const commons_1 = require("../utils/commons");
const verifyToken_1 = require("../utils/auth/verifyToken");
const transactionController_1 = __importDefault(require("../controller/transactionController"));
const router = (0, express_1.Router)();
/**
 * @route POST /
 * @description Creates a new transaction. Requires authentication.
 */
router.post('/', verifyToken_1.verifyToken, async (req, res, next) => {
    var _a;
    try {
        await transactionController_1.default.createTransaction(req, res, next);
    }
    catch (error) {
        await (0, commons_1.createLog)(enum_1.LogType.DEBUG, enum_1.LogOperation.CREATE, enum_1.LogCategory.TRANSACTION, (0, commons_1.formatError)(error), (_a = req.body) === null || _a === void 0 ? void 0 : _a.account_id, next);
    }
});
/**
 * @route GET /
 * @description Lists all transactions in the system. Requires authentication.
 */
router.get('/', verifyToken_1.verifyToken, async (req, res, next) => {
    try {
        await transactionController_1.default.getTransactions(req, res, next);
    }
    catch (error) {
        await (0, commons_1.createLog)(enum_1.LogType.DEBUG, enum_1.LogOperation.SEARCH, enum_1.LogCategory.TRANSACTION, (0, commons_1.formatError)(error), undefined, next);
    }
});
/**
 * @route GET /:id
 * @description Retrieves an transaction by ID. Requires authentication.
 */
router.get('/:id', verifyToken_1.verifyToken, async (req, res, next) => {
    try {
        await transactionController_1.default.getTransactionById(req, res, next);
    }
    catch (error) {
        await (0, commons_1.createLog)(enum_1.LogType.DEBUG, enum_1.LogOperation.SEARCH, enum_1.LogCategory.TRANSACTION, (0, commons_1.formatError)(error), Number(req.params.id) || undefined, next);
    }
});
/**
 * @route GET /account/:accountId
 * @description Lists all transactions for a specific account. Requires authentication.
 */
router.get('/account/:accountId', verifyToken_1.verifyToken, async (req, res, next) => {
    try {
        await transactionController_1.default.getTransactionsByAccount(req, res, next);
    }
    catch (error) {
        await (0, commons_1.createLog)(enum_1.LogType.DEBUG, enum_1.LogOperation.SEARCH, enum_1.LogCategory.TRANSACTION, (0, commons_1.formatError)(error), Number(req.params.accountId) || undefined, next);
    }
});
/**
 * @route GET /user/:userId
 * @description Lists all transactions grouped by accounts for a specific user. Requires authentication.
 */
router.get('/user/:userId', verifyToken_1.verifyToken, async (req, res, next) => {
    try {
        await transactionController_1.default.getTransactionsByUser(req, res, next);
    }
    catch (error) {
        await (0, commons_1.createLog)(enum_1.LogType.DEBUG, enum_1.LogOperation.SEARCH, enum_1.LogCategory.TRANSACTION, (0, commons_1.formatError)(error), Number(req.params.userId) || undefined, next);
    }
});
/**
 * @route PUT /:id
 * @description Updates an transaction by ID. Requires authentication.
 */
router.put('/:id', verifyToken_1.verifyToken, async (req, res, next) => {
    try {
        await transactionController_1.default.updateTransaction(req, res, next);
    }
    catch (error) {
        await (0, commons_1.createLog)(enum_1.LogType.DEBUG, enum_1.LogOperation.UPDATE, enum_1.LogCategory.TRANSACTION, (0, commons_1.formatError)(error), Number(req.params.id) || undefined, next);
    }
});
/**
 * @route DELETE /:id
 * @description Deletes an transaction by ID. Requires authentication.
 */
router.delete('/:id', verifyToken_1.verifyToken, async (req, res, next) => {
    try {
        await transactionController_1.default.deleteTransaction(req, res, next);
    }
    catch (error) {
        await (0, commons_1.createLog)(enum_1.LogType.DEBUG, enum_1.LogOperation.DELETE, enum_1.LogCategory.TRANSACTION, (0, commons_1.formatError)(error), Number(req.params.id) || undefined, next);
    }
});
exports.default = router;
