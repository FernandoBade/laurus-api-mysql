"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const enum_1 = require("../utils/enum");
const commons_1 = require("../utils/commons");
const verifyToken_1 = require("../utils/auth/verifyToken");
const subcategoryController_1 = __importDefault(require("../controller/subcategoryController"));
const router = (0, express_1.Router)();
/**
 * @route POST /
 * @description Creates a new subcategory. Requires authentication.
 */
router.post('/', verifyToken_1.verifyToken, async (req, res, next) => {
    var _a;
    try {
        await subcategoryController_1.default.createSubcategory(req, res, next);
    }
    catch (error) {
        await (0, commons_1.createLog)(enum_1.LogType.DEBUG, enum_1.LogOperation.CREATE, enum_1.LogCategory.CATEGORY, (0, commons_1.formatError)(error), (_a = req.body) === null || _a === void 0 ? void 0 : _a.category_id, next);
    }
});
/**
 * @route GET /
 * @description Lists all subcategories in the system. Requires authentication.
 */
router.get('/', verifyToken_1.verifyToken, async (req, res, next) => {
    try {
        await subcategoryController_1.default.getSubcategories(req, res, next);
    }
    catch (error) {
        await (0, commons_1.createLog)(enum_1.LogType.DEBUG, enum_1.LogOperation.SEARCH, enum_1.LogCategory.CATEGORY, (0, commons_1.formatError)(error), undefined, next);
    }
});
/**
 * @route GET /:id
 * @description Retrieves a subcategory by ID. Requires authentication.
 */
router.get('/:id', verifyToken_1.verifyToken, async (req, res, next) => {
    try {
        await subcategoryController_1.default.getSubcategoryById(req, res, next);
    }
    catch (error) {
        await (0, commons_1.createLog)(enum_1.LogType.DEBUG, enum_1.LogOperation.SEARCH, enum_1.LogCategory.CATEGORY, (0, commons_1.formatError)(error), Number(req.params.id) || undefined, next);
    }
});
/**
 * @route GET /category/:categoryId
 * @description Retrieves all subcategories under a specific category. Requires authentication.
 */
router.get('/category/:categoryId', verifyToken_1.verifyToken, async (req, res, next) => {
    try {
        await subcategoryController_1.default.getSubcategoriesByCategory(req, res, next);
    }
    catch (error) {
        await (0, commons_1.createLog)(enum_1.LogType.DEBUG, enum_1.LogOperation.SEARCH, enum_1.LogCategory.CATEGORY, (0, commons_1.formatError)(error), Number(req.params.categoryId) || undefined, next);
    }
});
/**
 * @route GET /user/:userId
 * @description Retrieves all subcategories linked to categories owned by a specific user. Requires authentication.
 */
router.get('/user/:userId', verifyToken_1.verifyToken, async (req, res, next) => {
    try {
        await subcategoryController_1.default.getSubcategoriesByUser(req, res, next);
    }
    catch (error) {
        await (0, commons_1.createLog)(enum_1.LogType.DEBUG, enum_1.LogOperation.SEARCH, enum_1.LogCategory.CATEGORY, (0, commons_1.formatError)(error), Number(req.params.userId) || undefined, next);
    }
});
/**
 * @route PUT /:id
 * @description Updates a subcategory by ID. Requires authentication.
 */
router.put('/:id', verifyToken_1.verifyToken, async (req, res, next) => {
    try {
        await subcategoryController_1.default.updateSubcategory(req, res, next);
    }
    catch (error) {
        await (0, commons_1.createLog)(enum_1.LogType.DEBUG, enum_1.LogOperation.UPDATE, enum_1.LogCategory.CATEGORY, (0, commons_1.formatError)(error), Number(req.params.id) || undefined, next);
    }
});
/**
 * @route DELETE /:id
 * @description Deletes a subcategory by ID. Requires authentication.
 */
router.delete('/:id', verifyToken_1.verifyToken, async (req, res, next) => {
    try {
        await subcategoryController_1.default.deleteSubcategory(req, res, next);
    }
    catch (error) {
        await (0, commons_1.createLog)(enum_1.LogType.DEBUG, enum_1.LogOperation.DELETE, enum_1.LogCategory.CATEGORY, (0, commons_1.formatError)(error), Number(req.params.id) || undefined, next);
    }
});
exports.default = router;
