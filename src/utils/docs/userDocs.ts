/**
 * @openapi
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *         phone:
 *           type: string
 *         birthDate:
 *           type: string
 *           format: date
 *         theme:
 *           type: string
 *           enum: [dark, light]
 *         language:
 *           type: string
 *           enum: [pt-BR, en-US, es-ES]
 *         currency:
 *           type: string
 *           enum: [BRL, USD, EUR, ARS]
 *         dateFormat:
 *           type: string
 *           enum: [DD/MM/YYYY, MM/DD/YYYY]
 *         profile:
 *           type: string
 *           enum: [starter, pro, master]
 *         active:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @openapi
 * /users:
 *   get:
 *     summary: Retrieve all users
 *     tags: [Users]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200:
 *         description: List of users successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       204:
 *         description: No users found
 *       401:
 *         description: Unauthorized. Make sure to include a valid bearer token.
 *       500:
 *         description: Internal server error. Something went wrong.

 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *           example:
 *             firstName: John
 *             lastName: Doe
 *             email: john.doe@example.com
 *             password: strongpassword123
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error or email already in use
 *       500:
 *         description: Internal server error
 */

/**
 * @openapi
 * /users/search:
 *   get:
 *     summary: Search users by email
 *     tags: [Users]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: Partial or full email to search for
 *     responses:
 *       200:
 *         description: Matching users returned
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid or too short search term (minimum 3 characters required)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     summary: Retrieve a user by ID
 *     tags: [Users]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Unique ID of the user
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid user ID
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error

 *   put:
 *     summary: Update an existing user by ID
 *     tags: [Users]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *           example:
 *             firstName: Jane
 *             email: jane.doe@example.com
 *             theme: light
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid user ID or validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error

 *   delete:
 *     summary: Delete a user by ID
 *     tags: [Users]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user to delete
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: Invalid user ID or user not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
