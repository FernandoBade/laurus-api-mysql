"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const enum_1 = require("../utils/enum");
const commons_1 = require("../utils/commons");
const verifyToken_1 = require("../utils/auth/verifyToken");
const userController_1 = __importDefault(require("../controller/userController"));
const router = (0, express_1.Router)();
/**
 * @route GET /search
 * @description Searches for users by partial email. Requires authentication.
 */
router.get('/search', verifyToken_1.verifyToken, async (req, res, next) => {
    try {
        await userController_1.default.getUsersByEmail(req, res, next);
    }
    catch (error) {
        await (0, commons_1.createLog)(enum_1.LogType.DEBUG, enum_1.LogOperation.SEARCH, enum_1.LogCategory.USER, (0, commons_1.formatError)(error), undefined, next);
    }
});
/**
 * @route POST /
 * @description Creates a new user with validated input data.
 */
router.post('/', async (req, res, next) => {
    var _a;
    try {
        await userController_1.default.createUser(req, res, next);
    }
    catch (error) {
        await (0, commons_1.createLog)(enum_1.LogType.DEBUG, enum_1.LogOperation.CREATE, enum_1.LogCategory.USER, (0, commons_1.formatError)(error), (_a = req.body) === null || _a === void 0 ? void 0 : _a.userId, next);
    }
});
/**
 * @route GET /:id
 * @description Retrieves a user by ID. Requires authentication.
 */
router.get('/:id', verifyToken_1.verifyToken, async (req, res, next) => {
    try {
        await userController_1.default.getUserById(req, res, next);
    }
    catch (error) {
        await (0, commons_1.createLog)(enum_1.LogType.DEBUG, enum_1.LogOperation.SEARCH, enum_1.LogCategory.USER, (0, commons_1.formatError)(error), Number(req.params.id) || undefined, next);
    }
});
/**
 * @route GET /
 * @description Lists all users in the system. Requires authentication.
 */
router.get('/', verifyToken_1.verifyToken, async (req, res, next) => {
    try {
        await userController_1.default.getUsers(req, res, next);
    }
    catch (error) {
        await (0, commons_1.createLog)(enum_1.LogType.DEBUG, enum_1.LogOperation.SEARCH, enum_1.LogCategory.USER, (0, commons_1.formatError)(error), undefined, next);
    }
});
/**
 * @route PUT /:id
 * @description Updates an existing user by ID. Requires authentication.
 */
router.put('/:id?', verifyToken_1.verifyToken, async (req, res, next) => {
    try {
        await userController_1.default.updateUser(req, res, next);
    }
    catch (error) {
        await (0, commons_1.createLog)(enum_1.LogType.DEBUG, enum_1.LogOperation.UPDATE, enum_1.LogCategory.USER, (0, commons_1.formatError)(error), Number(req.params.id) || undefined, next);
    }
});
/**
 * @route DELETE /:id
 * @description Deletes a user by ID. Requires authentication.
 */
router.delete('/:id?', verifyToken_1.verifyToken, async (req, res, next) => {
    try {
        await userController_1.default.deleteUser(req, res, next);
    }
    catch (error) {
        await (0, commons_1.createLog)(enum_1.LogType.DEBUG, enum_1.LogOperation.DELETE, enum_1.LogCategory.USER, JSON.stringify(error), Number(req.params.id) || undefined, next);
    }
});
exports.default = router;
