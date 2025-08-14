/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Authenticate a user and return access and refresh tokens
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Registered email address of the user.
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Password associated with the user's account.
 *           example:
 *             email: gandalf@istari.org
 *             password: YouShallNotPass123
 *     responses:
 *       200:
 *         description: Login successful. Returns access token and user details.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *               timed: true
 *               requestTimeMs: 12
 *       400:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Invalid credentials
 *               timed: true
 *               requestTimeMs: 12
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Internal server error
 *               timed: true
 *               requestTimeMs: 12
 *
 * /auth/refresh:
 *   post:
 *     summary: Generate a new access token using a valid refresh token
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: New access token issued successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *               timed: true
 *               requestTimeMs: 12
 *       401:
 *         description: Expired or invalid refresh token
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Expired or invalid token
 *               timed: true
 *               requestTimeMs: 12
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Internal server error
 *               timed: true
 *               requestTimeMs: 12
 *
 * /auth/logout:
 *   post:
 *     summary: Logs out the current user and deletes the associated refresh token
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Logout successful. The refresh token has been invalidated.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Logged out successfully
 *               timed: true
 *               requestTimeMs: 12
 *       400:
 *         description: Missing or invalid refresh token
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Token not found
 *               timed: true
 *               requestTimeMs: 12
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Internal server error
 *               timed: true
 *               requestTimeMs: 12
 */
