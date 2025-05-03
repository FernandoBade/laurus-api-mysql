import { Router, Request, Response, NextFunction } from 'express';
import { LogType, LogOperation, LogCategory } from '../utils/enum';
import { createLog, formatError } from '../utils/commons';
import { verifyToken } from '../utils/auth/verifyToken';
import UserController from '../controller/userController';

const router = Router();

/**
 * Searches for users by email.
 */
router.get('/search', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await UserController.getUsersByEmail(req, res, next);
    } catch (error) {
        await createLog(
            LogType.DEBUG,
            LogOperation.SEARCH,
            LogCategory.USER,
            formatError(error),
            undefined,
            next
        );
    }
});

/**
 * Creates a new user.
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
 * Retrieves a user by ID.
 */
router.get('/:id', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await UserController.getUserById(req, res, next);
    } catch (error) {
        await createLog(
            LogType.DEBUG,
            LogOperation.SEARCH,
            LogCategory.USER,
            formatError(error),
            Number(req.params.id) || undefined,
            next
        );
    }
});

/**
 * Retrieves all users.
 */
router.get('/', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await UserController.getUsers(req, res, next);
    } catch (error) {
        await createLog(
            LogType.DEBUG,
            LogOperation.SEARCH,
            LogCategory.USER,
            formatError(error),
            undefined,
            next
        );
    }
});

/**
 * Updates a user by ID.
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
 * Deletes a user by ID.
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