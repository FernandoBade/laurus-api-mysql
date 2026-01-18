import { HTTPStatus } from '../../../src/utils/enum';
import { Resource } from '../../../src/utils/resources/resource';
import { ResourceBase } from '../../../src/utils/resources/languages/resourceService';
import {
    clearRateLimitState,
    rateLimitLogin,
    recordLoginFailure,
    resetLoginRateLimit,
} from '../../../src/utils/auth/rateLimiter';
import { createMockRequest, createMockResponse, createNext } from '../../helpers/mockExpress';

describe('auth rate limiter', () => {
    beforeEach(() => {
        clearRateLimitState();
    });

    it('returns 429 after too many failed login attempts', () => {
        const req = createMockRequest({
            ip: '127.0.0.1',
            body: { email: 'user@example.com' },
        });

        for (let i = 0; i < 5; i += 1) {
            recordLoginFailure(req);
        }

        const res = createMockResponse();
        const next = createNext();

        rateLimitLogin(req, res, next);

        expect(res.status).toHaveBeenCalledWith(HTTPStatus.TOO_MANY_REQUESTS);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
                message: ResourceBase.translate(Resource.TOO_MANY_REQUESTS, 'en-US'),
            })
        );
        expect(next).not.toHaveBeenCalled();
    });

    it('resets login limiter after success', () => {
        const req = createMockRequest({
            ip: '127.0.0.1',
            body: { email: 'user@example.com' },
        });

        for (let i = 0; i < 5; i += 1) {
            recordLoginFailure(req);
        }

        resetLoginRateLimit(req);

        const res = createMockResponse();
        const next = createNext();

        rateLimitLogin(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });
});
