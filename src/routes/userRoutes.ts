import { Router } from 'express';
import { verifyToken } from '../utils/auth/verifyToken';
import UserController from '../controller/userController';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

/**
 * @route GET /search
 * @description Searches for users by partial email. Requires authentication.
 */
router.get('/search', verifyToken, asyncHandler(UserController.getUsersByEmail));

/**
 * @route POST /
 * @description Creates a new user with validated input data.
 */
router.post('/', asyncHandler(UserController.createUser));

/**
 * @route GET /:id
 * @description Retrieves a user by ID. Requires authentication.
 */
router.get('/:id', verifyToken, asyncHandler(UserController.getUserById));

/**
 * @route GET /
 * @description Lists all users in the system. Requires authentication.
 */
router.get('/', verifyToken, asyncHandler(UserController.getUsers));

/**
 * @route PUT /:id
 * @description Updates an existing user by ID. Requires authentication.
 */
router.put('/:id?', verifyToken, asyncHandler(UserController.updateUser));

/**
 * @route DELETE /:id
 * @description Deletes a user by ID. Requires authentication.
 */
router.delete('/:id?', verifyToken, asyncHandler(UserController.deleteUser));

export default router;
