/**
 * @openapi
 * /subcategories:
 *   post:
 *     summary: Create a new subcategory
 *     tags:
 *       - Subcategories
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category_id
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the subcategory. E.g. "Supermarket"
 *               category_id:
 *                 type: integer
 *                 description: ID of the parent category (must be active)
 *               active:
 *                 type: boolean
 *                 description: Whether the subcategory is active. Defaults to true.
 *     responses:
 *       201:
 *         description: Subcategory created successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: 15
 *                 name: Supermarket
 *                 category_id: 3
 *                 active: true
 *                 createdAt: "2025-07-12T12:00:00.000Z"
 *                 updatedAt: "2025-07-12T12:00:00.000Z"
 *               timed: true
 *               requestTimeMs: 12
 *       400:
 *         description: Validation error or invalid/inactive category
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Category not found or inactive
 *               timed: true
 *               requestTimeMs: 12
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *
 *   get:
 *     summary: Retrieve all subcategories
 *     tags:
 *       - Subcategories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/PageSize'
 *       - $ref: '#/components/parameters/Sort'
 *       - $ref: '#/components/parameters/Order'
 *     responses:
 *       200:
 *         description: List of subcategories successfully retrieved
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id: 9
 *                   name: Uber
 *                   category_id: 1
 *                   active: true
 *                   createdAt: "2025-07-01T08:00:00.000Z"
 *                   updatedAt: "2025-07-01T08:00:00.000Z"
 *               meta:
 *                 total: 1
 *                 page: 1
 *                 pageSize: 20
 *                 pageCount: 1
 *               timed: true
 *               requestTimeMs: 12
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @openapi
 * /subcategories/user/{userId}:
 *   get:
 *     summary: Retrieve all subcategories linked to a user's categories
 *     tags:
 *       - Subcategories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/PageSize'
 *       - $ref: '#/components/parameters/Sort'
 *       - $ref: '#/components/parameters/Order'
 *     responses:
 *       200:
 *         description: List of subcategories for categories owned by the user
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id: 10
 *                   name: Gasoline
 *                   category_id: 4
 *                   active: true
 *                   createdAt: "2025-07-03T10:00:00.000Z"
 *                   updatedAt: "2025-07-03T10:00:00.000Z"
 *               meta:
 *                 total: 1
 *                 page: 1
 *                 pageSize: 20
 *                 pageCount: 1
 *               timed: true
 *               requestTimeMs: 12
 *       400:
 *         description: Invalid user ID
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @openapi
 * /subcategories/category/{categoryId}:
 *   get:
 *     summary: Retrieve subcategories by category ID
 *     tags:
 *       - Subcategories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the category
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/PageSize'
 *       - $ref: '#/components/parameters/Sort'
 *       - $ref: '#/components/parameters/Order'
 *     responses:
 *       200:
 *         description: List of subcategories for the specified category
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id: 5
 *                   name: Taxi
 *                   category_id: 2
 *                   active: true
 *                   createdAt: "2025-07-05T10:00:00.000Z"
 *                   updatedAt: "2025-07-05T10:00:00.000Z"
 *               meta:
 *                 total: 1
 *                 page: 1
 *                 pageSize: 20
 *                 pageCount: 1
 *               timed: true
 *               requestTimeMs: 12
 *       400:
 *         description: Invalid category ID
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @openapi
 * /subcategories/{id}:
 *   get:
 *     summary: Retrieve a subcategory by ID
 *     tags:
 *       - Subcategories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the subcategory
 *     responses:
 *       200:
 *         description: Subcategory found
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: 6
 *                 name: Cinema
 *                 category_id: 3
 *                 active: true
 *                 createdAt: "2025-07-06T11:00:00.000Z"
 *                 updatedAt: "2025-07-06T11:00:00.000Z"
 *               timed: true
 *               requestTimeMs: 12
 *       400:
 *         description: Invalid subcategory ID
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *
 *   put:
 *     summary: Update a subcategory by ID
 *     tags:
 *       - Subcategories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the subcategory to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Fields to update. Fields `id`, `createdAt`, and `updatedAt` cannot be manually changed.
 *             properties:
 *               name:
 *                 type: string
 *               category_id:
 *                 type: integer
 *                 description: Must belong to an active category owned by the user
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Subcategory updated successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: 6
 *                 name: Theater
 *                 category_id: 3
 *                 active: true
 *                 createdAt: "2025-07-06T11:00:00.000Z"
 *                 updatedAt: "2025-07-12T17:00:00.000Z"
 *               timed: true
 *               requestTimeMs: 12
 *       400:
 *         description: Invalid subcategory ID or validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *
 *   delete:
 *     summary: Delete a subcategory by ID
 *     tags:
 *       - Subcategories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the subcategory to delete
 *     responses:
 *       200:
 *         description: Subcategory deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: 6
 *               timed: true
 *               requestTimeMs: 12
 *       400:
 *         description: Invalid subcategory ID or subcategory not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
