/**
 * @openapi
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *                 minLength: 2
 *                 description: The user's first name. Must contain at least 2 characters.
 *               lastName:
 *                 type: string
 *                 minLength: 2
 *                 description: The user's last name. Must contain at least 2 characters.
 *               email:
 *                 type: string
 *                 format: email
 *                 description: A valid email address for the user. Must be unique across all accounts.
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: The user's password. Must be at least 6 characters long.
 *               phone:
 *                 type: string
 *                 description: Optional phone number for the user. Should include country code if applicable.
 *               birthDate:
 *                 type: string
 *                 format: date
 *                 description: The user's date of birth in ISO 8601 format (e.g., YYYY-MM-DDT00:00:00Z).
 *               theme:
 *                 type: string
 *                 enum: [dark, light]
 *                 description: UI theme preference for the user interface. Defaults to "dark".
 *               language:
 *                 type: string
 *                 enum: [pt-BR, en-US, es-ES]
 *                 description: Preferred language for the interface and messages. Defaults to "en-US".
 *               currency:
 *                 type: string
 *                 enum: [BRL, USD, EUR, ARS, COP]
 *                 description: Preferred currency for financial data. Defaults to "BRL" (Brazilian Real).
 *               dateFormat:
 *                 type: string
 *                 enum: [DD/MM/YYYY, MM/DD/YYYY]
 *                 description: Preferred date format. Defaults to "DD/MM/YYYY".
 *               active:
 *                 type: boolean
 *                 description: Indicates whether the user account is active.
 *               profile:
 *                 type: string
 *                 enum: [starter, pro, master]
 *                 description: User profile type. Defaults to "starter". Use "pro" for premium users or future paid plans. The "master" profile is reserved for system administrators and should not be assigned to regular users.
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: 2
 *                 firstName: Galadriel
 *                 lastName: of Lothlórien
 *                 email: galadriel@valinor.net
 *                 birthDate: "0001-01-01T00:00:00.000Z"
 *                 phone: null
 *                 theme: light
 *                 language: pt-BR
 *                 currency: BRL
 *                 dateFormat: DD/MM/YYYY
 *                 profile: master
 *                 active: true
 *                 createdAt: "2025-01-01T10:00:00.000Z"
 *                 updatedAt: "2025-03-30T21:58:33.000Z"
 *       400:
 *         description: Validation error or email already in use
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Email is already in use
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Internal server error

 *   get:
 *     summary: Retrieve all users
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users successfully retrieved
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id: 1
 *                   firstName: Gandalf
 *                   lastName: the Grey
 *                   email: gandalf@istari.org
 *                   birthDate: "1000-01-01T00:00:00.000Z"
 *                   phone: null
 *                   theme: dark
 *                   language: en-US
 *                   currency: USD
 *                   dateFormat: DD/MM/YYYY
 *                   profile: pro
 *                   active: true
 *                   createdAt: "2025-01-01T00:00:00.000Z"
 *                   updatedAt: "2025-03-30T21:58:33.000Z"
 *                 - id: 2
 *                   firstName: Galadriel
 *                   lastName: of Lothlórien
 *                   email: galadriel@valinor.net
 *                   birthDate: "0001-01-01T00:00:00.000Z"
 *                   phone: null
 *                   theme: light
 *                   language: pt-BR
 *                   currency: BRL
 *                   dateFormat: DD/MM/YYYY
 *                   profile: master
 *                   active: true
 *                   createdAt: "2025-01-01T10:00:00.000Z"
 *                   updatedAt: "2025-03-30T21:58:33.000Z"
 *       401:
 *         description: Unauthorized
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
 * /users/{id}:
 *   get:
 *     summary: Retrieve a user by ID
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: 1
 *                 firstName: Gandalf
 *                 lastName: the Grey
 *                 email: gandalf@istari.org
 *                 birthDate: "1000-01-01T00:00:00.000Z"
 *                 phone: null
 *                 theme: dark
 *                 language: en-US
 *                 currency: USD
 *                 dateFormat: DD/MM/YYYY
 *                 profile: pro
 *                 active: true
 *                 createdAt: "2025-01-01T00:00:00.000Z"
 *                 updatedAt: "2025-03-30T21:58:33.000Z"
 *       400:
 *         description: Invalid user ID or user not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Invalid user ID
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @openapi
 * /users/search:
 *   get:
 *     summary: Search users by partial email address
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 3
 *         description: Email filter to apply. Use `/users/search?email=somevalue`.
 *     responses:
 *       200:
 *         description: Matching users returned
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id: 1
 *                   firstName: Gandalf
 *                   lastName: the Grey
 *                   email: gandalf@istari.org
 *                   birthDate: "1000-01-01T00:00:00.000Z"
 *                   phone: null
 *                   theme: dark
 *                   language: en-US
 *                   currency: USD
 *                   dateFormat: DD/MM/YYYY
 *                   profile: pro
 *                   active: true
 *                   createdAt: "2025-01-01T00:00:00.000Z"
 *                   updatedAt: "2025-03-30T21:58:33.000Z"
 *       400:
 *         description: Search term must contain at least 3 characters
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Search term must contain at least 3 characters
 *       401:
 *         description: Unauthorized
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
 * /users/{id}:
 *   put:
 *     summary: Update an existing user by ID
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Fields to update. Fields `id`, `createdAt` and `updatedAt` cannot be modified.
 *             properties:
 *               firstName:
 *                 type: string
 *                 minLength: 2
 *               lastName:
 *                 type: string
 *                 minLength: 2
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               phone:
 *                 type: string
 *               birthDate:
 *                 type: string
 *                 format: date
 *               theme:
 *                 type: string
 *                 enum: [dark, light]
 *               language:
 *                 type: string
 *                 enum: [pt-BR, en-US, es-ES]
 *               currency:
 *                 type: string
 *                 enum: [BRL, USD, EUR, ARS, COP]
 *               dateFormat:
 *                 type: string
 *                 enum: [DD/MM/YYYY, MM/DD/YYYY]
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: 1
 *                 firstName: Gandalf
 *                 lastName: the Grey
 *                 email: gandalf@istari.org
 *                 birthDate: "1000-01-01T00:00:00.000Z"
 *                 phone: null
 *                 theme: dark
 *                 language: en-US
 *                 currency: USD
 *                 dateFormat: DD/MM/YYYY
 *                 profile: pro
 *                 active: true
 *                 createdAt: "2025-01-01T00:00:00.000Z"
 *                 updatedAt: "2025-03-30T21:58:33.000Z"
 *       400:
 *         description: Invalid user ID or validation error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @openapi
 * /users/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user to delete
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: 1
 *       400:
 *         description: Invalid user ID or user not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: User not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */