import { Router, Request, Response, NextFunction } from 'express';
import { AuthController } from '../controller/authController';
import { createLog, formatError } from '../utils/commons';
import { LogType, LogCategory, LogOperation } from '../utils/enum';

const router = Router();

/**
 * @route POST /login
 * @description Authenticates a user and sets a refresh token cookie.
 */
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await AuthController.login(req, res, next);
    } catch (error) {
        await createLog(
            LogType.ERROR,
            LogOperation.LOGIN,
            LogCategory.AUTH,
            {
                error: formatError(error),
                ip: req.ip,
                userAgent: req.headers['user-agent']
            },
            undefined,
            next
        );
    }
});

/**
 * @route POST /refresh
 * @description Issues a new access token using a valid refresh token from cookies.
 */
router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await AuthController.refresh(req, res, next);
    } catch (error) {
        await createLog(LogType.ERROR, LogOperation.UPDATE, LogCategory.AUTH, formatError(error), undefined, next);
    }
});

/**
 * @route POST /logout
 * @description Logs out the user by revoking the refresh token and clearing the cookie.
 */
router.post('/logout', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await AuthController.logout(req, res, next);
    } catch (error) {
        await createLog(LogType.ERROR, LogOperation.LOGOUT, LogCategory.AUTH, formatError(error), undefined, next);
    }
});

export default router;
