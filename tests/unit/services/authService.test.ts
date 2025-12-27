import bcrypt from 'bcrypt';
import { AuthService } from '../../../src/service/authService';
import { TokenService } from '../../../src/service/tokenService';
import { UserService } from '../../../src/service/userService';
import { LogCategory, LogOperation, LogType, TokenType } from '../../../src/utils/enum';
import { TokenUtils } from '../../../src/utils/auth/tokenUtils';
import { PERSISTED_TOKEN_TTL_DAYS } from '../../../src/utils/auth/tokenConfig';
import { Resource } from '../../../src/utils/resources/resource';
import { ResourceBase } from '../../../src/utils/resources/languages/resourceService';
import { SelectToken } from '../../../src/db/schema';
import * as commons from '../../../src/utils/commons';
import { makeSanitizedUser, makeUser } from '../../helpers/factories';

jest.mock('bcrypt', () => ({
    hash: jest.fn(),
    compare: jest.fn(),
}));

type HashFn = (data: string | Buffer, saltOrRounds: string | number) => Promise<string>;
type CompareFn = (data: string | Buffer, encrypted: string) => Promise<boolean>;

const hashMock = bcrypt.hash as jest.MockedFunction<HashFn>;
const compareMock = bcrypt.compare as jest.MockedFunction<CompareFn>;

const translate = (resource: Resource) => ResourceBase.translate(resource, 'en-US');
const isResource = (value: string): value is Resource => value in Resource;

const makeToken = (overrides: Partial<SelectToken> = {}): SelectToken => {
    const now = new Date('2024-01-01T00:00:00Z');
    return {
        id: overrides.id ?? 1,
        tokenHash: overrides.tokenHash ?? 'refresh-token-hash',
        type: overrides.type ?? TokenType.REFRESH,
        expiresAt: overrides.expiresAt ?? new Date('2099-01-01T00:00:00Z'),
        userId: overrides.userId ?? 1,
        createdAt: overrides.createdAt ?? now,
        updatedAt: overrides.updatedAt ?? now,
    };
};

describe('AuthService', () => {
    let logSpy: jest.SpyInstance;
    let cleanupSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        logSpy = jest.spyOn(commons, 'createLog').mockResolvedValue();
        cleanupSpy = jest.spyOn(TokenService.prototype, 'deleteExpiredTokens').mockResolvedValue({ success: true, data: { deleted: 0 } });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('login', () => {
        it('returns invalid credentials when password is missing', async () => {
            const getUsersSpy = jest.spyOn(UserService.prototype, 'findUserByEmailExact');

            const service = new AuthService();
            const result = await service.login('user@example.com', '');

            expect(getUsersSpy).not.toHaveBeenCalled();
            expect(result).toEqual({ success: false, error: Resource.INVALID_CREDENTIALS });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.INVALID_CREDENTIALS);
                expect(translate(result.error)).toBe(translate(Resource.INVALID_CREDENTIALS));
            }
            expect(logSpy).not.toHaveBeenCalled();
        });

        it('returns invalid credentials when user lookup yields no data', async () => {
            const getUsersSpy = jest.spyOn(UserService.prototype, 'findUserByEmailExact').mockResolvedValue({
                success: false,
                error: Resource.USER_NOT_FOUND,
            });
            const findOneSpy = jest.spyOn(UserService.prototype, 'findOne');

            const service = new AuthService();
            const result = await service.login('user@example.com', 'secret');

            expect(getUsersSpy).toHaveBeenCalledWith('user@example.com');
            expect(findOneSpy).not.toHaveBeenCalled();
            expect(result).toEqual({ success: false, error: Resource.INVALID_CREDENTIALS });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.INVALID_CREDENTIALS);
                expect(translate(result.error)).toBe(translate(Resource.INVALID_CREDENTIALS));
            }
            expect(logSpy).not.toHaveBeenCalled();
        });

        it('returns invalid credentials when full user lookup fails', async () => {
            const sanitized = makeSanitizedUser({ id: 3 });
            jest.spyOn(UserService.prototype, 'findUserByEmailExact').mockResolvedValue({ success: true, data: sanitized });
            const findOneSpy = jest.spyOn(UserService.prototype, 'findOne').mockResolvedValue({
                success: false,
                error: Resource.USER_NOT_FOUND,
            });

            const service = new AuthService();
            const result = await service.login('user@example.com', 'secret');

            expect(findOneSpy).toHaveBeenCalledWith(3);
            expect(result).toEqual({ success: false, error: Resource.INVALID_CREDENTIALS });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.INVALID_CREDENTIALS);
                expect(translate(result.error)).toBe(translate(Resource.INVALID_CREDENTIALS));
            }
            expect(logSpy).not.toHaveBeenCalled();
        });

        it('returns invalid credentials when user is inactive', async () => {
            const user = makeUser({ id: 4, email: 'user@example.com', active: false });
            const sanitized = makeSanitizedUser({ id: user.id, email: user.email, active: false });
            jest.spyOn(UserService.prototype, 'findUserByEmailExact').mockResolvedValue({ success: true, data: sanitized });
            jest.spyOn(UserService.prototype, 'findOne').mockResolvedValue({ success: true, data: user });

            const service = new AuthService();
            const result = await service.login('user@example.com', 'secret');

            expect(compareMock).not.toHaveBeenCalled();
            expect(result).toEqual({ success: false, error: Resource.INVALID_CREDENTIALS });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.INVALID_CREDENTIALS);
                expect(translate(result.error)).toBe(translate(Resource.INVALID_CREDENTIALS));
            }
            expect(logSpy).not.toHaveBeenCalled();
        });

        it('returns invalid credentials when password does not match', async () => {
            const user = makeUser({ id: 4, email: 'user@example.com' });
            const sanitized = makeSanitizedUser({ id: user.id, email: user.email });
            jest.spyOn(UserService.prototype, 'findUserByEmailExact').mockResolvedValue({ success: true, data: sanitized });
            jest.spyOn(UserService.prototype, 'findOne').mockResolvedValue({ success: true, data: user });
            compareMock.mockResolvedValue(false);

            const service = new AuthService();
            const result = await service.login('user@example.com', 'wrong');

            expect(compareMock).toHaveBeenCalledWith('wrong', user.password);
            expect(result).toEqual({ success: false, error: Resource.INVALID_CREDENTIALS });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.INVALID_CREDENTIALS);
                expect(translate(result.error)).toBe(translate(Resource.INVALID_CREDENTIALS));
            }
            expect(logSpy).not.toHaveBeenCalled();
        });

        it('returns internal server error when refresh token persistence fails', async () => {
            const user = makeUser({ id: 5, email: 'user@example.com' });
            const sanitized = makeSanitizedUser({ id: user.id, email: user.email });
            jest.spyOn(UserService.prototype, 'findUserByEmailExact').mockResolvedValue({ success: true, data: sanitized });
            jest.spyOn(UserService.prototype, 'findOne').mockResolvedValue({ success: true, data: user });
            compareMock.mockResolvedValue(true);
            jest.spyOn(TokenUtils, 'generateAccessToken').mockReturnValue('access-token');
            jest.spyOn(TokenUtils, 'generateRefreshToken').mockReturnValue('refresh-token');
            const hashSpy = jest.spyOn(TokenUtils, 'hashRefreshToken').mockReturnValue('refresh-token-hash');
            const createTokenSpy = jest.spyOn(TokenService.prototype, 'createToken').mockResolvedValue({
                success: false,
                error: Resource.INTERNAL_SERVER_ERROR,
            });

            const service = new AuthService();
            const result = await service.login('user@example.com', 'secret');

            expect(hashSpy).toHaveBeenCalledWith('refresh-token');
            expect(createTokenSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    tokenHash: 'refresh-token-hash',
                    userId: user.id,
                    type: TokenType.REFRESH,
                })
            );
            expect(result).toEqual({ success: false, error: Resource.INTERNAL_SERVER_ERROR });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.INTERNAL_SERVER_ERROR);
                expect(translate(result.error)).toBe(translate(Resource.INTERNAL_SERVER_ERROR));
            }
            expect(logSpy).not.toHaveBeenCalled();
        });

        it('returns tokens and user when login succeeds', async () => {
            const now = new Date('2024-01-01T00:00:00Z');
            jest.useFakeTimers().setSystemTime(now);

            try {
                const user = makeUser({ id: 6, email: 'user@example.com' });
                const getUsersSpy = jest.spyOn(UserService.prototype, 'findUserByEmailExact').mockResolvedValue({
                    success: true,
                    data: makeSanitizedUser({ id: user.id, email: user.email }),
                });
                const findOneSpy = jest.spyOn(UserService.prototype, 'findOne').mockResolvedValue({ success: true, data: user });
                compareMock.mockResolvedValue(true);
                jest.spyOn(TokenUtils, 'generateAccessToken').mockReturnValue('access-token');
                jest.spyOn(TokenUtils, 'generateRefreshToken').mockReturnValue('refresh-token');
                const hashSpy = jest.spyOn(TokenUtils, 'hashRefreshToken').mockReturnValue('refresh-token-hash');
                const createTokenSpy = jest.spyOn(TokenService.prototype, 'createToken').mockResolvedValue({
                    success: true,
                    data: makeToken({ id: 99, tokenHash: 'refresh-token-hash', userId: user.id }),
                });

                const service = new AuthService();
                const result = await service.login('  USER@Example.com ', 'secret');

                const createPayload = createTokenSpy.mock.calls[0][0];
                const expectedExpiresAt = new Date(now);
                expectedExpiresAt.setDate(expectedExpiresAt.getDate() + PERSISTED_TOKEN_TTL_DAYS);

                expect(getUsersSpy).toHaveBeenCalledWith('user@example.com');
                expect(findOneSpy).toHaveBeenCalledWith(user.id);
                expect(compareMock).toHaveBeenCalledWith('secret', user.password);
                expect(hashSpy).toHaveBeenCalledWith('refresh-token');
                expect(createPayload).toEqual(expect.objectContaining({
                    tokenHash: 'refresh-token-hash',
                    userId: user.id,
                    type: TokenType.REFRESH,
                }));
                expect(createPayload.expiresAt.getTime()).toBe(expectedExpiresAt.getTime());
                expect(result).toEqual({
                    success: true,
                    data: {
                        token: 'access-token',
                        refreshToken: 'refresh-token',
                        user,
                    },
                });
                expect(cleanupSpy).toHaveBeenCalled();
                expect(logSpy).not.toHaveBeenCalled();
            } finally {
                jest.useRealTimers();
            }
        });

        it('throws when user lookup rejects', async () => {
            jest.spyOn(UserService.prototype, 'findUserByEmailExact').mockRejectedValue(new Error(Resource.INTERNAL_SERVER_ERROR));

            const service = new AuthService();
            let caught: unknown;

            try {
                await service.login('user@example.com', 'secret');
            } catch (error) {
                caught = error;
            }

            expect(caught).toBeInstanceOf(Error);
            if (caught instanceof Error) {
                expect(isResource(caught.message)).toBe(true);
                if (isResource(caught.message)) {
                    expect(translate(caught.message)).toBe(translate(Resource.INTERNAL_SERVER_ERROR));
                }
            }
            expect(logSpy).not.toHaveBeenCalled();
        });
    });

    describe('refresh', () => {
        it('returns expired token error when token is not found', async () => {
            const findTokenSpy = jest.spyOn(TokenService.prototype, 'findByTokenHash').mockResolvedValue({
                success: false,
                error: Resource.TOKEN_NOT_FOUND,
            });
            const hashSpy = jest.spyOn(TokenUtils, 'hashRefreshToken').mockReturnValue('missing-hash');
            const verifySpy = jest.spyOn(TokenUtils, 'verifyRefreshToken');

            const service = new AuthService();
            const result = await service.refresh('missing');

            expect(hashSpy).toHaveBeenCalledWith('missing');
            expect(findTokenSpy).toHaveBeenCalledWith('missing-hash');
            expect(verifySpy).not.toHaveBeenCalled();
            expect(result).toEqual({ success: false, error: Resource.EXPIRED_OR_INVALID_TOKEN });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.EXPIRED_OR_INVALID_TOKEN);
                expect(translate(result.error)).toBe(translate(Resource.EXPIRED_OR_INVALID_TOKEN));
            }
            expect(logSpy).not.toHaveBeenCalled();
        });

        it('returns expired token error when token is expired', async () => {
            jest.spyOn(TokenService.prototype, 'findByTokenHash').mockResolvedValue({
                success: true,
                data: makeToken({ id: 1, tokenHash: 'expired-hash', expiresAt: new Date('2000-01-01T00:00:00Z'), userId: 1 }),
            });
            const hashSpy = jest.spyOn(TokenUtils, 'hashRefreshToken').mockReturnValue('expired-hash');
            const verifySpy = jest.spyOn(TokenUtils, 'verifyRefreshToken');
            const deleteSpy = jest.spyOn(TokenService.prototype, 'deleteToken').mockResolvedValue(1);

            const service = new AuthService();
            const result = await service.refresh('expired');

            expect(hashSpy).toHaveBeenCalledWith('expired');
            expect(verifySpy).not.toHaveBeenCalled();
            expect(deleteSpy).toHaveBeenCalledWith(1);
            expect(result).toEqual({ success: false, error: Resource.EXPIRED_OR_INVALID_TOKEN });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.EXPIRED_OR_INVALID_TOKEN);
                expect(translate(result.error)).toBe(translate(Resource.EXPIRED_OR_INVALID_TOKEN));
            }
            expect(logSpy).not.toHaveBeenCalled();
        });

        it('returns expired token error when token verification throws', async () => {
            jest.spyOn(TokenService.prototype, 'findByTokenHash').mockResolvedValue({
                success: true,
                data: makeToken({ id: 1, tokenHash: 'bad-hash', expiresAt: new Date('2099-01-01T00:00:00Z'), userId: 1 }),
            });
            const hashSpy = jest.spyOn(TokenUtils, 'hashRefreshToken').mockReturnValue('bad-hash');
            jest.spyOn(TokenUtils, 'verifyRefreshToken').mockImplementation(() => {
                throw new Error(Resource.EXPIRED_OR_INVALID_TOKEN);
            });
            const deleteSpy = jest.spyOn(TokenService.prototype, 'deleteToken').mockResolvedValue(1);

            const service = new AuthService();
            const result = await service.refresh('bad');

            expect(hashSpy).toHaveBeenCalledWith('bad');
            expect(deleteSpy).toHaveBeenCalledWith(1);
            expect(result).toEqual({ success: false, error: Resource.EXPIRED_OR_INVALID_TOKEN });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.EXPIRED_OR_INVALID_TOKEN);
                expect(translate(result.error)).toBe(translate(Resource.EXPIRED_OR_INVALID_TOKEN));
            }
            expect(logSpy).not.toHaveBeenCalled();
        });

        it('returns new access token when refresh succeeds', async () => {
            const now = new Date('2024-01-01T00:00:00Z');
            jest.useFakeTimers().setSystemTime(now);

            try {
                jest.spyOn(TokenService.prototype, 'findByTokenHash').mockResolvedValue({
                    success: true,
                    data: makeToken({ id: 2, tokenHash: 'old-hash', expiresAt: new Date('2099-01-01T00:00:00Z'), userId: 42 }),
                });
                const hashSpy = jest.spyOn(TokenUtils, 'hashRefreshToken').mockReturnValueOnce('old-hash').mockReturnValueOnce('new-hash');
                jest.spyOn(TokenUtils, 'verifyRefreshToken').mockReturnValue({ id: 42 });
                jest.spyOn(UserService.prototype, 'findOne').mockResolvedValue({ success: true, data: makeUser({ id: 42, active: true }) });
                const generateAccessSpy = jest.spyOn(TokenUtils, 'generateAccessToken').mockReturnValue('new-access-token');
                const generateRefreshSpy = jest.spyOn(TokenUtils, 'generateRefreshToken').mockReturnValue('new-refresh-token');
                const createTokenSpy = jest.spyOn(TokenService.prototype, 'createToken').mockResolvedValue({
                    success: true,
                    data: makeToken({ id: 3, tokenHash: 'new-hash', userId: 42 }),
                });
                const deleteSpy = jest.spyOn(TokenService.prototype, 'deleteToken').mockResolvedValue(1);

                const service = new AuthService();
                const result = await service.refresh('valid');

                const createPayload = createTokenSpy.mock.calls[0][0];
                const expectedExpiresAt = new Date(now);
                expectedExpiresAt.setDate(expectedExpiresAt.getDate() + PERSISTED_TOKEN_TTL_DAYS);

                expect(hashSpy).toHaveBeenNthCalledWith(1, 'valid');
                expect(hashSpy).toHaveBeenNthCalledWith(2, 'new-refresh-token');
                expect(generateAccessSpy).toHaveBeenCalledWith({ id: 42 });
                expect(generateRefreshSpy).toHaveBeenCalledWith({ id: 42 });
                expect(createPayload).toEqual(expect.objectContaining({
                    tokenHash: 'new-hash',
                    userId: 42,
                    type: TokenType.REFRESH,
                }));
                expect(createPayload.expiresAt.getTime()).toBe(expectedExpiresAt.getTime());
                expect(deleteSpy).toHaveBeenCalledWith(2);
                expect(result).toEqual({ success: true, data: { token: 'new-access-token', refreshToken: 'new-refresh-token' } });
                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.data).toEqual({ token: 'new-access-token', refreshToken: 'new-refresh-token' });
                }
                expect(cleanupSpy).toHaveBeenCalled();
                expect(logSpy).not.toHaveBeenCalled();
            } finally {
                jest.useRealTimers();
            }
        });

        it('rejects refresh when stored token is already consumed', async () => {
            jest.spyOn(TokenService.prototype, 'findByTokenHash').mockResolvedValue({
                success: true,
                data: makeToken({ id: 4, tokenHash: 'old-hash', expiresAt: new Date('2099-01-01T00:00:00Z'), userId: 42 }),
            });
            jest.spyOn(TokenUtils, 'hashRefreshToken').mockReturnValueOnce('old-hash').mockReturnValueOnce('new-hash');
            jest.spyOn(TokenUtils, 'verifyRefreshToken').mockReturnValue({ id: 42 });
            jest.spyOn(UserService.prototype, 'findOne').mockResolvedValue({ success: true, data: makeUser({ id: 42, active: true }) });
            jest.spyOn(TokenUtils, 'generateAccessToken').mockReturnValue('new-access-token');
            jest.spyOn(TokenUtils, 'generateRefreshToken').mockReturnValue('new-refresh-token');
            jest.spyOn(TokenService.prototype, 'createToken').mockResolvedValue({
                success: true,
                data: makeToken({ id: 5, tokenHash: 'new-hash', userId: 42 }),
            });
            const deleteSpy = jest.spyOn(TokenService.prototype, 'deleteToken').mockResolvedValue(0);
            const deleteByHashSpy = jest.spyOn(TokenService.prototype, 'deleteByTokenHash').mockResolvedValue();

            const service = new AuthService();
            const result = await service.refresh('valid');

            expect(deleteSpy).toHaveBeenCalledWith(4);
            expect(deleteByHashSpy).toHaveBeenCalledWith('new-hash');
            expect(result).toEqual({ success: false, error: Resource.EXPIRED_OR_INVALID_TOKEN });
            expect(cleanupSpy).not.toHaveBeenCalled();
        });

        it('returns expired token error when user is inactive', async () => {
            jest.spyOn(TokenService.prototype, 'findByTokenHash').mockResolvedValue({
                success: true,
                data: makeToken({ id: 3, tokenHash: 'old-hash', expiresAt: new Date('2099-01-01T00:00:00Z'), userId: 42 }),
            });
            const hashSpy = jest.spyOn(TokenUtils, 'hashRefreshToken').mockReturnValue('old-hash');
            jest.spyOn(TokenUtils, 'verifyRefreshToken').mockReturnValue({ id: 42 });
            jest.spyOn(UserService.prototype, 'findOne').mockResolvedValue({ success: true, data: makeUser({ id: 42, active: false }) });
            const createTokenSpy = jest.spyOn(TokenService.prototype, 'createToken');
            const deleteSpy = jest.spyOn(TokenService.prototype, 'deleteToken').mockResolvedValue(1);

            const service = new AuthService();
            const result = await service.refresh('valid');

            expect(hashSpy).toHaveBeenCalledWith('valid');
            expect(createTokenSpy).not.toHaveBeenCalled();
            expect(deleteSpy).toHaveBeenCalledWith(3);
            expect(result).toEqual({ success: false, error: Resource.EXPIRED_OR_INVALID_TOKEN });
        });

        it('rejects reuse of a rotated refresh token', async () => {
            const findTokenSpy = jest.spyOn(TokenService.prototype, 'findByTokenHash')
                .mockResolvedValueOnce({
                    success: true,
                    data: makeToken({ id: 4, tokenHash: 'old-hash', expiresAt: new Date('2099-01-01T00:00:00Z'), userId: 42 }),
                })
                .mockResolvedValueOnce({
                    success: false,
                    error: Resource.TOKEN_NOT_FOUND,
                });
            jest.spyOn(TokenUtils, 'hashRefreshToken')
                .mockReturnValueOnce('old-hash')
                .mockReturnValueOnce('new-hash')
                .mockReturnValueOnce('old-hash');
            jest.spyOn(TokenUtils, 'verifyRefreshToken').mockReturnValue({ id: 42 });
            jest.spyOn(UserService.prototype, 'findOne').mockResolvedValue({ success: true, data: makeUser({ id: 42, active: true }) });
            jest.spyOn(TokenUtils, 'generateAccessToken').mockReturnValue('new-access-token');
            jest.spyOn(TokenUtils, 'generateRefreshToken').mockReturnValue('new-refresh-token');
            jest.spyOn(TokenService.prototype, 'createToken').mockResolvedValue({
                success: true,
                data: makeToken({ id: 5, tokenHash: 'new-hash', userId: 42 }),
            });
            jest.spyOn(TokenService.prototype, 'deleteToken').mockResolvedValue(1);

            const service = new AuthService();
            const first = await service.refresh('valid');
            const second = await service.refresh('valid');

            expect(findTokenSpy).toHaveBeenCalledTimes(2);
            expect(first.success).toBe(true);
            expect(second).toEqual({ success: false, error: Resource.EXPIRED_OR_INVALID_TOKEN });
        });

        it('throws when refresh token lookup rejects', async () => {
            jest.spyOn(TokenService.prototype, 'findByTokenHash').mockRejectedValue(new Error(Resource.INTERNAL_SERVER_ERROR));
            jest.spyOn(TokenUtils, 'hashRefreshToken').mockReturnValue('token-hash');

            const service = new AuthService();
            let caught: unknown;

            try {
                await service.refresh('token');
            } catch (error) {
                caught = error;
            }

            expect(caught).toBeInstanceOf(Error);
            if (caught instanceof Error) {
                expect(isResource(caught.message)).toBe(true);
                if (isResource(caught.message)) {
                    expect(translate(caught.message)).toBe(translate(Resource.INTERNAL_SERVER_ERROR));
                }
            }
            expect(logSpy).not.toHaveBeenCalled();
        });
    });

    describe('logout', () => {
        it('logs alert and returns token not found when refresh token is missing', async () => {
            const findTokenSpy = jest.spyOn(TokenService.prototype, 'findByTokenHash').mockResolvedValue({
                success: false,
                error: Resource.TOKEN_NOT_FOUND,
            });
            const deleteSpy = jest.spyOn(TokenService.prototype, 'deleteToken');
            const hashSpy = jest.spyOn(TokenUtils, 'hashRefreshToken').mockReturnValue('missing-hash');

            const service = new AuthService();
            const result = await service.logout('missing-token');

            expect(hashSpy).toHaveBeenCalledWith('missing-token');
            expect(findTokenSpy).toHaveBeenCalledWith('missing-hash');
            expect(deleteSpy).not.toHaveBeenCalled();
            expect(result).toEqual({ success: false, error: Resource.TOKEN_NOT_FOUND });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.TOKEN_NOT_FOUND);
                expect(translate(result.error)).toBe(translate(Resource.TOKEN_NOT_FOUND));
            }
            expect(logSpy).toHaveBeenCalledWith(
                LogType.ALERT,
                LogOperation.LOGOUT,
                LogCategory.AUTH,
                expect.stringContaining('missing-hash')
            );
        });

        it('logs success and deletes refresh token when token exists', async () => {
            const stored = makeToken({ id: 77, tokenHash: 'stored-hash', userId: 9 });
            jest.spyOn(TokenService.prototype, 'findByTokenHash').mockResolvedValue({ success: true, data: stored });
            const deleteSpy = jest.spyOn(TokenService.prototype, 'deleteToken').mockResolvedValue(1);
            const hashSpy = jest.spyOn(TokenUtils, 'hashRefreshToken').mockReturnValue('stored-hash');

            const service = new AuthService();
            const result = await service.logout('stored');

            expect(hashSpy).toHaveBeenCalledWith('stored');
            expect(deleteSpy).toHaveBeenCalledWith(77);
            expect(logSpy).toHaveBeenCalledWith(
                LogType.SUCCESS,
                LogOperation.LOGOUT,
                LogCategory.AUTH,
                expect.stringContaining('77'),
                stored.userId
            );
            expect(result).toEqual({ success: true, data: { userId: stored.userId } });
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual({ userId: stored.userId });
            }
        });

        it('throws when refresh token lookup rejects', async () => {
            jest.spyOn(TokenService.prototype, 'findByTokenHash').mockRejectedValue(new Error(Resource.INTERNAL_SERVER_ERROR));
            jest.spyOn(TokenUtils, 'hashRefreshToken').mockReturnValue('token-hash');

            const service = new AuthService();
            let caught: unknown;

            try {
                await service.logout('token');
            } catch (error) {
                caught = error;
            }

            expect(caught).toBeInstanceOf(Error);
            if (caught instanceof Error) {
                expect(isResource(caught.message)).toBe(true);
                if (isResource(caught.message)) {
                    expect(translate(caught.message)).toBe(translate(Resource.INTERNAL_SERVER_ERROR));
                }
            }
            expect(logSpy).not.toHaveBeenCalled();
        });
    });
});
