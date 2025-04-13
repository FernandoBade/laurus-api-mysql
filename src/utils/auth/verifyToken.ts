import { Request, Response, NextFunction } from 'express';
import { TokenUtils } from './tokenUtils';
import { answerAPI } from '../commons';
import { HTTPStatus } from '../enum';
import { Resource } from '../resources/resource';

/**
 * Middleware to validate the JWT access token from the Authorization header.
 * Injects the user ID into req.user if the token is valid.
 */
export function verifyToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        answerAPI(req, res, HTTPStatus.UNAUTHORIZED, undefined, Resource.EXPIRED_OR_INVALID_TOKEN);
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const tokenData = TokenUtils.verifyAccessToken(token) as { id: number };
        req.user = { id: tokenData.id };
        next();
    } catch {
        answerAPI(req, res, HTTPStatus.UNAUTHORIZED, undefined, Resource.EXPIRED_OR_INVALID_TOKEN);
        return;
    }
}
