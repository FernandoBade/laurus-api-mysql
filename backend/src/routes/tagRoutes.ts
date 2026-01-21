import { Router, Request, Response, NextFunction } from 'express';
import { LogType, LogOperation, LogCategory } from '../../../shared/enums';
import { createLog, formatError } from '../utils/commons';
import { verifyToken } from '../utils/auth/verifyToken';
import TagController from '../controller/tagController';

const router = Router();

/**
 * @route POST /
 * @description Creates a new tag. Requires authentication.
 */
router.post('/', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await TagController.createTag(req, res, next);
    } catch (error) {
        await createLog(
            LogType.DEBUG,
            LogOperation.CREATE,
            LogCategory.TAG,
            formatError(error),
            req.body?.userId,
            next
        );
    }
});

/**
 * @route GET /
 * @description Lists all tags in the system. Requires authentication.
 */
router.get('/', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await TagController.getTags(req, res, next);
    } catch (error) {
        await createLog(
            LogType.DEBUG,
            LogOperation.CREATE,
            LogCategory.TAG,
            formatError(error),
            undefined,
            next
        );
    }
});

/**
 * @route GET /:id
 * @description Retrieves a tag by ID. Requires authentication.
 */
router.get('/:id', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await TagController.getTagById(req, res, next);
    } catch (error) {
        await createLog(
            LogType.DEBUG,
            LogOperation.CREATE,
            LogCategory.TAG,
            formatError(error),
            Number(req.params.id) || undefined,
            next
        );
    }
});

/**
 * @route GET /user/:userId
 * @description Lists all tags created by a specific user. Requires authentication.
 */
router.get('/user/:userId', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await TagController.getTagsByUser(req, res, next);
    } catch (error) {
        await createLog(
            LogType.DEBUG,
            LogOperation.CREATE,
            LogCategory.TAG,
            formatError(error),
            Number(req.params.userId) || undefined,
            next
        );
    }
});

/**
 * @route PUT /:id
 * @description Updates a tag by ID. Requires authentication.
 */
router.put('/:id', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await TagController.updateTag(req, res, next);
    } catch (error) {
        await createLog(
            LogType.DEBUG,
            LogOperation.UPDATE,
            LogCategory.TAG,
            formatError(error),
            Number(req.params.id) || undefined,
            next
        );
    }
});

/**
 * @route DELETE /:id
 * @description Deletes a tag by ID. Requires authentication.
 */
router.delete('/:id', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await TagController.deleteTag(req, res, next);
    } catch (error) {
        await createLog(
            LogType.DEBUG,
            LogOperation.DELETE,
            LogCategory.TAG,
            formatError(error),
            Number(req.params.id) || undefined,
            next
        );
    }
});

export default router;

