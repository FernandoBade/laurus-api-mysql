import { Router, Request, Response, NextFunction } from 'express';
import { LogType, LogOperation, LogCategory } from '../utils/enum';
import { createLog, formatError } from '../utils/commons';
import { verifyToken } from '../utils/auth/verifyToken';
import TransactionController from '../controller/transactionController';

const router = Router();

/**
 * @route POST /
 * @description Creates a new transaction. Requires authentication.
 */
router.post('/', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await TransactionController.createTransaction(req, res, next);
    } catch (error) {
        await createLog(
            LogType.DEBUG,
            LogOperation.CREATE,
            LogCategory.TRANSACTION,
            formatError(error),
            req.body?.account_id,
            next
        );
    }
});

/**
 * @route GET /
 * @description Lists all transactions in the system. Requires authentication.
 */
router.get('/', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await TransactionController.getTransactions(req, res, next);
    } catch (error) {
        await createLog(
            LogType.DEBUG,
            LogOperation.CREATE,
            LogCategory.TRANSACTION,
            formatError(error),
            undefined,
            next
        );
    }
});

/**
 * @route GET /:id
 * @description Retrieves an transaction by ID. Requires authentication.
 */
router.get('/:id', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await TransactionController.getTransactionById(req, res, next);
    } catch (error) {
        await createLog(
            LogType.DEBUG,
            LogOperation.CREATE,
            LogCategory.TRANSACTION,
            formatError(error),
            Number(req.params.id) || undefined,
            next
        );
    }
});

/**
 * @route GET /account/:accountId
 * @description Lists all transactions for a specific account. Requires authentication.
 */
router.get('/account/:accountId', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await TransactionController.getTransactionsByAccount(req, res, next);
    } catch (error) {
        await createLog(
            LogType.DEBUG,
            LogOperation.CREATE,
            LogCategory.TRANSACTION,
            formatError(error),
            Number(req.params.accountId) || undefined,
            next
        );
    }
});

/**
 * @route GET /user/:userId
 * @description Lists all transactions grouped by accounts for a specific user. Requires authentication.
 */
router.get('/user/:userId', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await TransactionController.getTransactionsByUser(req, res, next);
    } catch (error) {
        await createLog(
            LogType.DEBUG,
            LogOperation.CREATE,
            LogCategory.TRANSACTION,
            formatError(error),
            Number(req.params.userId) || undefined,
            next
        );
    }
});

/**
 * @route PUT /:id
 * @description Updates an transaction by ID. Requires authentication.
 */
router.put('/:id', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await TransactionController.updateTransaction(req, res, next);
    } catch (error) {
        await createLog(
            LogType.DEBUG,
            LogOperation.UPDATE,
            LogCategory.TRANSACTION,
            formatError(error),
            Number(req.params.id) || undefined,
            next
        );
    }
});

/**
 * @route DELETE /:id
 * @description Deletes an transaction by ID. Requires authentication.
 */
router.delete('/:id', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await TransactionController.deleteTransaction(req, res, next);
    } catch (error) {
        await createLog(
            LogType.DEBUG,
            LogOperation.DELETE,
            LogCategory.TRANSACTION,
            formatError(error),
            Number(req.params.id) || undefined,
            next
        );
    }
});

export default router;
