import { Router, Request, Response, NextFunction } from 'express';
import { LogType, LogOperation, LogCategory } from '../../../shared/enums';
import { createLog, formatError } from '../utils/commons';
import { verifyToken } from '../utils/auth/verifyToken';
import SubcategoryController from '../controller/subcategoryController';

const router = Router();

/**
 * @route POST /
 * @description Creates a new subcategory. Requires authentication.
 */
router.post('/', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await SubcategoryController.createSubcategory(req, res, next);
    } catch (error) {
        await createLog(
            LogType.DEBUG,
            LogOperation.CREATE,
            LogCategory.CATEGORY,
            formatError(error),
            req.body?.category_id,
            next
        );
    }
});

/**
 * @route GET /
 * @description Lists all subcategories in the system. Requires authentication.
 */
router.get('/', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await SubcategoryController.getSubcategories(req, res, next);
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
 * @description Retrieves a subcategory by ID. Requires authentication.
 */
router.get('/:id', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await SubcategoryController.getSubcategoryById(req, res, next);
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
 * @route GET /category/:categoryId
 * @description Retrieves all subcategories under a specific category. Requires authentication.
 */
router.get('/category/:categoryId', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await SubcategoryController.getSubcategoriesByCategory(req, res, next);
    } catch (error) {
        await createLog(
            LogType.DEBUG,
            LogOperation.CREATE,
            LogCategory.CATEGORY,
            formatError(error),
            Number(req.params.categoryId) || undefined,
            next
        );
    }
});

/**
 * @route GET /user/:userId
 * @description Retrieves all subcategories linked to categories owned by a specific user. Requires authentication.
 */
router.get('/user/:userId', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await SubcategoryController.getSubcategoriesByUser(req, res, next);
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
 * @description Updates a subcategory by ID. Requires authentication.
 */
router.put('/:id', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await SubcategoryController.updateSubcategory(req, res, next);
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
 * @description Deletes a subcategory by ID. Requires authentication.
 */
router.delete('/:id', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await SubcategoryController.deleteSubcategory(req, res, next);
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
