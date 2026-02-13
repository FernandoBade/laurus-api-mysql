import crypto from 'crypto';
import type { JwtPayload } from 'jsonwebtoken';
import { LogCategory, LogOperation, LogType } from '../../../../shared/enums';
import { PERSISTED_TOKEN_EXPIRES_IN } from '../../../src/utils/auth/tokenConfig';

jest.mock('jsonwebtoken', () => ({
    sign: jest.fn(),
    verify: jest.fn(),
}));

const originalAccess = process.env.JWT_ACCESS_SECRET;
const originalRefresh = process.env.JWT_REFRESH_SECRET;
const originalIssuer = process.env.JWT_ISSUER;
const originalAudience = process.env.JWT_AUDIENCE;

const restoreEnv = () => {
    if (originalAccess === undefined) {
        delete process.env.JWT_ACCESS_SECRET;
    } else {
        process.env.JWT_ACCESS_SECRET = originalAccess;
    }
    if (originalRefresh === undefined) {
        delete process.env.JWT_REFRESH_SECRET;
    } else {
        process.env.JWT_REFRESH_SECRET = originalRefresh;
    }
    if (originalIssuer === undefined) {
        delete process.env.JWT_ISSUER;
    } else {
        process.env.JWT_ISSUER = originalIssuer;
    }
    if (originalAudience === undefined) {
        delete process.env.JWT_AUDIENCE;
    } else {
        process.env.JWT_AUDIENCE = originalAudience;
    }
};

const loadTokenUtils = async (accessSecret: string, refreshSecret: string, issuer?: string, audience?: string) => {
    jest.resetModules();
    process.env.JWT_ACCESS_SECRET = accessSecret;
    process.env.JWT_REFRESH_SECRET = refreshSecret;
    if (issuer !== undefined) {
        process.env.JWT_ISSUER = issuer;
    } else {
        delete process.env.JWT_ISSUER;
    }
    if (audience !== undefined) {
        process.env.JWT_AUDIENCE = audience;
    } else {
        delete process.env.JWT_AUDIENCE;
    }

    const commons = await import('../../../src/utils/commons');
    const createLogSpy = jest.spyOn(commons, 'createLog').mockResolvedValue(undefined);

    const jwt = await import('jsonwebtoken');
    const signSpy = jest.spyOn(jwt, 'sign').mockImplementation(() => 'token');
    const verifySpy = jest.spyOn(jwt, 'verify').mockImplementation(() => ({ id: 1 } as JwtPayload));

    const { TokenUtils } = await import('../../../src/utils/auth/tokenUtils');

    return { TokenUtils, createLogSpy, signSpy, verifySpy };
};

describe('TokenUtils', () => {
    afterEach(() => {
        restoreEnv();
        jest.restoreAllMocks();
    });

    it('throws and logs when secrets are missing', async () => {
        const { TokenUtils, createLogSpy, signSpy } = await loadTokenUtils('', '');

        expect(() => TokenUtils.generateAccessToken({ id: 1 })).toThrow('TokenUtilsInvariantViolation: jwt secrets missing');
        expect(createLogSpy).toHaveBeenCalledWith(
            LogType.DEBUG,
            LogOperation.CREATE,
            LogCategory.AUTH,
            expect.stringContaining('JWT_ACCESS_SECRET')
        );
        expect(signSpy).not.toHaveBeenCalled();
    });

    it('generates access token with jwt.sign', async () => {
        const { TokenUtils, createLogSpy, signSpy } = await loadTokenUtils('access', 'refresh');

        const result = TokenUtils.generateAccessToken({ id: 1 });

        expect(result).toBe('token');
        expect(signSpy).toHaveBeenCalledWith({ id: 1 }, 'access', { expiresIn: '1h', algorithm: 'HS256' });
        expect(createLogSpy).not.toHaveBeenCalled();
    });

    it('generates refresh token with jwt.sign', async () => {
        const { TokenUtils, signSpy } = await loadTokenUtils('access', 'refresh');

        const result = TokenUtils.generateRefreshToken({ id: 2 });

        expect(result).toBe('token');
        expect(signSpy).toHaveBeenCalledWith({ id: 2 }, 'refresh', { expiresIn: PERSISTED_TOKEN_EXPIRES_IN, algorithm: 'HS256' });
    });

    it('verifies access token with jwt.verify', async () => {
        const { TokenUtils, verifySpy } = await loadTokenUtils('access', 'refresh');

        const result = TokenUtils.verifyAccessToken('token');

        expect(result).toEqual({ id: 1 });
        expect(verifySpy).toHaveBeenCalledWith('token', 'access', { algorithms: ['HS256'] });
    });

    it('verifies refresh token with jwt.verify', async () => {
        const { TokenUtils, verifySpy } = await loadTokenUtils('access', 'refresh');

        const result = TokenUtils.verifyRefreshToken('refresh-token');

        expect(result).toEqual({ id: 1 });
        expect(verifySpy).toHaveBeenCalledWith('refresh-token', 'refresh', { algorithms: ['HS256'] });
    });

    it('includes issuer and audience when provided', async () => {
        const { TokenUtils, signSpy, verifySpy } = await loadTokenUtils('access', 'refresh', 'issuer', 'audience');

        TokenUtils.generateAccessToken({ id: 1 });
        TokenUtils.verifyAccessToken('token');

        expect(signSpy).toHaveBeenCalledWith(
            { id: 1 },
            'access',
            { expiresIn: '1h', algorithm: 'HS256', issuer: 'issuer', audience: 'audience' }
        );
        expect(verifySpy).toHaveBeenCalledWith(
            'token',
            'access',
            { algorithms: ['HS256'], issuer: 'issuer', audience: 'audience' }
        );
    });

    it('hashes refresh tokens with HMAC-SHA256', async () => {
        const { TokenUtils } = await loadTokenUtils('access', 'refresh');

        const result = TokenUtils.hashRefreshToken('refresh-token');
        const expected = crypto.createHmac('sha256', 'refresh').update('refresh-token').digest('hex');

        expect(result).toBe(expected);
    });
});

