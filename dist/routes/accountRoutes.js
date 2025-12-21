"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const enum_1 = require("../utils/enum");
const commons_1 = require("../utils/commons");
const verifyToken_1 = require("../utils/auth/verifyToken");
const accountController_1 = __importDefault(require("../controller/accountController"));
const router = (0, express_1.Router)();
/**
 * @route POST /
 * @description Creates a new financial account with validated input data. Requires authentication.
 */
router.post('/', verifyToken_1.verifyToken, async (req, res, next) => {
    var _a;
    try {
        await accountController_1.default.createAccount(req, res, next);
    }
    catch (error) {
        await (0, commons_1.createLog)(enum_1.LogType.DEBUG, enum_1.LogOperation.CREATE, enum_1.LogCategory.ACCOUNT, (0, commons_1.formatError)(error), (_a = req.body) === null || _a === void 0 ? void 0 : _a.user_id, next);
    }
});
/**
 * @route GET /
 * @description Lists all financial accounts in the system. Requires authentication.
 */
router.get('/', verifyToken_1.verifyToken, async (req, res, next) => {
    try {
        await accountController_1.default.getAccounts(req, res, next);
    }
    catch (error) {
        await (0, commons_1.createLog)(enum_1.LogType.DEBUG, enum_1.LogOperation.SEARCH, enum_1.LogCategory.ACCOUNT, (0, commons_1.formatError)(error), undefined, next);
    }
});
/**
 * @route GET /user/:userId
 * @description Retrieves all accounts linked to a specific user. Requires authentication.
 */
router.get('/user/:userId', verifyToken_1.verifyToken, async (req, res, next) => {
    try {
        await accountController_1.default.getAccountsByUser(req, res, next);
    }
    catch (error) {
        await (0, commons_1.createLog)(enum_1.LogType.DEBUG, enum_1.LogOperation.SEARCH, enum_1.LogCategory.ACCOUNT, (0, commons_1.formatError)(error), Number(req.params.userId) || undefined, next);
    }
});
/**
 * @route GET /:id
 * @description Retrieves a specific account by ID. Requires authentication.
 */
router.get('/:id', verifyToken_1.verifyToken, async (req, res, next) => {
    try {
        await accountController_1.default.getAccountById(req, res, next);
    }
    catch (error) {
        await (0, commons_1.createLog)(enum_1.LogType.DEBUG, enum_1.LogOperation.SEARCH, enum_1.LogCategory.ACCOUNT, (0, commons_1.formatError)(error), Number(req.params.id) || undefined, next);
    }
});
/**
 * @route PUT /:id
 * @description Updates an existing account by ID. Requires authentication.
 */
router.put('/:id', verifyToken_1.verifyToken, async (req, res, next) => {
    try {
        await accountController_1.default.updateAccount(req, res, next);
    }
    catch (error) {
        await (0, commons_1.createLog)(enum_1.LogType.DEBUG, enum_1.LogOperation.UPDATE, enum_1.LogCategory.ACCOUNT, (0, commons_1.formatError)(error), Number(req.params.id) || undefined, next);
    }
});
/**
 * @route DELETE /:id
 * @description Deletes a financial account by ID. Requires authentication.
 */
router.delete('/:id', verifyToken_1.verifyToken, async (req, res, next) => {
    try {
        await accountController_1.default.deleteAccount(req, res, next);
    }
    catch (error) {
        await (0, commons_1.createLog)(enum_1.LogType.DEBUG, enum_1.LogOperation.DELETE, enum_1.LogCategory.ACCOUNT, (0, commons_1.formatError)(error), Number(req.params.id) || undefined, next);
    }
});
exports.default = router;
