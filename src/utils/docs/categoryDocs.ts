/**
 * @openapi
 * /categories:
 *   post:
 *     summary: Create a new category
 *     tags:
 *       - Categories
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
 *               - type
 *               - user_id
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the category. E.g. "Food"
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *                 description: Type of the category.
 *               color:
 *                 type: string
 *                 enum: [red, yellow, blue, green, purple, orange, pink, gray, cyan, teal]
 *                 description: Color of the category. Defaults to "purple".
 *               user_id:
 *                 type: integer
 *                 description: ID of the user who owns this category.
 *               active:
 *                 type: boolean
 *                 description: Indicates whether the category is active. Defaults to true.
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: 10
 *                 name: Food
 *                 type: expense
 *                 color: red
 *                 user_id: 3
 *                 active: true
 *                 createdAt: "2025-07-12T12:00:00.000Z"
 *                 updatedAt: "2025-07-12T12:00:00.000Z"
 *               timed: true
 *               requestTimeMs: 12
 *       400:
 *         description: Validation error or user not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: User not found
 *               timed: true
 *               requestTimeMs: 12
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *
 *   get:
 *     summary: Retrieve all categories
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/PageSize'
 *       - $ref: '#/components/parameters/Sort'
 *       - $ref: '#/components/parameters/Order'
 *     responses:
 *       200:
 *         description: List of categories successfully retrieved
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id: 1
 *                   name: Transportation
 *                   type: expense
 *                   color: blue
 *                   user_id: 1
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
 * /categories/user/{userId}:
 *   get:
 *     summary: Retrieve all categories for a specific user
 *     tags:
 *       - Categories
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
 *         description: List of categories for the given user
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id: 5
 *                   name: Salary
 *                   type: income
 *                   color: green
 *                   user_id: 2
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
 * /categories/{id}:
 *   get:
 *     summary: Retrieve a category by ID
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the category
 *     responses:
 *       200:
 *         description: Category found
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: 3
 *                 name: Entertainment
 *                 type: expense
 *                 color: pink
 *                 user_id: 1
 *                 active: true
 *                 createdAt: "2025-07-02T11:00:00.000Z"
 *                 updatedAt: "2025-07-05T15:30:00.000Z"
 *               timed: true
 *               requestTimeMs: 12
 *       400:
 *         description: Invalid category ID
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *
 *   put:
 *     summary: Update a category by ID
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the category to update
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
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *               color:
 *                 type: string
 *                 enum: [red, yellow, blue, green, purple, orange, pink, gray, cyan, teal]
 *               active:
 *                 type: boolean
 *               user_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Category updated successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: 3
 *                 name: Entertainment
 *                 type: income
 *                 color: red
 *                 active: false
 *                 user_id: 1
 *                 createdAt: "2025-07-02T11:00:00.000Z"
 *                 updatedAt: "2025-07-12T17:00:00.000Z"
 *               timed: true
 *               requestTimeMs: 12
 *       400:
 *         description: Invalid category ID or validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *
 *   delete:
 *     summary: Delete a category by ID
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the category to delete
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: 3
 *               timed: true
 *               requestTimeMs: 12
 *       400:
 *         description: Invalid category ID or category not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */