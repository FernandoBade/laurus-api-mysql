import { Router, Request, Response, NextFunction } from 'express';
import { LogType, LogOperation, LogCategory } from '../../../shared/enums/log.enums';
import { createLog, formatError } from '../utils/commons';
import { verifyToken } from '../utils/auth/verifyToken';
import AccountController from '../controller/accountController';

const router = Router();

/**
 * @route POST /
 * @description Creates a new financial account with validated input data. Requires authentication.
 */
router.post('/', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await AccountController.createAccount(req, res, next);
    } catch (error) {
        await createLog(
            LogType.DEBUG,
            LogOperation.CREATE,
            LogCategory.ACCOUNT,
            formatError(error),
            req.body?.userId,
            next
        );
    }
});

/**
 * @route GET /
 * @description Lists all financial accounts in the system. Requires authentication.
 */
router.get('/', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await AccountController.getAccounts(req, res, next);
    } catch (error) {
        await createLog(
            LogType.DEBUG,
            LogOperation.CREATE,
            LogCategory.ACCOUNT,
            formatError(error),
            undefined,
            next
        );
    }
});

/**
 * @route GET /user/:userId
 * @description Retrieves all accounts linked to a specific user. Requires authentication.
 */
router.get('/user/:userId', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await AccountController.getAccountsByUser(req, res, next);
    } catch (error) {
        await createLog(
            LogType.DEBUG,
            LogOperation.CREATE,
            LogCategory.ACCOUNT,
            formatError(error),
            Number(req.params.userId) || undefined,
            next
        );
    }
});

/**
 * @route GET /:id
 * @description Retrieves a specific account by ID. Requires authentication.
 */
router.get('/:id', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await AccountController.getAccountById(req, res, next);
    } catch (error) {
        await createLog(
            LogType.DEBUG,
            LogOperation.CREATE,
            LogCategory.ACCOUNT,
            formatError(error),
            Number(req.params.id) || undefined,
            next
        );
    }
});

/**
 * @route PUT /:id
 * @description Updates an existing account by ID. Requires authentication.
 */
router.put('/:id', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await AccountController.updateAccount(req, res, next);
    } catch (error) {
        await createLog(
            LogType.DEBUG,
            LogOperation.UPDATE,
            LogCategory.ACCOUNT,
            formatError(error),
            Number(req.params.id) || undefined,
            next
        );
    }
});

/**
 * @route DELETE /:id
 * @description Deletes a financial account by ID. Requires authentication.
 */
router.delete('/:id', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await AccountController.deleteAccount(req, res, next);
    } catch (error) {
        await createLog(
            LogType.DEBUG,
            LogOperation.DELETE,
            LogCategory.ACCOUNT,
            formatError(error),
            Number(req.params.id) || undefined,
            next
        );
    }
});

export default router;

