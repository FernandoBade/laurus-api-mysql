"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const enum_1 = require("../utils/enum");
const commons_1 = require("../utils/commons");
const verifyToken_1 = require("../utils/auth/verifyToken");
const creditCardController_1 = __importDefault(require("../controller/creditCardController"));
const router = (0, express_1.Router)();
router.post('/', verifyToken_1.verifyToken, async (req, res, next) => {
    var _a;
    try {
        await creditCardController_1.default.createCreditCard(req, res, next);
    }
    catch (error) {
        await (0, commons_1.createLog)(enum_1.LogType.DEBUG, enum_1.LogOperation.CREATE, enum_1.LogCategory.CREDIT_CARD, (0, commons_1.formatError)(error), (_a = req.body) === null || _a === void 0 ? void 0 : _a.user_id, next);
    }
});
router.get('/', verifyToken_1.verifyToken, async (req, res, next) => {
    try {
        await creditCardController_1.default.getCreditCards(req, res, next);
    }
    catch (error) {
        await (0, commons_1.createLog)(enum_1.LogType.DEBUG, enum_1.LogOperation.SEARCH, enum_1.LogCategory.CREDIT_CARD, (0, commons_1.formatError)(error), undefined, next);
    }
});
router.get('/user/:userId', verifyToken_1.verifyToken, async (req, res, next) => {
    try {
        await creditCardController_1.default.getCreditCardsByUser(req, res, next);
    }
    catch (error) {
        await (0, commons_1.createLog)(enum_1.LogType.DEBUG, enum_1.LogOperation.SEARCH, enum_1.LogCategory.CREDIT_CARD, (0, commons_1.formatError)(error), Number(req.params.userId) || undefined, next);
    }
});
router.get('/:id', verifyToken_1.verifyToken, async (req, res, next) => {
    try {
        await creditCardController_1.default.getCreditCardById(req, res, next);
    }
    catch (error) {
        await (0, commons_1.createLog)(enum_1.LogType.DEBUG, enum_1.LogOperation.SEARCH, enum_1.LogCategory.CREDIT_CARD, (0, commons_1.formatError)(error), Number(req.params.id) || undefined, next);
    }
});
router.put('/:id', verifyToken_1.verifyToken, async (req, res, next) => {
    try {
        await creditCardController_1.default.updateCreditCard(req, res, next);
    }
    catch (error) {
        await (0, commons_1.createLog)(enum_1.LogType.DEBUG, enum_1.LogOperation.UPDATE, enum_1.LogCategory.CREDIT_CARD, (0, commons_1.formatError)(error), Number(req.params.id) || undefined, next);
    }
});
router.delete('/:id', verifyToken_1.verifyToken, async (req, res, next) => {
    try {
        await creditCardController_1.default.deleteCreditCard(req, res, next);
    }
    catch (error) {
        await (0, commons_1.createLog)(enum_1.LogType.DEBUG, enum_1.LogOperation.DELETE, enum_1.LogCategory.CREDIT_CARD, (0, commons_1.formatError)(error), Number(req.params.id) || undefined, next);
    }
});
exports.default = router;
