"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = verifyToken;
const tokenUtils_1 = require("./tokenUtils");
const commons_1 = require("../commons");
const enum_1 = require("../enum");
const resource_1 = require("../resources/resource");
/**
 * Middleware to validate the access token from the Authorization header.
 * If valid, injects the user ID into `req.user`.
 * Responds with 401 if the token is missing, invalid, or expired.
 *
 * @param req - Incoming request with optional Authorization header.
 * @param res - HTTP response used for error response.
 * @param next - Calls the next middleware if the token is valid.
 */
function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.UNAUTHORIZED, undefined, resource_1.Resource.EXPIRED_OR_INVALID_TOKEN);
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const tokenData = tokenUtils_1.TokenUtils.verifyAccessToken(token);
        req.user = { id: tokenData.id };
        next();
    }
    catch (_a) {
        (0, commons_1.answerAPI)(req, res, enum_1.HTTPStatus.UNAUTHORIZED, undefined, resource_1.Resource.EXPIRED_OR_INVALID_TOKEN);
        return;
    }
}
