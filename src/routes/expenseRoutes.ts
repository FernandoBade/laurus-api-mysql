import { Router, Request, Response, NextFunction } from 'express';
import { LogType, LogOperation, LogCategory } from '../utils/enum';
import { createLog, formatError } from '../utils/commons';
import { verifyToken } from '../utils/auth/verifyToken';
import ExpenseController from '../controller/expenseController';

const router = Router();

/**
 * @route POST /
 * @description Creates a new expense. Requires authentication.
 */
router.post('/', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await ExpenseController.createExpense(req, res, next);
    } catch (error) {
        await createLog(
            LogType.DEBUG,
            LogOperation.CREATE,
            LogCategory.EXPENSE,
            formatError(error),
            req.body?.account_id,
            next
        );
    }
});

/**
 * @route GET /
 * @description Lists all expenses in the system. Requires authentication.
 */
router.get('/', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await ExpenseController.getExpenses(req, res, next);
    } catch (error) {
        await createLog(
            LogType.DEBUG,
            LogOperation.SEARCH,
            LogCategory.EXPENSE,
            formatError(error),
            undefined,
            next
        );
    }
});

/**
 * @route GET /:id
 * @description Retrieves an expense by ID. Requires authentication.
 */
router.get('/:id', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await ExpenseController.getExpenseById(req, res, next);
    } catch (error) {
        await createLog(
            LogType.DEBUG,
            LogOperation.SEARCH,
            LogCategory.EXPENSE,
            formatError(error),
            Number(req.params.id) || undefined,
            next
        );
    }
});

/**
 * @route GET /account/:accountId
 * @description Lists all expenses for a specific account. Requires authentication.
 */
router.get('/account/:accountId', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await ExpenseController.getExpensesByAccount(req, res, next);
    } catch (error) {
        await createLog(
            LogType.DEBUG,
            LogOperation.SEARCH,
            LogCategory.EXPENSE,
            formatError(error),
            Number(req.params.accountId) || undefined,
            next
        );
    }
});

/**
 * @route GET /user/:userId
 * @description Lists all expenses grouped by accounts for a specific user. Requires authentication.
 */
router.get('/user/:userId', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await ExpenseController.getExpensesByUser(req, res, next);
    } catch (error) {
        await createLog(
            LogType.DEBUG,
            LogOperation.SEARCH,
            LogCategory.EXPENSE,
            formatError(error),
            Number(req.params.userId) || undefined,
            next
        );
    }
});

/**
 * @route PUT /:id
 * @description Updates an expense by ID. Requires authentication.
 */
router.put('/:id', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await ExpenseController.updateExpense(req, res, next);
    } catch (error) {
        await createLog(
            LogType.DEBUG,
            LogOperation.UPDATE,
            LogCategory.EXPENSE,
            formatError(error),
            Number(req.params.id) || undefined,
            next
        );
    }
});

/**
 * @route DELETE /:id
 * @description Deletes an expense by ID. Requires authentication.
 */
router.delete('/:id', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await ExpenseController.deleteExpense(req, res, next);
    } catch (error) {
        await createLog(
            LogType.DEBUG,
            LogOperation.DELETE,
            LogCategory.EXPENSE,
            formatError(error),
            Number(req.params.id) || undefined,
            next
        );
    }
});

export default router;
