import { Router, Request, Response, NextFunction } from 'express';
import { LogType, Operation, LogCategory } from '../utils/enum';
import { createLog } from '../utils/commons';
import UserController from '../controller/userController';
const router = Router();

router.get('/search', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await UserController.getUsersByEmail(req, res, next);
    } catch (error) {
        await createLog(
            LogType.DEBUG,
            Operation.SEARCH,
            LogCategory.USER,
            JSON.stringify(error),
            undefined,
            next
        );
    }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await UserController.createUser(req, res, next);
    } catch (error) {
        await createLog(
            LogType.DEBUG,
            Operation.CREATION,
            LogCategory.USER,
            JSON.stringify(error),
            req.body?.userId,
            next
        );
    }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await UserController.getUserById(req, res, next);
    } catch (error) {
        await createLog(
            LogType.DEBUG,
            Operation.SEARCH,
            LogCategory.USER,
            JSON.stringify(error),
            req.params.id ? Number(req.params.id) : undefined,
            next
        );
    }
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await UserController.getUsers(req, res, next);
    } catch (error) {
        await createLog(
            LogType.DEBUG,
            Operation.SEARCH,
            LogCategory.USER,
            JSON.stringify(error),
            undefined,
            next
        );
    }
});

router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await UserController.updateUser(req, res, next);
    } catch (error) {
        await createLog(
            LogType.DEBUG,
            Operation.UPDATE,
            LogCategory.USER,
            JSON.stringify(error),
            req.params.id ? Number(req.params.id) : undefined,
            next
        );
    }
});

router.delete('/:id?', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await UserController.deleteUser(req, res, next);
    } catch (error) {
        await createLog(
            LogType.DEBUG,
            Operation.DELETION,
            LogCategory.USER,
            JSON.stringify(error),
            req.params.id ? Number(req.params.id) : undefined,
            next
        );
    }
});

export default router;