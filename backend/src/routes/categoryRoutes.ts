import { Router, Request, Response, NextFunction } from 'express';
import { LogType, LogOperation, LogCategory } from '../../../shared/enums';
import { createLog, formatError } from '../utils/commons';
import { verifyToken } from '../utils/auth/verifyToken';
import CategoryController from '../controller/categoryController';

const router = Router();

/**
 * @route POST /
 * @description Creates a new category. Requires authentication.
 */
router.post('/', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await CategoryController.createCategory(req, res, next);
    } catch (error) {
        await createLog(
            LogType.DEBUG,
            LogOperation.CREATE,
            LogCategory.CATEGORY,
            formatError(error),
            req.body?.user_id,
            next
        );
    }
});

/**
 * @route GET /
 * @description Lists all categories in the system. Requires authentication.
 */
router.get('/', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await CategoryController.getCategories(req, res, next);
    } catch (error) {
        await createLog(
            LogType.DEBUG,
            LogOperation.CREATE,
            LogCategory.CATEGORY,
            formatError(error),
            undefined,
            next
        );
    }
});

/**
 * @route GET /:id
 * @description Retrieves a category by ID. Requires authentication.
 */
router.get('/:id', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await CategoryController.getCategoryById(req, res, next);
    } catch (error) {
        await createLog(
            LogType.DEBUG,
            LogOperation.CREATE,
            LogCategory.CATEGORY,
            formatError(error),
            Number(req.params.id) || undefined,
            next
        );
    }
});

/**
 * @route GET /user/:userId
 * @description Lists all categories created by a specific user. Requires authentication.
 */
router.get('/user/:userId', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await CategoryController.getCategoriesByUser(req, res, next);
    } catch (error) {
        await createLog(
            LogType.DEBUG,
            LogOperation.CREATE,
            LogCategory.CATEGORY,
            formatError(error),
            Number(req.params.userId) || undefined,
            next
        );
    }
});

/**
 * @route PUT /:id
 * @description Updates a category by ID. Requires authentication.
 */
router.put('/:id', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await CategoryController.updateCategory(req, res, next);
    } catch (error) {
        await createLog(
            LogType.DEBUG,
            LogOperation.UPDATE,
            LogCategory.CATEGORY,
            formatError(error),
            Number(req.params.id) || undefined,
            next
        );
    }
});

/**
 * @route DELETE /:id
 * @description Deletes a category by ID. Requires authentication.
 */
router.delete('/:id', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await CategoryController.deleteCategory(req, res, next);
    } catch (error) {
        await createLog(
            LogType.DEBUG,
            LogOperation.DELETE,
            LogCategory.CATEGORY,
            formatError(error),
            Number(req.params.id) || undefined,
            next
        );
    }
});

export default router;
