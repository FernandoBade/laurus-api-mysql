import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { verifyToken } from '../utils/auth/verifyToken';
import FeedbackController from '../controller/feedbackController';
import { answerAPI, createLog, formatError } from '../utils/commons';
import { HTTPStatus } from '../../../shared/enums/http-status.enums';
import { LogCategory, LogOperation, LogType } from '../../../shared/enums/log.enums';
import { ResourceKey as Resource } from '../../../shared/i18n/resource.keys';
import { createValidationError } from '../utils/validation/errors';
import { LanguageCode } from '../../../shared/i18n/resourceTypes';
import { translateResourceWithParams } from '../../../shared/i18n/resource.utils';

const router = Router();
const MAX_FEEDBACK_BYTES = 2 * 1024 * 1024;

const feedbackUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_FEEDBACK_BYTES },
});

const handleFeedbackUpload = (req: Request, res: Response, next: NextFunction) => {
    feedbackUpload.fields([
        { name: 'image', maxCount: 1 },
        { name: 'audio', maxCount: 1 },
    ])(req, res, (error: unknown) => {
        const language = req.language as LanguageCode;

        if (error instanceof multer.MulterError) {
            const fieldName = error.field ?? 'file';
            if (error.code === 'LIMIT_FILE_SIZE') {
                const errors = [
                    createValidationError(fieldName, translateResourceWithParams(Resource.INVALID_TYPE, language, {
                        path: fieldName,
                        expected: 'file size <= 2MB',
                        received: 'exceeds limit',
                    }))
                ];
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, errors, Resource.VALIDATION_ERROR);
            }

            const errors = [
                createValidationError(fieldName, translateResourceWithParams(Resource.INVALID_TYPE, language, {
                    path: fieldName,
                    expected: 'feedback attachment',
                    received: error.field ?? error.code,
                }))
            ];
            return answerAPI(req, res, HTTPStatus.BAD_REQUEST, errors, Resource.VALIDATION_ERROR);
        }

        if (error) {
            return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, Resource.INVALID_TYPE);
        }

        return next();
    });
};

/**
 * @route POST /
 * @description Sends beta feedback with optional attachments. Requires authentication.
 */
router.post('/', verifyToken, handleFeedbackUpload, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await FeedbackController.sendFeedback(req, res, next);
    } catch (error) {
        await createLog(
            LogType.DEBUG,
            LogOperation.CREATE,
            LogCategory.LOG,
            formatError(error),
            req.user?.id,
            next
        );
    }
});

export default router;

