import { Request, Response, NextFunction } from 'express';
import { CreditCardService } from '../service/creditCardService';
import { createLog, answerAPI, formatError } from '../utils/commons';
import { validateCreateCreditCard, validateUpdateCreditCard } from '../utils/validation/validateRequest';
import { LogCategory, HTTPStatus, LogOperation, LogType } from '../utils/enum';
import { Resource } from '../utils/resources/resource';
import { parsePagination, buildMeta } from '../utils/pagination';
import { LanguageCode } from '../utils/resources/resourceTypes';

/** @summary Handles HTTP requests for credit card resources. */
class CreditCardController {
    /** @summary Creates a credit card using validated input. */
    static async createCreditCard(req: Request, res: Response, next: NextFunction) {
        const creditCardService = new CreditCardService();

        try {
            const parseResult = validateCreateCreditCard(req.body, req.language as LanguageCode);

            if (!parseResult.success) {
                return answerAPI(
                    req,
                    res,
                    HTTPStatus.BAD_REQUEST,
                    parseResult.errors,
                    Resource.VALIDATION_ERROR
                );
            }

            const created = await creditCardService.createCreditCard(parseResult.data);

            if (!created.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, created.error);
            }

            await createLog(LogType.SUCCESS, LogOperation.CREATE, LogCategory.CREDIT_CARD, created.data, created.data!.userId);
            return answerAPI(req, res, HTTPStatus.CREATED, created.data!);
        } catch (error) {
            await createLog(LogType.ERROR, LogOperation.CREATE, LogCategory.CREDIT_CARD, formatError(error), req.user?.id, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
        }
    }

    /** @summary Retrieves all credit cards with optional pagination. */
    static async getCreditCards(req: Request, res: Response, next: NextFunction) {
        const creditCardService = new CreditCardService();

        try {
            const { page, pageSize, limit, offset, sort, order } = parsePagination(req.query);
            const [rows, total] = await Promise.all([
                creditCardService.getCreditCards({ limit, offset, sort, order }),
                creditCardService.countCreditCards()
            ]);

            if (!rows.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, rows.error);
            }

            if (!total.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, total.error);
            }

            return answerAPI(req, res, HTTPStatus.OK, {
                data: rows.data,
                meta: buildMeta({ page, pageSize, total: total.data })
            });
        } catch (error) {
            await createLog(LogType.ERROR, LogOperation.SEARCH, LogCategory.CREDIT_CARD, formatError(error), req.user?.id, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
        }
    }

    /** @summary Retrieves a credit card by its unique identifier. */
    static async getCreditCardById(req: Request, res: Response, next: NextFunction) {
        const id = Number(req.params.id);
        if (isNaN(id) || id <= 0) {
            return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, Resource.INVALID_CREDIT_CARD_ID);
        }

        const creditCardService = new CreditCardService();

        try {
            const creditCard = await creditCardService.getCreditCardById(id);

            if (!creditCard.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, creditCard.error);
            }

            return answerAPI(req, res, HTTPStatus.OK, creditCard.data);
        } catch (error) {
            await createLog(LogType.ERROR, LogOperation.SEARCH, LogCategory.CREDIT_CARD, formatError(error), req.user?.id, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
        }
    }

    /** @summary Retrieves all credit cards owned by a specific user. */
    static async getCreditCardsByUser(req: Request, res: Response, next: NextFunction) {
        const userId = Number(req.params.userId);
        if (isNaN(userId) || userId <= 0) {
            return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, Resource.INVALID_USER_ID);
        }

        const creditCardService = new CreditCardService();

        try {
            const { page, pageSize, limit, offset, sort, order } = parsePagination(req.query);
            const [rows, total] = await Promise.all([
                creditCardService.getCreditCardsByUser(userId, { limit, offset, sort, order }),
                creditCardService.countCreditCardsByUser(userId)
            ]);

            if (!rows.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, rows.error);
            }

            if (!total.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, total.error);
            }

            return answerAPI(req, res, HTTPStatus.OK, {
                data: rows.data,
                meta: buildMeta({ page, pageSize, total: total.data })
            });
        } catch (error) {
            await createLog(LogType.ERROR, LogOperation.SEARCH, LogCategory.CREDIT_CARD, formatError(error), req.user?.id, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
        }
    }

    /** @summary Updates credit card information using validated input. */
    static async updateCreditCard(req: Request, res: Response, next: NextFunction) {
        const id = Number(req.params.id);
        if (isNaN(id) || id <= 0) {
            return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, Resource.INVALID_CREDIT_CARD_ID);
        }

        const creditCardService = new CreditCardService();

        try {
            const existing = await creditCardService.getCreditCardById(id);
            if (!existing.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, existing.error);
            }

            const parseResult = validateUpdateCreditCard(req.body, req.language as LanguageCode);

            if (!parseResult.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, parseResult.errors, Resource.VALIDATION_ERROR);
            }

            const updated = await creditCardService.updateCreditCard(id, parseResult.data);
            if (!updated.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, updated.error);
            }

            await createLog(LogType.SUCCESS, LogOperation.UPDATE, LogCategory.CREDIT_CARD, updated.data, updated.data!.userId);
            return answerAPI(req, res, HTTPStatus.OK, updated.data!);
        } catch (error) {
            await createLog(LogType.ERROR, LogOperation.UPDATE, LogCategory.CREDIT_CARD, formatError(error), req.user?.id, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
        }
    }

    /** @summary Deletes a credit card by ID. */
    static async deleteCreditCard(req: Request, res: Response, next: NextFunction) {
        const id = Number(req.params.id);

        if (isNaN(id) || id <= 0) {
            return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, Resource.INVALID_CREDIT_CARD_ID);
        }

        const creditCardService = new CreditCardService();

        try {
            const result = await creditCardService.deleteCreditCard(id);

            if (!result.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, result.error);
            }

            await createLog(LogType.SUCCESS, LogOperation.DELETE, LogCategory.CREDIT_CARD, result.data, req.user?.id);
            return answerAPI(req, res, HTTPStatus.OK, result.data);
        } catch (error) {
            await createLog(LogType.ERROR, LogOperation.DELETE, LogCategory.CREDIT_CARD, formatError(error), req.user?.id, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
        }
    }
}

export default CreditCardController;

