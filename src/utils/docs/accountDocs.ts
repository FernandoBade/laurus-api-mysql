/**
 * @openapi
 * /accounts:
 *   post:
 *     summary: Create a new financial account
 *     tags:
 *       - Accounts
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
 *               - institution
 *               - type
 *               - user_id
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the account. E.g. "Elven Savings"
 *               institution:
 *                 type: string
 *                 description: Name of the financial institution. E.g. "Rivendell Bank"
 *               type:
 *                 type: string
 *                 enum: [checking, payroll, savings, investment, loan, other]
 *                 description: Type of account. Must match one of the allowed types.
 *               observation:
 *                 type: string
 *                 description: Optional observations about the account.
 *               user_id:
 *                 type: integer
 *                 description: ID of the user who owns this account.
 *               active:
 *                 type: boolean
 *                 description: Indicates whether the account is active. Defaults to true.
 *     responses:
 *       201:
 *         description: Account created successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: 10
 *                 name: Elven Savings
 *                 institution: Rivendell Bank
 *                 type: savings
 *                 observation: For Lothlórien projects
 *                 user_id: 2
 *                 active: true
 *                 createdAt: "2025-05-09T22:00:00.000Z"
 *                 updatedAt: "2025-05-09T22:00:00.000Z"
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
 *     summary: Retrieve all accounts
 *     tags:
 *       - Accounts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/PageSize'
 *       - $ref: '#/components/parameters/Sort'
 *       - $ref: '#/components/parameters/Order'
 *     responses:
 *       200:
 *         description: List of accounts successfully retrieved
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id: 1
 *                   name: Mithril Treasury
 *                   institution: Moria Bank
 *                   type: investment
 *                   user_id: 1
 *                   observation: Long-term dwarven fund
 *                   active: true
 *                   createdAt: "2025-05-09T22:00:00.000Z"
 *                   updatedAt: "2025-05-09T22:00:00.000Z"
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
 * /accounts/user/{userId}:
 *   get:
 *     summary: Retrieve accounts by user ID
 *     tags:
 *       - Accounts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user whose accounts will be listed
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/PageSize'
 *       - $ref: '#/components/parameters/Sort'
 *       - $ref: '#/components/parameters/Order'
 *     responses:
 *       200:
 *         description: List of accounts for the user
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id: 7
 *                   name: Gondorian Checking
 *                   institution: Minas Tirith Bank
 *                   type: Checking
 *                   user_id: 3
 *                   observation: Household expenses
 *                   active: true
 *                   createdAt: "2025-05-09T21:58:00.000Z"
 *                   updatedAt: "2025-05-09T21:58:00.000Z"
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
 * /accounts/{id}:
 *   get:
 *     summary: Retrieve a specific account by ID
 *     tags:
 *       - Accounts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the account
 *     responses:
 *       200:
 *         description: Account found
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: 5
 *                 name: Fellowship Payroll
 *                 institution: Middle-earth Bank
 *                 type: Payroll
 *                 observation: Adventure fund
 *                 user_id: 1
 *                 active: true
 *                 createdAt: "2025-05-01T10:00:00.000Z"
 *                 updatedAt: "2025-05-01T10:00:00.000Z"
 *               timed: true
 *               requestTimeMs: 12
 *       400:
 *         description: Invalid account ID
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *
 *   put:
 *     summary: Update an existing account by ID
 *     tags:
 *       - Accounts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the account to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Fields to update. Fields `id`, `createdAt` and `updatedAt` cannot be modified.
 *             properties:
 *               name:
 *                 type: string
 *               institution:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [checking, payroll, savings, investment, loan, other]
 *               observation:
 *                 type: string
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Account updated successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: 4
 *                 name: Rohan Reserve
 *                 institution: Edoras Bank
 *                 type: savings
 *                 observation: Emergency fund
 *                 active: false
 *                 user_id: 4
 *                 createdAt: "2025-05-01T10:00:00.000Z"
 *                 updatedAt: "2025-05-10T00:00:00.000Z"
 *               timed: true
 *               requestTimeMs: 12
 *       400:
 *         description: Invalid account ID or validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *
 *   delete:
 *     summary: Delete an account by ID
 *     tags:
 *       - Accounts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the account to delete
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: 5
 *               timed: true
 *               requestTimeMs: 12
 *       400:
 *         description: Invalid account ID or account not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */