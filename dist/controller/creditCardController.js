"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const creditCardService_1 = require("../service/creditCardService");
const commons_1 = require("../utils/commons");
const validateRequest_1 = require("../utils/validation/validateRequest");
const enum_1 = require("../utils/enum");
const resource_1 = require("../utils/resources/resource");
const pagination_1 = require("../utils/pagination");
/** @summary Handles HTTP requests for credit card resources. */
class CreditCardController {
    /** @summary Creates a credit card using validated input. */
    static async createCreditCard(req, res, next) {
        const creditCardService = new creditCardService_1.CreditCardService();
        try {
            const parseResult = (0, validateRequest_1.validateCreateCreditCard)(req.body, req.language);
            if (!parseResult.success) {
                return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, parseResult.errors, resource_1.Resource.VALIDATION_ERROR);
            }
            const created = await creditCardService.createCreditCard(parseResult.data);
            if (!created.success) {
                return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, created.error);
            }
            await (0, commons_1.createLog)(enum_1.LogType.SUCCESS, enum_1.LogOperation.CREATE, enum_1.LogCategory.CREDIT_CARD, created.data, created.data.userId);
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.CREATED, created.data);
        }
        catch (error) {
            await (0, commons_1.createLog)(enum_1.LogType.ERROR, enum_1.LogOperation.CREATE, enum_1.LogCategory.CREDIT_CARD, (0, commons_1.formatError)(error), undefined, next);
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.INTERNAL_SERVER_ERROR, undefined, resource_1.Resource.INTERNAL_SERVER_ERROR);
        }
    }
    /** @summary Retrieves all credit cards with optional pagination. */
    static async getCreditCards(req, res, next) {
        const creditCardService = new creditCardService_1.CreditCardService();
        try {
            const { page, pageSize, limit, offset, sort, order } = (0, pagination_1.parsePagination)(req.query);
            const [rows, total] = await Promise.all([
                creditCardService.getCreditCards({ limit, offset, sort, order }),
                creditCardService.countCreditCards()
            ]);
            if (!rows.success) {
                return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, rows.error);
            }
            if (!total.success) {
                return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, total.error);
            }
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.OK, {
                data: rows.data,
                meta: (0, pagination_1.buildMeta)({ page, pageSize, total: total.data })
            });
        }
        catch (error) {
            await (0, commons_1.createLog)(enum_1.LogType.ERROR, enum_1.LogOperation.SEARCH, enum_1.LogCategory.CREDIT_CARD, (0, commons_1.formatError)(error), undefined, next);
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.INTERNAL_SERVER_ERROR, undefined, resource_1.Resource.INTERNAL_SERVER_ERROR);
        }
    }
    /** @summary Retrieves a credit card by its unique identifier. */
    static async getCreditCardById(req, res, next) {
        const id = Number(req.params.id);
        if (isNaN(id) || id <= 0) {
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, resource_1.Resource.INVALID_CREDIT_CARD_ID);
        }
        const creditCardService = new creditCardService_1.CreditCardService();
        try {
            const creditCard = await creditCardService.getCreditCardById(id);
            if (!creditCard.success) {
                return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, creditCard.error);
            }
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.OK, creditCard.data);
        }
        catch (error) {
            await (0, commons_1.createLog)(enum_1.LogType.ERROR, enum_1.LogOperation.SEARCH, enum_1.LogCategory.CREDIT_CARD, (0, commons_1.formatError)(error), id, next);
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.INTERNAL_SERVER_ERROR, undefined, resource_1.Resource.INTERNAL_SERVER_ERROR);
        }
    }
    /** @summary Retrieves all credit cards owned by a specific user. */
    static async getCreditCardsByUser(req, res, next) {
        const userId = Number(req.params.userId);
        if (isNaN(userId) || userId <= 0) {
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, resource_1.Resource.INVALID_USER_ID);
        }
        const creditCardService = new creditCardService_1.CreditCardService();
        try {
            const { page, pageSize, limit, offset, sort, order } = (0, pagination_1.parsePagination)(req.query);
            const [rows, total] = await Promise.all([
                creditCardService.getCreditCardsByUser(userId, { limit, offset, sort, order }),
                creditCardService.countCreditCardsByUser(userId)
            ]);
            if (!rows.success) {
                return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, rows.error);
            }
            if (!total.success) {
                return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, total.error);
            }
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.OK, {
                data: rows.data,
                meta: (0, pagination_1.buildMeta)({ page, pageSize, total: total.data })
            });
        }
        catch (error) {
            await (0, commons_1.createLog)(enum_1.LogType.ERROR, enum_1.LogOperation.SEARCH, enum_1.LogCategory.CREDIT_CARD, (0, commons_1.formatError)(error), userId, next);
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.INTERNAL_SERVER_ERROR, undefined, resource_1.Resource.INTERNAL_SERVER_ERROR);
        }
    }
    /** @summary Updates credit card information using validated input. */
    static async updateCreditCard(req, res, next) {
        const id = Number(req.params.id);
        if (isNaN(id) || id <= 0) {
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, resource_1.Resource.INVALID_CREDIT_CARD_ID);
        }
        const creditCardService = new creditCardService_1.CreditCardService();
        try {
            const existing = await creditCardService.getCreditCardById(id);
            if (!existing.success) {
                return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, existing.error);
            }
            const parseResult = (0, validateRequest_1.validateUpdateCreditCard)(req.body, req.language);
            if (!parseResult.success) {
                return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, parseResult.errors, resource_1.Resource.VALIDATION_ERROR);
            }
            const updated = await creditCardService.updateCreditCard(id, parseResult.data);
            if (!updated.success) {
                return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, updated.error);
            }
            await (0, commons_1.createLog)(enum_1.LogType.SUCCESS, enum_1.LogOperation.UPDATE, enum_1.LogCategory.CREDIT_CARD, updated.data, updated.data.userId);
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.OK, updated.data);
        }
        catch (error) {
            await (0, commons_1.createLog)(enum_1.LogType.ERROR, enum_1.LogOperation.UPDATE, enum_1.LogCategory.CREDIT_CARD, (0, commons_1.formatError)(error), id, next);
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.INTERNAL_SERVER_ERROR, undefined, resource_1.Resource.INTERNAL_SERVER_ERROR);
        }
    }
    /** @summary Deletes a credit card by ID. */
    static async deleteCreditCard(req, res, next) {
        var _a;
        const id = Number(req.params.id);
        if (isNaN(id) || id <= 0) {
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, resource_1.Resource.INVALID_CREDIT_CARD_ID);
        }
        const creditCardService = new creditCardService_1.CreditCardService();
        try {
            const result = await creditCardService.deleteCreditCard(id);
            if (!result.success) {
                return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.BAD_REQUEST, undefined, result.error);
            }
            await (0, commons_1.createLog)(enum_1.LogType.SUCCESS, enum_1.LogOperation.DELETE, enum_1.LogCategory.CREDIT_CARD, result.data, (_a = result.data) === null || _a === void 0 ? void 0 : _a.id);
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.OK, result.data);
        }
        catch (error) {
            await (0, commons_1.createLog)(enum_1.LogType.ERROR, enum_1.LogOperation.DELETE, enum_1.LogCategory.CREDIT_CARD, (0, commons_1.formatError)(error), id, next);
            return (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.INTERNAL_SERVER_ERROR, undefined, resource_1.Resource.INTERNAL_SERVER_ERROR);
        }
    }
}
exports.default = CreditCardController;
