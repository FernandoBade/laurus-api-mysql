import bcrypt from 'bcrypt';
import { AuthService } from '../../../src/service/authService';
import { RefreshTokenService } from '../../../src/service/refreshTokenService';
import { UserService } from '../../../src/service/userService';
import { LogCategory, LogOperation, LogType } from '../../../src/utils/enum';
import { TokenUtils } from '../../../src/utils/auth/tokenUtils';
import { Resource } from '../../../src/utils/resources/resource';
import { ResourceBase } from '../../../src/utils/resources/languages/resourceService';
import { SelectRefreshToken } from '../../../src/db/schema';
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

const makeRefreshToken = (overrides: Partial<SelectRefreshToken> = {}): SelectRefreshToken => {
  const now = new Date('2024-01-01T00:00:00Z');
  return {
    id: overrides.id ?? 1,
    token: overrides.token ?? 'refresh-token',
    expiresAt: overrides.expiresAt ?? new Date('2099-01-01T00:00:00Z'),
    userId: overrides.userId ?? 1,
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
  };
};

describe('AuthService', () => {
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    logSpy = jest.spyOn(commons, 'createLog').mockResolvedValue();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('login', () => {
    it('returns invalid credentials when password is missing', async () => {
      const getUsersSpy = jest.spyOn(UserService.prototype, 'getUsersByEmail');

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
      const getUsersSpy = jest.spyOn(UserService.prototype, 'getUsersByEmail').mockResolvedValue({ success: true, data: [] });
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
      jest.spyOn(UserService.prototype, 'getUsersByEmail').mockResolvedValue({ success: true, data: [sanitized] });
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

    it('returns invalid credentials when password does not match', async () => {
      const user = makeUser({ id: 4, email: 'user@example.com' });
      const sanitized = makeSanitizedUser({ id: user.id, email: user.email });
      jest.spyOn(UserService.prototype, 'getUsersByEmail').mockResolvedValue({ success: true, data: [sanitized] });
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
      jest.spyOn(UserService.prototype, 'getUsersByEmail').mockResolvedValue({ success: true, data: [sanitized] });
      jest.spyOn(UserService.prototype, 'findOne').mockResolvedValue({ success: true, data: user });
      compareMock.mockResolvedValue(true);
      jest.spyOn(TokenUtils, 'generateAccessToken').mockReturnValue('access-token');
      jest.spyOn(TokenUtils, 'generateRefreshToken').mockReturnValue('refresh-token');
      const createTokenSpy = jest.spyOn(RefreshTokenService.prototype, 'createRefreshToken').mockResolvedValue({
        success: false,
        error: Resource.INTERNAL_SERVER_ERROR,
      });

      const service = new AuthService();
      const result = await service.login('user@example.com', 'secret');

      expect(createTokenSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ success: false, error: Resource.INTERNAL_SERVER_ERROR });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe(Resource.INTERNAL_SERVER_ERROR);
        expect(translate(result.error)).toBe(translate(Resource.INTERNAL_SERVER_ERROR));
      }
      expect(logSpy).not.toHaveBeenCalled();
    });

    it('returns tokens and user when login succeeds', async () => {
      const user = makeUser({ id: 6, email: 'user@example.com' });
      const getUsersSpy = jest.spyOn(UserService.prototype, 'getUsersByEmail').mockResolvedValue({
        success: true,
        data: [makeSanitizedUser({ id: user.id, email: user.email })],
      });
      const findOneSpy = jest.spyOn(UserService.prototype, 'findOne').mockResolvedValue({ success: true, data: user });
      compareMock.mockResolvedValue(true);
      jest.spyOn(TokenUtils, 'generateAccessToken').mockReturnValue('access-token');
      jest.spyOn(TokenUtils, 'generateRefreshToken').mockReturnValue('refresh-token');
      const createTokenSpy = jest.spyOn(RefreshTokenService.prototype, 'createRefreshToken').mockResolvedValue({
        success: true,
        data: makeRefreshToken({ id: 99, token: 'refresh-token', userId: user.id }),
      });

      const service = new AuthService();
      const result = await service.login('  USER@Example.com ', 'secret');

      expect(getUsersSpy).toHaveBeenCalledWith('user@example.com');
      expect(findOneSpy).toHaveBeenCalledWith(user.id);
      expect(compareMock).toHaveBeenCalledWith('secret', user.password);
      expect(createTokenSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          token: 'refresh-token',
          userId: user.id,
          expiresAt: expect.any(Date),
        })
      );
      expect(result).toEqual({
        success: true,
        data: {
          token: 'access-token',
          refreshToken: 'refresh-token',
          user,
        },
      });
      expect(logSpy).not.toHaveBeenCalled();
    });

    it('throws when user lookup rejects', async () => {
      jest.spyOn(UserService.prototype, 'getUsersByEmail').mockRejectedValue(new Error(Resource.INTERNAL_SERVER_ERROR));

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
      const findTokenSpy = jest.spyOn(RefreshTokenService.prototype, 'findByToken').mockResolvedValue({
        success: false,
        error: Resource.TOKEN_NOT_FOUND,
      });
      const verifySpy = jest.spyOn(TokenUtils, 'verifyRefreshToken');

      const service = new AuthService();
      const result = await service.refresh('missing');

      expect(findTokenSpy).toHaveBeenCalledWith('missing');
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
      jest.spyOn(RefreshTokenService.prototype, 'findByToken').mockResolvedValue({
        success: true,
        data: makeRefreshToken({ id: 1, token: 'expired', expiresAt: new Date('2000-01-01T00:00:00Z'), userId: 1 }),
      });
      const verifySpy = jest.spyOn(TokenUtils, 'verifyRefreshToken');

      const service = new AuthService();
      const result = await service.refresh('expired');

      expect(verifySpy).not.toHaveBeenCalled();
      expect(result).toEqual({ success: false, error: Resource.EXPIRED_OR_INVALID_TOKEN });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe(Resource.EXPIRED_OR_INVALID_TOKEN);
        expect(translate(result.error)).toBe(translate(Resource.EXPIRED_OR_INVALID_TOKEN));
      }
      expect(logSpy).not.toHaveBeenCalled();
    });

    it('returns expired token error when token verification throws', async () => {
      jest.spyOn(RefreshTokenService.prototype, 'findByToken').mockResolvedValue({
        success: true,
        data: makeRefreshToken({ id: 1, token: 'bad', expiresAt: new Date('2099-01-01T00:00:00Z'), userId: 1 }),
      });
      jest.spyOn(TokenUtils, 'verifyRefreshToken').mockImplementation(() => {
        throw new Error(Resource.EXPIRED_OR_INVALID_TOKEN);
      });

      const service = new AuthService();
      const result = await service.refresh('bad');

      expect(result).toEqual({ success: false, error: Resource.EXPIRED_OR_INVALID_TOKEN });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe(Resource.EXPIRED_OR_INVALID_TOKEN);
        expect(translate(result.error)).toBe(translate(Resource.EXPIRED_OR_INVALID_TOKEN));
      }
      expect(logSpy).not.toHaveBeenCalled();
    });

    it('returns new access token when refresh succeeds', async () => {
      jest.spyOn(RefreshTokenService.prototype, 'findByToken').mockResolvedValue({
        success: true,
        data: makeRefreshToken({ id: 2, token: 'valid', expiresAt: new Date('2099-01-01T00:00:00Z'), userId: 42 }),
      });
      jest.spyOn(TokenUtils, 'verifyRefreshToken').mockReturnValue({ id: 42 });
      const generateSpy = jest.spyOn(TokenUtils, 'generateAccessToken').mockReturnValue('new-access-token');

      const service = new AuthService();
      const result = await service.refresh('valid');

      expect(generateSpy).toHaveBeenCalledWith({ id: 42 });
      expect(result).toEqual({ success: true, data: { token: 'new-access-token' } });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ token: 'new-access-token' });
      }
      expect(logSpy).not.toHaveBeenCalled();
    });

    it('throws when refresh token lookup rejects', async () => {
      jest.spyOn(RefreshTokenService.prototype, 'findByToken').mockRejectedValue(new Error(Resource.INTERNAL_SERVER_ERROR));

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
      const findTokenSpy = jest.spyOn(RefreshTokenService.prototype, 'findByToken').mockResolvedValue({
        success: false,
        error: Resource.TOKEN_NOT_FOUND,
      });
      const deleteSpy = jest.spyOn(RefreshTokenService.prototype, 'deleteRefreshToken');

      const service = new AuthService();
      const result = await service.logout('missing-token');

      expect(findTokenSpy).toHaveBeenCalledWith('missing-token');
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
        expect.stringContaining('missing-token')
      );
    });

    it('logs success and deletes refresh token when token exists', async () => {
      const stored = makeRefreshToken({ id: 77, token: 'stored', userId: 9 });
      jest.spyOn(RefreshTokenService.prototype, 'findByToken').mockResolvedValue({ success: true, data: stored });
      const deleteSpy = jest.spyOn(RefreshTokenService.prototype, 'deleteRefreshToken').mockResolvedValue();

      const service = new AuthService();
      const result = await service.logout('stored');

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
      jest.spyOn(RefreshTokenService.prototype, 'findByToken').mockRejectedValue(new Error(Resource.INTERNAL_SERVER_ERROR));

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
