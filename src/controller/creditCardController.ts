import { Request, Response, NextFunction } from 'express';
import { CreditCardService } from '../service/creditCardService';
import { formatZodValidationErrors, createLog, answerAPI, formatError, validateSchema } from '../utils/commons';
import { createCreditCardSchema, updateCreditCardSchema } from '../model/creditCard/creditCardSchema';
import { LogCategory, HTTPStatus, LogOperation, LogType } from '../utils/enum';
import { Resource } from '../utils/resources/resource';
import { parsePagination, buildMeta } from '../utils/pagination';
import { LanguageCode } from '../utils/resources/resourceTypes';

class CreditCardController {
    static async createCreditCard(req: Request, res: Response, next: NextFunction) {
        const creditCardService = new CreditCardService();

        try {
            const parseResult = validateSchema(createCreditCardSchema, req.body, req.language as LanguageCode);

            if (!parseResult.success) {
                return answerAPI(
                    req,
                    res,
                    HTTPStatus.BAD_REQUEST,
                    formatZodValidationErrors(parseResult.error),
                    Resource.VALIDATION_ERROR
                );
            }

            const created = await creditCardService.createCreditCard(parseResult.data);

            if (!created.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, created.error);
            }

            await createLog(LogType.SUCCESS, LogOperation.CREATE, LogCategory.CREDIT_CARD, created.data, created.data!.user_id);
            return answerAPI(req, res, HTTPStatus.CREATED, created.data!);
        } catch (error) {
            await createLog(LogType.ERROR, LogOperation.CREATE, LogCategory.CREDIT_CARD, formatError(error), undefined, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
        }
    }

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

            return answerAPI(req, res, HTTPStatus.OK, {
                data: rows.data,
                meta: buildMeta({ page, pageSize, total: total.data ?? 0 })
            });
        } catch (error) {
            await createLog(LogType.ERROR, LogOperation.SEARCH, LogCategory.CREDIT_CARD, formatError(error), undefined, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
        }
    }

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
            await createLog(LogType.ERROR, LogOperation.SEARCH, LogCategory.CREDIT_CARD, formatError(error), id, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
        }
    }

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

            return answerAPI(req, res, HTTPStatus.OK, {
                data: rows.data,
                meta: buildMeta({ page, pageSize, total: total.data ?? 0 })
            });
        } catch (error) {
            await createLog(LogType.ERROR, LogOperation.SEARCH, LogCategory.CREDIT_CARD, formatError(error), userId, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
        }
    }

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

            const parseResult = validateSchema(updateCreditCardSchema, req.body, req.language as LanguageCode);

            if (!parseResult.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, formatZodValidationErrors(parseResult.error), Resource.VALIDATION_ERROR);
            }

            const updated = await creditCardService.updateCreditCard(id, parseResult.data);
            if (!updated.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, updated.error);
            }

            await createLog(LogType.SUCCESS, LogOperation.UPDATE, LogCategory.CREDIT_CARD, updated.data, updated.data!.user_id);
            return answerAPI(req, res, HTTPStatus.OK, updated.data!);
        } catch (error) {
            await createLog(LogType.ERROR, LogOperation.UPDATE, LogCategory.CREDIT_CARD, formatError(error), id, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
        }
    }

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

            await createLog(LogType.SUCCESS, LogOperation.DELETE, LogCategory.CREDIT_CARD, result.data, result.data?.id);
            return answerAPI(req, res, HTTPStatus.OK, result.data);
        } catch (error) {
            await createLog(LogType.ERROR, LogOperation.DELETE, LogCategory.CREDIT_CARD, formatError(error), id, next);
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
        }
    }
}

export default CreditCardController;

