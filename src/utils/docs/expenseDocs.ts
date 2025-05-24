/**
 * @openapi
 * /expenses:
 *   post:
 *     summary: Create a new expense
 *     tags:
 *       - Expenses
 *     security:
 *       - bearerAuth: []
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             required:
*               - value
*               - date
*               - category
*               - expenseType
*               - isInstallment
*               - isRecurring
*               - account_id
*             properties:
*               value:
*                 type: number
*                 format: float
*                 description: Expense amount in decimal format.
*                 example: 199.99
*               date:
*                 type: string
*                 format: date-time
*                 description: ISO 8601 formatted date of the expense.
*                 example: "2025-08-01T00:00:00.000Z"
*               category:
*                 type: string
*                 description: Main category of the expense (e.g., "Food").
*                 example: Food
*               subcategory:
*                 type: string
*                 description: Subcategory of the expense (e.g., "Restaurant").
*                 example: Restaurant
*               observation:
*                 type: string
*                 description: Optional notes or comments about the expense.
*                 example: "Dinner at Italian place"
*               expenseType:
*                 type: string
*                 enum: [account, credit_card]
*                 description: Type of expense. Either from a regular account or a credit card.
*               isInstallment:
*                 type: boolean
*                 description: Indicates if the expense is paid in installments.
*                 example: false
*               totalMonths:
*                 type: integer
*                 nullable: true
*                 description: Number of months for installment payments. Required if isInstallment is true.
*                 example: 3
*               isRecurring:
*                 type: boolean
*                 description: Indicates if the expense recurs monthly.
*                 example: false
*               paymentDay:
*                 type: integer
*                 nullable: true
*                 description: Day of the month when the recurring expense is paid (1–31). Required if isRecurring is true.
*                 example: 10
*               account_id:
*                 type: integer
*                 description: ID of the account associated with the expense.
*                 example: 2
*               active:
*                 type: boolean
*                 default: true
*                 description: Indicates whether the expense is active. Defaults to true.

 *     responses:
 *       201:
 *         description: Expense created successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: 11
 *                 value: 120.00
 *                 date: "2025-08-01T00:00:00.000Z"
 *                 category: Food
 *                 subcategory: Restaurant
 *                 observation: Dinner at Italian place
 *                 expenseType: account
 *                 isInstallment: false
 *                 totalMonths: null
 *                 isRecurring: false
 *                 paymentDay: null
 *                 account_id: 2
 *                 active: true
 *                 createdAt: "2025-08-01T12:00:00.000Z"
 *                 updatedAt: "2025-08-01T12:00:00.000Z"
 *       400:
 *         description: Validation error or account not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Account not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *
 *   get:
 *     summary: Retrieve all expenses
 *     tags:
 *       - Expenses
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of expenses successfully retrieved
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id: 1
 *                   value: 55.5
 *                   date: "2025-07-01T00:00:00.000Z"
 *                   category: Transport
 *                   subcategory: Uber
 *                   observation: Ride to office
 *                   expenseType: account
 *                   isInstallment: false
 *                   totalMonths: null
 *                   isRecurring: false
 *                   paymentDay: null
 *                   account_id: 1
 *                   active: true
 *                   createdAt: "2025-07-01T08:00:00.000Z"
 *                   updatedAt: "2025-07-01T08:00:00.000Z"
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @openapi
 * /expenses/{id}:
 *   get:
 *     summary: Retrieve an expense by ID
 *     tags:
 *       - Expenses
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the expense
 *     responses:
 *       200:
 *         description: Expense found
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: 3
 *                 value: 75.00
 *                 date: "2025-07-15T00:00:00.000Z"
 *                 category: Groceries
 *                 subcategory: Supermarket
 *                 expenseType: credit_card
 *                 account_id: 4
 *                 active: true
 *                 createdAt: "2025-07-15T12:00:00.000Z"
 *                 updatedAt: "2025-07-15T12:00:00.000Z"
 *       400:
 *         description: Invalid expense ID
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *
 *   put:
 *     summary: Update an expense by ID
 *     tags:
 *       - Expenses
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the expense to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Fields to update. `id`, `createdAt`, and `updatedAt` cannot be modified directly.
 *             properties:
 *               value:
 *                 type: number
 *               category:
 *                 type: string
 *               subcategory:
 *                 type: string
 *               observation:
 *                 type: string
 *               expenseType:
 *                 type: string
 *                 enum: [account, credit_card]
 *               isInstallment:
 *                 type: boolean
 *               totalMonths:
 *                 type: integer
 *               isRecurring:
 *                 type: boolean
 *               paymentDay:
 *                 type: integer
 *               account_id:
 *                 type: integer
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Expense updated successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: 3
 *                 value: 90.00
 *                 observation: Updated value
 *                 updatedAt: "2025-07-20T16:00:00.000Z"
 *       400:
 *         description: Invalid expense ID or validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *
 *   delete:
 *     summary: Delete an expense by ID
 *     tags:
 *       - Expenses
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the expense to delete
 *     responses:
 *       200:
 *         description: Expense deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: 3
 *       400:
 *         description: Invalid expense ID or not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
