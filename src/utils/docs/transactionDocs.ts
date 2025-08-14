/**
 * @openapi
 * /transactions:
 *   get:
 *     summary: List Transactions
 *     description: Return a paginated list of transactions.
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
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transaction'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total: { type: integer, example: 2 }
 *                     page: { type: integer, example: 1 }
 *                     pageSize: { type: integer, example: 20 }
 *                     pageCount: { type: integer, example: 1 }
 *                 timed:
 *                   type: boolean
 *                   example: true
 *                 requestTimeMs:
 *                   type: integer
 *                   example: 12
 *             examples:
 *               success:
 *                 value:
 *                   success: true
 *                   data:
 *                     - id: 42
 *                       value: 100.5
 *                       date: '2025-06-15T00:00:00.000Z'
 *                       observation: Athelas sales
 *                       transactionType: income
 *                       transactionSource: account
 *                       isInstallment: false
 *                       totalMonths: null
 *                       isRecurring: false
 *                       paymentDay: null
 *                       account_id: 1
 *                       category_id: 3
 *                       subcategory_id: null
 *                       active: true
 *                       createdAt: '2025-06-15T00:00:00.000Z'
 *                       updatedAt: '2025-06-15T00:00:00.000Z'
 *                     - id: 43
 *                       value: 75
 *                       date: '2025-06-16T00:00:00.000Z'
 *                       observation: Lembas purchase
 *                       transactionType: expense
 *                       transactionSource: creditCard
 *                       isInstallment: false
 *                       totalMonths: null
 *                       isRecurring: true
 *                       paymentDay: 10
 *                       account_id: 1
 *                       category_id: null
 *                       subcategory_id: 5
 *                       active: true
 *                       createdAt: '2025-06-16T00:00:00.000Z'
 *                       updatedAt: '2025-06-16T00:00:00.000Z'
 *                   meta:
 *                     total: 2
 *                     page: 1
 *                     pageSize: 20
 *                     pageCount: 1
 *                   timed: true
 *                   requestTimeMs: 12
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               unauthorized:
 *                 $ref: '#/components/examples/ErrorUnauthorized'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               server:
 *                 value:
 *                   success: false
 *                   message: Internal server error
 *                   timed: true
 *                   requestTimeMs: 12
 *   post:
 *     summary: Create Transaction
 *     description: Create a new transaction. Category or subcategory must be active and one of them is required.
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
 *             create:
 *               value:
 *                 value: 150.75
 *                 date: '2025-07-01T00:00:00.000Z'
 *                 category_id: 3
 *                 observation: Staff of Gandalf sale
 *                 transactionType: income
 *                 transactionSource: account
 *                 isInstallment: false
 *                 isRecurring: false
 *                 account_id: 1
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
 *                 data:
 *                   $ref: '#/components/schemas/Transaction'
 *                 timed:
 *                   type: boolean
 *                   example: true
 *                 requestTimeMs:
 *                   type: integer
 *                   example: 12
 *             examples:
 *               created:
 *                 value:
 *                   success: true
 *                   data:
 *                     id: 44
 *                     value: 150.75
 *                     date: '2025-07-01T00:00:00.000Z'
 *                     category_id: 3
 *                     subcategory_id: null
 *                     observation: Staff of Gandalf sale
 *                     transactionType: income
 *                     transactionSource: account
 *                     isInstallment: false
 *                     totalMonths: null
 *                     isRecurring: false
 *                     paymentDay: null
 *                     account_id: 1
 *                     active: true
 *                     createdAt: '2025-07-01T00:00:00.000Z'
 *                     updatedAt: '2025-07-01T00:00:00.000Z'
 *                   timed: true
 *                   requestTimeMs: 12
 *       400:
 *         description: Validation error or referenced resource not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               validation:
 *                 $ref: '#/components/examples/ErrorValidation'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               unauthorized:
 *                 $ref: '#/components/examples/ErrorUnauthorized'
 *       422:
 *         description: Semantic validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               conflict:
 *                 value:
 *                   success: false
 *                   message: Conflict between installment and recurring rules
 *                   timed: true
 *                   requestTimeMs: 12
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               server:
 *                 value:
 *                   success: false
 *                   message: Internal server error
 *                   timed: true
 *                   requestTimeMs: 12
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
 *                 success: { type: boolean }
 *                 data:
 *                   $ref: '#/components/schemas/Transaction'
 *                 timed:
 *                   type: boolean
 *                   example: true
 *                 requestTimeMs:
 *                   type: integer
 *                   example: 12
 *             examples:
 *               found:
 *                 value:
 *                   success: true
 *                   data:
 *                     id: 42
 *                     value: 100.5
 *                     date: '2025-06-15T00:00:00.000Z'
 *                     category_id: 3
 *                     subcategory_id: null
 *                     observation: Athelas sales
 *                     transactionType: income
 *                     transactionSource: account
 *                     isInstallment: false
 *                     totalMonths: null
 *                     isRecurring: false
 *                     paymentDay: null
 *                     account_id: 1
 *                     active: true
 *                     createdAt: '2025-06-15T00:00:00.000Z'
 *                     updatedAt: '2025-06-15T00:00:00.000Z'
 *                   timed: true
 *                   requestTimeMs: 12
 *       404:
 *         description: Transaction not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               notFound:
 *                 $ref: '#/components/examples/ErrorNotFound'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               unauthorized:
 *                 $ref: '#/components/examples/ErrorUnauthorized'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               server:
 *                 value:
 *                   success: false
 *                   message: Internal server error
 *                   timed: true
 *                   requestTimeMs: 12
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
 *                 value: 120.5
 *                 observation: Updated description
 *                 isRecurring: true
 *                 paymentDay: 15
 *     responses:
 *       200:
 *         description: Transaction updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   $ref: '#/components/schemas/Transaction'
 *                 timed:
 *                   type: boolean
 *                   example: true
 *                 requestTimeMs:
 *                   type: integer
 *                   example: 12
 *             examples:
 *               updated:
 *                 value:
 *                   success: true
 *                   data:
 *                     id: 42
 *                     value: 120.5
 *                     date: '2025-06-15T00:00:00.000Z'
 *                     category_id: 3
 *                     subcategory_id: null
 *                     observation: Updated description
 *                     transactionType: income
 *                     transactionSource: account
 *                     isInstallment: false
 *                     totalMonths: null
 *                     isRecurring: true
 *                     paymentDay: 15
 *                     account_id: 1
 *                     active: true
 *                     createdAt: '2025-06-15T00:00:00.000Z'
 *                     updatedAt: '2025-07-01T00:00:00.000Z'
 *                   timed: true
 *                   requestTimeMs: 12
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               validation:
 *                 $ref: '#/components/examples/ErrorValidation'
 *       404:
 *         description: Transaction not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               notFound:
 *                 $ref: '#/components/examples/ErrorNotFound'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               unauthorized:
 *                 $ref: '#/components/examples/ErrorUnauthorized'
 *       422:
 *         description: Semantic validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               conflict:
 *                 value:
 *                   success: false
 *                   message: Conflict between installment and recurring rules
 *                   timed: true
 *                   requestTimeMs: 12
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               server:
 *                 value:
 *                   success: false
 *                   message: Internal server error
 *                   timed: true
 *                   requestTimeMs: 12
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
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 42
 *                 timed:
 *                   type: boolean
 *                   example: true
 *                 requestTimeMs:
 *                   type: integer
 *                   example: 12
 *             examples:
 *               deleted:
 *                 value:
 *                   success: true
 *                   data:
 *                     id: 42
 *                   timed: true
 *                   requestTimeMs: 12
 *       404:
 *         description: Transaction not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               notFound:
 *                 $ref: '#/components/examples/ErrorNotFound'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               unauthorized:
 *                 $ref: '#/components/examples/ErrorUnauthorized'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               server:
 *                 value:
 *                   success: false
 *                   message: Internal server error
 *                   timed: true
 *                   requestTimeMs: 12
 */

/**
 * @openapi
 * /transactions/account/{accountId}:
 *   get:
 *     summary: List Transactions by Account
 *     description: Return a paginated list of transactions for a specific account.
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/AccountId'
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
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transaction'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total: { type: integer, example: 1 }
 *                     page: { type: integer, example: 1 }
 *                     pageSize: { type: integer, example: 20 }
 *                     pageCount: { type: integer, example: 1 }
 *                 timed:
 *                   type: boolean
 *                   example: true
 *                 requestTimeMs:
 *                   type: integer
 *                   example: 12
 *             examples:
 *               success:
 *                 value:
 *                   success: true
 *                   data:
 *                     - id: 50
 *                       value: 200
 *                       date: '2025-07-10T00:00:00.000Z'
 *                       observation: Mithril sale
 *                       transactionType: income
 *                       transactionSource: account
 *                       isInstallment: false
 *                       totalMonths: null
 *                       isRecurring: false
 *                       paymentDay: null
 *                       account_id: 2
 *                       category_id: 4
 *                       subcategory_id: null
 *                       active: true
 *                       createdAt: '2025-07-10T00:00:00.000Z'
 *                       updatedAt: '2025-07-10T00:00:00.000Z'
 *                   meta:
 *                     total: 1
 *                     page: 1
 *                     pageSize: 20
 *                     pageCount: 1
 *                   timed: true
 *                   requestTimeMs: 12
 *       404:
 *         description: Account not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               notFound:
 *                 value:
 *                   success: false
 *                   message: Account not found
 *                   timed: true
 *                   requestTimeMs: 12
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               unauthorized:
 *                 $ref: '#/components/examples/ErrorUnauthorized'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               server:
 *                 value:
 *                   success: false
 *                   message: Internal server error
 *                   timed: true
 *                   requestTimeMs: 12
 */

/**
 * @openapi
 * /transactions/user/{userId}:
 *   get:
 *     summary: List Transactions by User
 *     description: Return all transactions grouped by account for a specific user.
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UserId'
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
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       accountId: { type: integer, example: 1 }
 *                       transactions:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Transaction'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total: { type: integer, example: 1 }
 *                     page: { type: integer, example: 1 }
 *                     pageSize: { type: integer, example: 20 }
 *                     pageCount: { type: integer, example: 1 }
 *                 timed:
 *                   type: boolean
 *                   example: true
 *                 requestTimeMs:
 *                   type: integer
 *                   example: 12
 *             examples:
 *               success:
 *                 value:
 *                   success: true
 *                   data:
 *                     - accountId: 1
 *                       transactions:
 *                         - id: 60
 *                           value: 300
 *                           date: '2025-07-20T00:00:00.000Z'
 *                           observation: White Council stipend
 *                           transactionType: income
 *                           transactionSource: account
 *                           isInstallment: false
 *                           totalMonths: null
 *                           isRecurring: true
 *                           paymentDay: 5
 *                           account_id: 1
 *                           category_id: 3
 *                           subcategory_id: null
 *                           active: true
 *                           createdAt: '2025-07-20T00:00:00.000Z'
 *                           updatedAt: '2025-07-20T00:00:00.000Z'
 *                   meta:
 *                     total: 1
 *                     page: 1
 *                     pageSize: 20
 *                     pageCount: 1
 *                   timed: true
 *                   requestTimeMs: 12
 *       404:
 *         description: User or accounts not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               notFound:
 *                 value:
 *                   success: false
 *                   message: Account not found
 *                   timed: true
 *                   requestTimeMs: 12
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               unauthorized:
 *                 $ref: '#/components/examples/ErrorUnauthorized'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               server:
 *                 value:
 *                   success: false
 *                   message: Internal server error
 *                   timed: true
 *                   requestTimeMs: 12
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
 *     AccountId:
 *       in: path
 *       name: accountId
 *       required: true
 *       schema:
 *         type: integer
 *       description: Account identifier
 *     UserId:
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
 *         default: date
 *       description: Field to sort by
 *     Order:
 *       in: query
 *       name: order
 *       schema:
 *         type: string
 *         enum: [asc, desc]
 *         default: desc
 *       description: Sort order
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id: { type: integer, example: 1 }
 *         firstName: { type: string, example: Gandalf }
 *         lastName: { type: string, example: the Grey }
 *         email: { type: string, format: email, example: gandalf@istari.org }
 *         theme: { type: string, enum: [dark, light], default: dark, example: dark }
 *         language: { type: string, enum: [pt-BR, en-US, es-ES], default: en-US, example: en-US }
 *         currency: { type: string, enum: [BRL, USD, EUR, ARS, COP], default: BRL, example: BRL }
 *         dateFormat: { type: string, enum: ['DD/MM/YYYY', 'MM/DD/YYYY'], default: 'DD/MM/YYYY', example: 'DD/MM/YYYY' }
 *         profile: { type: string, enum: [starter, pro, master], default: starter, example: starter }
 *         active: { type: boolean, example: true }
 *         createdAt: { type: string, format: date-time, example: '2025-06-01T00:00:00.000Z' }
 *         updatedAt: { type: string, format: date-time, example: '2025-06-01T00:00:00.000Z' }
 *     Account:
 *       type: object
 *       properties:
 *         id: { type: integer, example: 1 }
 *         name: { type: string, example: Shire Banking }
 *         institution: { type: string, example: Bank of the Shire }
 *         type: { type: string, enum: [checking, payroll, savings, investment, loan, other], example: checking }
 *         observation: { type: string, nullable: true, example: Main vault of Erebor }
 *         user_id: { type: integer, example: 1 }
 *         active: { type: boolean, example: true }
 *         createdAt: { type: string, format: date-time, example: '2025-05-01T00:00:00.000Z' }
 *         updatedAt: { type: string, format: date-time, example: '2025-05-01T00:00:00.000Z' }
 *     Category:
 *       type: object
 *       properties:
 *         id: { type: integer, example: 3 }
 *         name: { type: string, example: Mystical Goods }
 *         type: { type: string, enum: [income, expense], example: income }
 *         color: { type: string, enum: [red, yellow, blue, green, purple, orange, pink, gray, cyan, indigo], default: purple, example: purple }
 *         user_id: { type: integer, example: 1 }
 *         active: { type: boolean, example: true }
 *         createdAt: { type: string, format: date-time, example: '2025-05-01T00:00:00.000Z' }
 *         updatedAt: { type: string, format: date-time, example: '2025-05-01T00:00:00.000Z' }
 *     Subcategory:
 *       type: object
 *       properties:
 *         id: { type: integer, example: 5 }
 *         name: { type: string, example: Elven Crafts }
 *         type: { type: string, enum: [income, expense], example: income }
 *         color: { type: string, enum: [red, yellow, blue, green, purple, orange, pink, gray, cyan, indigo], default: purple, example: green }
 *         category_id: { type: integer, example: 3 }
 *         user_id: { type: integer, example: 2 }
 *         active: { type: boolean, example: true }
 *         createdAt: { type: string, format: date-time, example: '2025-05-02T00:00:00.000Z' }
 *         updatedAt: { type: string, format: date-time, example: '2025-05-02T00:00:00.000Z' }
 *     Transaction:
 *       type: object
 *       properties:
 *         id: { type: integer, example: 42 }
 *         value: { type: number, example: 100.5 }
 *         date: { type: string, format: date-time, example: '2025-06-15T00:00:00.000Z' }
 *         category_id: { type: integer, nullable: true, example: 3 }
 *         subcategory_id: { type: integer, nullable: true, example: null }
 *         observation: { type: string, nullable: true, example: Athelas sales }
 *         transactionType: { type: string, enum: [income, expense], example: income }
 *         transactionSource: { type: string, enum: [account, creditCard], example: account }
 *         isInstallment: { type: boolean, example: false }
 *         totalMonths: { type: integer, nullable: true, example: null }
 *         isRecurring: { type: boolean, example: false }
 *         paymentDay: { type: integer, nullable: true, example: null }
 *         account_id: { type: integer, example: 1 }
 *         active: { type: boolean, example: true }
 *         createdAt: { type: string, format: date-time, example: '2025-06-15T00:00:00.000Z' }
 *         updatedAt: { type: string, format: date-time, example: '2025-06-15T00:00:00.000Z' }
 *     TransactionCreate:
 *       type: object
 *       required: [value, date, transactionType, transactionSource, isInstallment, isRecurring, account_id]
 *       properties:
 *         value: { type: number, minimum: 0.01, example: 150.75 }
 *         date: { type: string, format: date-time, example: '2025-07-01T00:00:00.000Z' }
 *         category_id: { type: integer, nullable: true, example: 3, description: Required if subcategory_id is not provided }
 *         subcategory_id: { type: integer, nullable: true, example: null, description: Required if category_id is not provided }
 *         observation: { type: string, example: Staff of Gandalf sale }
 *         transactionType: { type: string, enum: [income, expense], example: income }
 *         transactionSource: { type: string, enum: [account, creditCard], example: account }
 *         isInstallment: { type: boolean, example: false }
 *         totalMonths: { type: integer, nullable: true, example: null, description: Required when isInstallment is true }
 *         isRecurring: { type: boolean, example: false }
 *         paymentDay: { type: integer, nullable: true, minimum: 1, maximum: 31, example: null, description: Required when isRecurring is true }
 *         account_id: { type: integer, example: 1 }
 *         active: { type: boolean, default: true, example: true }
 *     TransactionUpdate:
 *       type: object
 *       description: Fields to update; at least one property must be provided
 *       properties:
 *         value: { type: number }
 *         date: { type: string, format: date-time }
 *         category_id: { type: integer, nullable: true }
 *         subcategory_id: { type: integer, nullable: true }
 *         observation: { type: string }
 *         transactionType: { type: string, enum: [income, expense] }
 *         transactionSource: { type: string, enum: [account, creditCard] }
 *         isInstallment: { type: boolean }
 *         totalMonths: { type: integer, nullable: true }
 *         isRecurring: { type: boolean }
 *         paymentDay: { type: integer, nullable: true, minimum: 1, maximum: 31 }
 *         account_id: { type: integer }
 *         active: { type: boolean }
 *     AuthTokens:
 *       type: object
 *       properties:
 *         accessToken: { type: string, example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
 *         refreshToken: { type: string, example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success: { type: boolean, example: false }
 *         message: { type: string, example: Validation error }
 *         details:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               path: { type: string, example: value }
 *               message: { type: string, example: Value must be greater than 0 }
 *         timed:
 *           type: boolean
 *           example: true
 *         requestTimeMs:
 *           type: integer
 *           example: 12
 *   examples:
 *     UserGandalf:
 *       summary: Gandalf the Grey
 *       value:
 *         id: 1
 *         firstName: Gandalf
 *         lastName: the Grey
 *         email: gandalf@istari.org
 *         theme: dark
 *         language: en-US
 *         currency: BRL
 *         dateFormat: 'DD/MM/YYYY'
 *         profile: starter
 *         active: true
 *         createdAt: '2025-06-01T00:00:00.000Z'
 *         updatedAt: '2025-06-01T00:00:00.000Z'
 *     UserGaladriel:
 *       summary: Galadriel of Lothlórien
 *       value:
 *         id: 2
 *         firstName: Galadriel
 *         lastName: of Lothlórien
 *         email: galadriel@valinor.net
 *         theme: light
 *         language: en-US
 *         currency: USD
 *         dateFormat: 'MM/DD/YYYY'
 *         profile: pro
 *         active: true
 *         createdAt: '2025-06-01T00:00:00.000Z'
 *         updatedAt: '2025-06-01T00:00:00.000Z'
 *     ErrorValidation:
 *       summary: Validation error
 *       value:
 *         success: false
 *         message: Validation error
 *         details:
 *           - path: value
 *             message: Value must be greater than 0
 *         timed: true
 *         requestTimeMs: 12
 *     ErrorUnauthorized:
 *       summary: Unauthorized
 *       value:
 *         success: false
 *         message: Unauthorized
 *         timed: true
 *         requestTimeMs: 12
 *     ErrorNotFound:
 *       summary: Not found
 *       value:
 *         success: false
 *         message: Transaction not found
 *         timed: true
 *         requestTimeMs: 12
 *     ErrorConflict:
 *       summary: Conflict
 *       value:
 *         success: false
 *         message: Conflict
 *         timed: true
 *         requestTimeMs: 12
 */
