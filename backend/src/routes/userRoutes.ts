import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { LogType, LogOperation, LogCategory, HTTPStatus } from '../utils/enum';
import { answerAPI, createLog, formatError } from '../utils/commons';
import { verifyToken } from '../utils/auth/verifyToken';
import UserController from '../controller/userController';
import { Resource } from '../utils/resources/resource';
import { ResourceBase } from '../utils/resources/languages/resourceService';
import { createValidationError } from '../utils/validation/errors';
import { LanguageCode } from '../utils/resources/resourceTypes';

const router = Router();
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const avatarUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_AVATAR_BYTES },
});

const handleAvatarUpload = (req: Request, res: Response, next: NextFunction) => {
    avatarUpload.single('avatar')(req, res, (error: unknown) => {
        const language = req.language as LanguageCode;

        if (error instanceof multer.MulterError) {
            if (error.code === 'LIMIT_FILE_SIZE') {
                const errors = [
                    createValidationError('avatar', ResourceBase.translateWithParams(Resource.INVALID_TYPE, language, {
                        path: 'avatar',
                        expected: 'file size <= 2MB',
                        received: 'exceeds limit',
                    }))
                ];
                return answerAPI(req, res, HTTPStatus.BAD_REQUEST, errors, Resource.VALIDATION_ERROR);
            }

            const errors = [
                createValidationError('avatar', ResourceBase.translateWithParams(Resource.INVALID_TYPE, language, {
                    path: 'avatar',
                    expected: 'avatar file',
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
 * @route GET /search
 * @description Searches for users by partial email. Requires authentication.
 */
router.get('/search', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await UserController.getUsersByEmail(req, res, next);
    } catch (error) {
        await createLog(
            LogType.DEBUG,
            LogOperation.CREATE,
            LogCategory.USER,
            formatError(error),
            undefined,
            next
        );
    }
});

/**
 * @route POST /
 * @description Creates a new user with validated input data.
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await UserController.createUser(req, res, next);
    } catch (error) {
        await createLog(
            LogType.DEBUG,
            LogOperation.CREATE,
            LogCategory.USER,
            formatError(error),
            req.body?.userId,
            next
        );
    }
});

/**
 * @route POST /upload/avatar
 * @description Uploads an avatar for the authenticated user.
 */
router.post('/upload/avatar', verifyToken, handleAvatarUpload, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await UserController.uploadAvatar(req, res, next);
    } catch (error) {
        await createLog(
            LogType.DEBUG,
            LogOperation.UPDATE,
            LogCategory.USER,
            formatError(error),
            req.user?.id,
            next
        );
    }
});

/**
 * @route GET /:id
 * @description Retrieves a user by ID. Requires authentication.
 */
router.get('/:id', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await UserController.getUserById(req, res, next);
    } catch (error) {
        await createLog(
            LogType.DEBUG,
            LogOperation.CREATE,
            LogCategory.USER,
            formatError(error),
            Number(req.params.id) || undefined,
            next
        );
    }
});

/**
 * @route GET /
 * @description Lists all users in the system. Requires authentication.
 */
router.get('/', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await UserController.getUsers(req, res, next);
    } catch (error) {
        await createLog(
            LogType.DEBUG,
            LogOperation.CREATE,
            LogCategory.USER,
            formatError(error),
            undefined,
            next
        );
    }
});

/**
 * @route PUT /:id
 * @description Updates an existing user by ID. Requires authentication.
 */
router.put('/:id?', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await UserController.updateUser(req, res, next);
    } catch (error) {
        await createLog(
            LogType.DEBUG,
            LogOperation.UPDATE,
            LogCategory.USER,
            formatError(error),
            Number(req.params.id) || undefined,
            next
        );
    }
});

/**
 * @route DELETE /:id
 * @description Deletes a user by ID. Requires authentication.
 */
router.delete('/:id?', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await UserController.deleteUser(req, res, next);
    } catch (error) {
        await createLog(
            LogType.DEBUG,
            LogOperation.DELETE,
            LogCategory.USER,
            JSON.stringify(error),
            Number(req.params.id) || undefined,
            next
        );
    }
});

export default router;
