import { Request, Response, NextFunction } from 'express';
import { FeedbackService } from '../service/feedbackService';
import { UserService } from '../service/userService';
import { answerAPI, createLog, formatError } from '../utils/commons';
import { HTTPStatus, LogCategory, LogOperation, LogType } from '../../../shared/enums';
import { validateFeedbackRequest } from '../utils/validation/validateRequest';
import { createValidationError, ValidationError } from '../utils/validation/errors';
import { ResourceKey as Resource } from '../../../shared/i18n/resource.keys';
import type { LanguageCode } from '../../../shared/i18n/resourceTypes';
import type { FeedbackAttachmentInput } from '../utils/email/feedbackEmail';
import { translateResourceWithParams } from '../../../shared/i18n/resource.utils';

const ALLOWED_IMAGE_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/jpg',
    'image/pjpeg',
    'image/x-png',
]);
const ALLOWED_AUDIO_TYPES = new Set([
    'audio/webm',
    'audio/ogg',
    'audio/mpeg',
    'audio/mp4',
]);

const getFileMap = (files: Request['files']) =>
    files as Record<string, Express.Multer.File[]> | undefined;

const validateAttachmentTypes = (
    imageFile: Express.Multer.File | undefined,
    audioFile: Express.Multer.File | undefined,
    language?: LanguageCode
) => {
    const errors: ValidationError[] = [];

    if (imageFile && !ALLOWED_IMAGE_TYPES.has(imageFile.mimetype)) {
        errors.push(
            createValidationError(
                'image',
                translateResourceWithParams(Resource.INVALID_TYPE, language, {
                    path: 'image',
                    expected: 'image/png or image/jpeg',
                    received: imageFile.mimetype,
                })
            )
        );
    }

    if (audioFile && !ALLOWED_AUDIO_TYPES.has(audioFile.mimetype)) {
        errors.push(
            createValidationError(
                'audio',
                translateResourceWithParams(Resource.INVALID_TYPE, language, {
                    path: 'audio',
                    expected: 'audio/webm, audio/ogg, audio/mpeg, audio/mp4',
                    received: audioFile.mimetype,
                })
            )
        );
    }

    return errors;
};

const mapAttachment = (
    file: Express.Multer.File | undefined
): FeedbackAttachmentInput | undefined => {
    if (!file) {
        return undefined;
    }
    return {
        filename: file.originalname || file.filename || file.fieldname,
        content: file.buffer,
        contentType: file.mimetype,
    };
};

class FeedbackController {
    static async sendFeedback(req: Request, res: Response, next: NextFunction) {
        const feedbackService = new FeedbackService();
        const userService = new UserService();

        try {
            const userId = req.user?.id;
            if (!userId) {
                return answerAPI(req, res, HTTPStatus.UNAUTHORIZED, undefined, Resource.EXPIRED_OR_INVALID_TOKEN);
            }

            const parseResult = validateFeedbackRequest(req.body, req.language as LanguageCode);
            if (!parseResult.success) {
                return answerAPI(
                    req,
                    res,
                    HTTPStatus.BAD_REQUEST,
                    parseResult.errors,
                    Resource.VALIDATION_ERROR
                );
            }

            const files = getFileMap(req.files);
            const imageFile = files?.image?.[0];
            const audioFile = files?.audio?.[0];
            const fileErrors = validateAttachmentTypes(
                imageFile,
                audioFile,
                req.language as LanguageCode
            );

            if (fileErrors.length > 0) {
                return answerAPI(
                    req,
                    res,
                    HTTPStatus.BAD_REQUEST,
                    fileErrors,
                    Resource.VALIDATION_ERROR
                );
            }

            const userResult = await userService.findOne(userId);
            if (!userResult.success) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, userResult.error);
            }
            if (!userResult.data) {
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, Resource.USER_NOT_FOUND);
            }

            const attachments = [mapAttachment(imageFile), mapAttachment(audioFile)].filter(
                (attachment): attachment is FeedbackAttachmentInput => Boolean(attachment)
            );

            const result = await feedbackService.sendFeedback({
                userId,
                userEmail: userResult.data.email,
                title: parseResult.data.title,
                message: parseResult.data.message,
                language: req.language as LanguageCode,
                attachments: attachments.length > 0 ? attachments : undefined,
            });

            if (!result.success) {
                return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, result.error);
            }

            await createLog(
                LogType.SUCCESS,
                LogOperation.CREATE,
                LogCategory.LOG,
                {
                    event: 'FEEDBACK_SENT',
                    hasImage: Boolean(imageFile),
                    hasAudio: Boolean(audioFile),
                },
                userId
            );

            return answerAPI(req, res, HTTPStatus.OK, result.data);
        } catch (error) {
            await createLog(
                LogType.ERROR,
                LogOperation.CREATE,
                LogCategory.LOG,
                formatError(error),
                req.user?.id,
                next
            );
            return answerAPI(req, res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, Resource.INTERNAL_SERVER_ERROR);
        }
    }
}

export default FeedbackController;

