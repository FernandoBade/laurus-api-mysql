import { LogCategory, LogOperation, LogType } from '../../../src/utils/enum';

jest.mock('jsonwebtoken', () => ({
    sign: jest.fn(),
    verify: jest.fn(),
}));

const originalAccess = process.env.JWT_ACCESS_SECRET;
const originalRefresh = process.env.JWT_REFRESH_SECRET;

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
};

const loadTokenUtils = async (accessSecret: string, refreshSecret: string) => {
    jest.resetModules();
    process.env.JWT_ACCESS_SECRET = accessSecret;
    process.env.JWT_REFRESH_SECRET = refreshSecret;

    const commons = await import('../../../src/utils/commons');
    const createLogSpy = jest.spyOn(commons, 'createLog').mockResolvedValue(undefined);

    const jwt = await import('jsonwebtoken');
    const signSpy = jest.spyOn(jwt, 'sign').mockReturnValue('token' as any);
    const verifySpy = jest.spyOn(jwt, 'verify').mockReturnValue({ id: 1 } as any);

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
        expect(signSpy).toHaveBeenCalledWith({ id: 1 }, 'access', { expiresIn: '1h' });
        expect(createLogSpy).not.toHaveBeenCalled();
    });

    it('generates refresh token with jwt.sign', async () => {
        const { TokenUtils, signSpy } = await loadTokenUtils('access', 'refresh');

        const result = TokenUtils.generateRefreshToken({ id: 2 });

        expect(result).toBe('token');
        expect(signSpy).toHaveBeenCalledWith({ id: 2 }, 'refresh', { expiresIn: '365d' });
    });

    it('verifies access token with jwt.verify', async () => {
        const { TokenUtils, verifySpy } = await loadTokenUtils('access', 'refresh');

        const result = TokenUtils.verifyAccessToken('token');

        expect(result).toEqual({ id: 1 });
        expect(verifySpy).toHaveBeenCalledWith('token', 'access');
    });

    it('verifies refresh token with jwt.verify', async () => {
        const { TokenUtils, verifySpy } = await loadTokenUtils('access', 'refresh');

        const result = TokenUtils.verifyRefreshToken('refresh-token');

        expect(result).toEqual({ id: 1 });
        expect(verifySpy).toHaveBeenCalledWith('refresh-token', 'refresh');
    });
});
