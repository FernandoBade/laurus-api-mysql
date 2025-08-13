/**
 * @openapi
 * /transactions:
 *   get:
 *     summary: List Transactions
 *     description: Retrieve all transactions registered in the system.
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/PageSize'
 *       - $ref: '#/components/parameters/Sort'
 *       - $ref: '#/components/parameters/Order'
 *     responses:
 *       200:
 *         description: Transactions fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transaction'
 *             examples:
 *               example:
 *                 value:
 *                   success: true
 *                   data:
 *                     - id: 1
 *                       value: 150.5
 *                       date: "2025-05-09T10:00:00.000Z"
 *                       category_id: 3
 *                       subcategory_id: null
 *                       observation: Sale of fireworks
 *                       transactionType: income
 *                       transactionSource: account
 *                       isInstallment: false
 *                       totalMonths: null
 *                       isRecurring: false
 *                       paymentDay: null
 *                       account_id: 1
 *                       active: true
 *                       createdAt: "2025-05-09T10:00:00.000Z"
 *                       updatedAt: "2025-05-09T10:00:00.000Z"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Unauthorized
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Internal server error
 *
 *   post:
 *     summary: Create Transaction
 *     description: |
 *       Create a new financial transaction. Either `category_id` or `subcategory_id` must be provided.
 *       If `isInstallment` is true, `totalMonths` is required. If `isRecurring` is true, `paymentDay` is required.
 *       `isInstallment` and `isRecurring` cannot both be true.
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TransactionCreate'
 *           examples:
 *             income:
 *               value:
 *                 value: 200.75
 *                 date: "2025-06-01T00:00:00.000Z"
 *                 category_id: 3
 *                 observation: Payment for staff of Gandalf the Grey
 *                 transactionType: income
 *                 transactionSource: account
 *                 isInstallment: false
 *                 isRecurring: false
 *                 account_id: 1
 *                 active: true
 *     responses:
 *       201:
 *         description: Transaction created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Transaction'
 *             examples:
 *               created:
 *                 value:
 *                   success: true
 *                   data:
 *                     id: 99
 *                     value: 200.75
 *                     date: "2025-06-01T00:00:00.000Z"
 *                     category_id: 3
 *                     subcategory_id: null
 *                     observation: Payment for staff of Gandalf the Grey
 *                     transactionType: income
 *                     transactionSource: account
 *                     isInstallment: false
 *                     totalMonths: null
 *                     isRecurring: false
 *                     paymentDay: null
 *                     account_id: 1
 *                     active: true
 *                     createdAt: "2025-06-01T00:00:00.000Z"
 *                     updatedAt: "2025-06-01T00:00:00.000Z"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             examples:
 *               validation:
 *                 value:
 *                   success: false
 *                   message: Validation error
 *                   details:
 *                     - path: value
 *                       message: Required
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Unauthorized
 *       404:
 *         description: Related resource not found (account, category or subcategory)
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Account not found
 *       422:
 *         description: Semantic validation error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Category or subcategory required
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Internal server error
 */

/**
 * @openapi
 * /transactions/{id}:
 *   get:
 *     summary: Get Transaction by ID
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Transaction found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Transaction'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Unauthorized
 *       404:
 *         description: Transaction not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Transaction not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Internal server error
 *
 *   put:
 *     summary: Update Transaction by ID
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TransactionUpdate'
 *           examples:
 *             update:
 *               value:
 *                 observation: Revised for white council meeting
 *     responses:
 *       200:
 *         description: Transaction updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Validation error
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Unauthorized
 *       404:
 *         description: Transaction not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Transaction not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Internal server error
 *
 *   delete:
 *     summary: Delete Transaction by ID
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 99
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Unauthorized
 *       404:
 *         description: Transaction not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Transaction not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Internal server error
 */

/**
 * @openapi
 * /transactions/account/{accountId}:
 *   get:
 *     summary: List Transactions by Account
 *     description: Retrieve all transactions associated with a specific account.
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/AccountIdParam'
 *     responses:
 *       200:
 *         description: Transactions retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transaction'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Unauthorized
 *       404:
 *         description: Account not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Account not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Internal server error
 */

/**
 * @openapi
 * /transactions/user/{userId}:
 *   get:
 *     summary: List Transactions by User
 *     description: Retrieve all transactions for a user, grouped by account.
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UserIdParam'
 *     responses:
 *       200:
 *         description: Transactions retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AccountTransactions'
 *             examples:
 *               grouped:
 *                 value:
 *                   success: true
 *                   data:
 *                     - accountId: 1
 *                       transactions:
 *                         - id: 1
 *                           value: 150.5
 *                           date: "2025-05-09T10:00:00.000Z"
 *                           category_id: 3
 *                           subcategory_id: null
 *                           observation: Sale of fireworks
 *                           transactionType: income
 *                           transactionSource: account
 *                           isInstallment: false
 *                           totalMonths: null
 *                           isRecurring: false
 *                           paymentDay: null
 *                           account_id: 1
 *                           active: true
 *                           createdAt: "2025-05-09T10:00:00.000Z"
 *                           updatedAt: "2025-05-09T10:00:00.000Z"
 *                     - accountId: 2
 *                       transactions: []
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Unauthorized
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: User not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Internal server error
 */

/**
 * @openapi
 * components:
 *   parameters:
 *     IdParam:
 *       in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: integer
 *       description: Transaction identifier
 *     AccountIdParam:
 *       in: path
 *       name: accountId
 *       required: true
 *       schema:
 *         type: integer
 *       description: Account identifier
 *     UserIdParam:
 *       in: path
 *       name: userId
 *       required: true
 *       schema:
 *         type: integer
 *       description: User identifier
 *     Page:
 *       in: query
 *       name: page
 *       schema:
 *         type: integer
 *         minimum: 1
 *         default: 1
 *       description: Page number
 *     PageSize:
 *       in: query
 *       name: pageSize
 *       schema:
 *         type: integer
 *         minimum: 1
 *         maximum: 100
 *         default: 20
 *       description: Number of items per page
 *     Sort:
 *       in: query
 *       name: sort
 *       schema:
 *         type: string
 *         enum: [date, value]
 *         default: date
 *       description: Field used for sorting
 *     Order:
 *       in: query
 *       name: order
 *       schema:
 *         type: string
 *         enum: [asc, desc]
 *         default: desc
 *       description: Sorting order
 *
 *   schemas:
 *     Transaction:
 *       type: object
 *       required:
 *         - id
 *         - value
 *         - date
 *         - transactionType
 *         - transactionSource
 *         - isInstallment
 *         - isRecurring
 *         - account_id
 *         - active
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         value:
 *           type: number
 *           format: float
 *           example: 150.5
 *         date:
 *           type: string
 *           format: date-time
 *           example: "2025-05-09T10:00:00.000Z"
 *         category_id:
 *           type: integer
 *           nullable: true
 *           example: 3
 *         subcategory_id:
 *           type: integer
 *           nullable: true
 *           example: null
 *         observation:
 *           type: string
 *           nullable: true
 *           example: Sale of fireworks
 *         transactionType:
 *           type: string
 *           enum: [income, expense]
 *           example: income
 *         transactionSource:
 *           type: string
 *           enum: [account, creditCard]
 *           example: account
 *         isInstallment:
 *           type: boolean
 *           example: false
 *         totalMonths:
 *           type: integer
 *           nullable: true
 *           example: null
 *         isRecurring:
 *           type: boolean
 *           example: false
 *         paymentDay:
 *           type: integer
 *           nullable: true
 *           example: null
 *         account_id:
 *           type: integer
 *           example: 1
 *         active:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-05-09T10:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-05-09T10:00:00.000Z"
 *
 *     TransactionCreate:
 *       type: object
 *       required:
 *         - value
 *         - date
 *         - transactionType
 *         - transactionSource
 *         - isInstallment
 *         - isRecurring
 *         - account_id
 *       properties:
 *         value:
 *           type: number
 *           format: float
 *           example: 200.75
 *         date:
 *           type: string
 *           format: date-time
 *           example: "2025-06-01T00:00:00.000Z"
 *         category_id:
 *           type: integer
 *           nullable: true
 *           description: Must reference an active category
 *           example: 3
 *         subcategory_id:
 *           type: integer
 *           nullable: true
 *           description: Must reference an active subcategory
 *           example: null
 *         observation:
 *           type: string
 *           nullable: true
 *           example: Payment for staff of Gandalf the Grey
 *         transactionType:
 *           type: string
 *           enum: [income, expense]
 *           example: income
 *         transactionSource:
 *           type: string
 *           enum: [account, creditCard]
 *           example: account
 *         isInstallment:
 *           type: boolean
 *           example: false
 *         totalMonths:
 *           type: integer
 *           nullable: true
 *           description: Required when isInstallment is true
 *           example: null
 *         isRecurring:
 *           type: boolean
 *           example: false
 *         paymentDay:
 *           type: integer
 *           nullable: true
 *           description: Required when isRecurring is true (1-31)
 *           example: null
 *         account_id:
 *           type: integer
 *           example: 1
 *         active:
 *           type: boolean
 *           default: true
 *           example: true
 *       description: |
 *         Either `category_id` or `subcategory_id` must be provided.
 *         `isInstallment` and `isRecurring` cannot both be true.
 *
 *     TransactionUpdate:
 *       type: object
 *       properties:
 *         value:
 *           type: number
 *           format: float
 *           example: 300
 *         date:
 *           type: string
 *           format: date-time
 *           example: "2025-06-15T00:00:00.000Z"
 *         category_id:
 *           type: integer
 *           nullable: true
 *           example: 4
 *         subcategory_id:
 *           type: integer
 *           nullable: true
 *           example: null
 *         observation:
 *           type: string
 *           nullable: true
 *           example: Revised for white council meeting
 *         transactionType:
 *           type: string
 *           enum: [income, expense]
 *           example: expense
 *         transactionSource:
 *           type: string
 *           enum: [account, creditCard]
 *           example: account
 *         isInstallment:
 *           type: boolean
 *           example: false
 *         totalMonths:
 *           type: integer
 *           nullable: true
 *           example: null
 *         isRecurring:
 *           type: boolean
 *           example: false
 *         paymentDay:
 *           type: integer
 *           nullable: true
 *           example: null
 *         account_id:
 *           type: integer
 *           example: 1
 *         active:
 *           type: boolean
 *           example: true
 *       description: All fields are optional; provide only the fields to update.
 *
 *     AccountTransactions:
 *       type: object
 *       properties:
 *         accountId:
 *           type: integer
 *           example: 1
 *         transactions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Transaction'
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: Validation error
 *         details:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               path:
 *                 type: string
 *                 example: value
 *               message:
 *                 type: string
 *                 example: Required
 */
