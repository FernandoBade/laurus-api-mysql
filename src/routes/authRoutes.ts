import { Router, Request, Response, NextFunction } from 'express';
import { AuthController } from '../controller/authController';
import { createLog, formatError } from '../utils/commons';
import { LogType, LogCategory, LogOperation } from '../utils/enum';

const router = Router();

/**
 * Login route: authenticates a user and sets the refresh token in the cookie.
 */
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await AuthController.login(req, res, next);
    } catch (error) {
        await createLog(LogType.ERROR, LogOperation.LOGIN, LogCategory.AUTH, formatError(error), undefined, next);
    }
});

/**
 * Refresh route: issues a new access token from a valid refresh token.
 */
router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await AuthController.refresh(req, res, next);
    } catch (error) {
        await createLog(LogType.ERROR, LogOperation.UPDATE, LogCategory.AUTH, formatError(error), undefined, next);
    }
});

/**
 * Logout route: clears the refresh token from the database and cookie.
 */
router.post('/logout', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await AuthController.logout(req, res, next);
    } catch (error) {
        await createLog(LogType.ERROR, LogOperation.LOGOUT, LogCategory.AUTH, formatError(error), undefined, next);
    }
});

export default router;
