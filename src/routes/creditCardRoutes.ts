import { Router, Request, Response, NextFunction } from 'express';
import { LogType, LogOperation, LogCategory } from '../utils/enum';
import { createLog, formatError } from '../utils/commons';
import { verifyToken } from '../utils/auth/verifyToken';
import CreditCardController from '../controller/creditCardController';

const router = Router();

router.post('/', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await CreditCardController.createCreditCard(req, res, next);
    } catch (error) {
        await createLog(
            LogType.DEBUG,
            LogOperation.CREATE,
            LogCategory.CREDIT_CARD,
            formatError(error),
            req.body?.user_id,
            next
        );
    }
});

router.get('/', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await CreditCardController.getCreditCards(req, res, next);
    } catch (error) {
        await createLog(
            LogType.DEBUG,
            LogOperation.CREATE,
            LogCategory.CREDIT_CARD,
            formatError(error),
            undefined,
            next
        );
    }
});

router.get('/user/:userId', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await CreditCardController.getCreditCardsByUser(req, res, next);
    } catch (error) {
        await createLog(
            LogType.DEBUG,
            LogOperation.CREATE,
            LogCategory.CREDIT_CARD,
            formatError(error),
            Number(req.params.userId) || undefined,
            next
        );
    }
});

router.get('/:id', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await CreditCardController.getCreditCardById(req, res, next);
    } catch (error) {
        await createLog(
            LogType.DEBUG,
            LogOperation.CREATE,
            LogCategory.CREDIT_CARD,
            formatError(error),
            Number(req.params.id) || undefined,
            next
        );
    }
});

router.put('/:id', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await CreditCardController.updateCreditCard(req, res, next);
    } catch (error) {
        await createLog(
            LogType.DEBUG,
            LogOperation.UPDATE,
            LogCategory.CREDIT_CARD,
            formatError(error),
            Number(req.params.id) || undefined,
            next
        );
    }
});

router.delete('/:id', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await CreditCardController.deleteCreditCard(req, res, next);
    } catch (error) {
        await createLog(
            LogType.DEBUG,
            LogOperation.DELETE,
            LogCategory.CREDIT_CARD,
            formatError(error),
            Number(req.params.id) || undefined,
            next
        );
    }
});

export default router;

