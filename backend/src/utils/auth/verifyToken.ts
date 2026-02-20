import { Request, Response, NextFunction } from 'express';
import { TokenUtils } from './tokenUtils';
import { answerAPI } from '../commons';
import { AuthScheme } from '../../../../shared/enums/http.enums';
import { HTTPStatus } from '../../../../shared/enums/http-status.enums';
import { ResourceKey as Resource } from '../../../../shared/i18n/resource.keys';
import { UserService } from '../../service/userService';

/**
 * Middleware to validate the access token from the Authorization header.
 * If valid, injects the user ID into `req.user`.
 * Responds with 401 if the token is missing, invalid, or expired.
 *
 * @param req - Incoming request with optional Authorization header.
 * @param res - HTTP response used for error response.
 * @param next - Calls the next middleware if the token is valid.
 */
export async function verifyToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const bearerPrefix = `${AuthScheme.BEARER} `;

    if (!authHeader || !authHeader.startsWith(bearerPrefix)) {
        answerAPI(req, res, HTTPStatus.UNAUTHORIZED, undefined, Resource.EXPIRED_OR_INVALID_TOKEN);
        return;
    }

    const token = authHeader.slice(bearerPrefix.length);

    try {
        const tokenData = TokenUtils.verifyAccessToken(token) as { id: number };
        const userService = new UserService();
        const userResult = await userService.findOne(tokenData.id);

        if (!userResult.success || !userResult.data || !userResult.data.active || !userResult.data.emailVerifiedAt) {
            answerAPI(req, res, HTTPStatus.UNAUTHORIZED, undefined, Resource.EXPIRED_OR_INVALID_TOKEN);
            return;
        }

        req.user = { id: tokenData.id };
        next();
    } catch {
        answerAPI(req, res, HTTPStatus.UNAUTHORIZED, undefined, Resource.EXPIRED_OR_INVALID_TOKEN);
        return;
    }
}

