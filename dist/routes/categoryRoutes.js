"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const enum_1 = require("../utils/enum");
const commons_1 = require("../utils/commons");
const verifyToken_1 = require("../utils/auth/verifyToken");
const categoryController_1 = __importDefault(require("../controller/categoryController"));
const router = (0, express_1.Router)();
/**
 * @route POST /
 * @description Creates a new category. Requires authentication.
 */
router.post('/', verifyToken_1.verifyToken, async (req, res, next) => {
    var _a;
    try {
        await categoryController_1.default.createCategory(req, res, next);
    }
    catch (error) {
        await (0, commons_1.createLog)(enum_1.LogType.DEBUG, enum_1.LogOperation.CREATE, enum_1.LogCategory.CATEGORY, (0, commons_1.formatError)(error), (_a = req.body) === null || _a === void 0 ? void 0 : _a.user_id, next);
    }
});
/**
 * @route GET /
 * @description Lists all categories in the system. Requires authentication.
 */
router.get('/', verifyToken_1.verifyToken, async (req, res, next) => {
    try {
        await categoryController_1.default.getCategories(req, res, next);
    }
    catch (error) {
        await (0, commons_1.createLog)(enum_1.LogType.DEBUG, enum_1.LogOperation.SEARCH, enum_1.LogCategory.CATEGORY, (0, commons_1.formatError)(error), undefined, next);
    }
});
/**
 * @route GET /:id
 * @description Retrieves a category by ID. Requires authentication.
 */
router.get('/:id', verifyToken_1.verifyToken, async (req, res, next) => {
    try {
        await categoryController_1.default.getCategoryById(req, res, next);
    }
    catch (error) {
        await (0, commons_1.createLog)(enum_1.LogType.DEBUG, enum_1.LogOperation.SEARCH, enum_1.LogCategory.CATEGORY, (0, commons_1.formatError)(error), Number(req.params.id) || undefined, next);
    }
});
/**
 * @route GET /user/:userId
 * @description Lists all categories created by a specific user. Requires authentication.
 */
router.get('/user/:userId', verifyToken_1.verifyToken, async (req, res, next) => {
    try {
        await categoryController_1.default.getCategoriesByUser(req, res, next);
    }
    catch (error) {
        await (0, commons_1.createLog)(enum_1.LogType.DEBUG, enum_1.LogOperation.SEARCH, enum_1.LogCategory.CATEGORY, (0, commons_1.formatError)(error), Number(req.params.userId) || undefined, next);
    }
});
/**
 * @route PUT /:id
 * @description Updates a category by ID. Requires authentication.
 */
router.put('/:id', verifyToken_1.verifyToken, async (req, res, next) => {
    try {
        await categoryController_1.default.updateCategory(req, res, next);
    }
    catch (error) {
        await (0, commons_1.createLog)(enum_1.LogType.DEBUG, enum_1.LogOperation.UPDATE, enum_1.LogCategory.CATEGORY, (0, commons_1.formatError)(error), Number(req.params.id) || undefined, next);
    }
});
/**
 * @route DELETE /:id
 * @description Deletes a category by ID. Requires authentication.
 */
router.delete('/:id', verifyToken_1.verifyToken, async (req, res, next) => {
    try {
        await categoryController_1.default.deleteCategory(req, res, next);
    }
    catch (error) {
        await (0, commons_1.createLog)(enum_1.LogType.DEBUG, enum_1.LogOperation.DELETE, enum_1.LogCategory.CATEGORY, (0, commons_1.formatError)(error), Number(req.params.id) || undefined, next);
    }
});
exports.default = router;
