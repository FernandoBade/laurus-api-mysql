import { RefreshTokenService } from '../../../src/service/refreshTokenService';
import { RefreshTokenRepository } from '../../../src/repositories/refreshTokenRepository';
import { Resource } from '../../../src/utils/resources/resource';
import { ResourceBase } from '../../../src/utils/resources/languages/resourceService';
import { SelectRefreshToken } from '../../../src/db/schema';

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

describe('RefreshTokenService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('findById', () => {
        it('returns refresh token when repository returns a record', async () => {
            const token = makeRefreshToken({ id: 1 });
            const findSpy = jest.spyOn(RefreshTokenRepository.prototype, 'findById').mockResolvedValue(token);

            const service = new RefreshTokenService();
            const result = await service.findById(1);

            expect(findSpy).toHaveBeenCalledWith(1);
            expect(result).toEqual(token);
        });

        it('returns null when repository returns null', async () => {
            jest.spyOn(RefreshTokenRepository.prototype, 'findById').mockResolvedValue(null);

            const service = new RefreshTokenService();
            const result = await service.findById(2);

            expect(result).toBeNull();
        });

        it('throws when repository lookup rejects', async () => {
            jest.spyOn(RefreshTokenRepository.prototype, 'findById').mockRejectedValue(new Error(Resource.INTERNAL_SERVER_ERROR));

            const service = new RefreshTokenService();
            let caught: unknown;

            try {
                await service.findById(3);
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
        });
    });

    describe('findByToken', () => {
        it('returns token not found when repository returns null', async () => {
            const findSpy = jest.spyOn(RefreshTokenRepository.prototype, 'findByToken').mockResolvedValue(null);

            const service = new RefreshTokenService();
            const result = await service.findByToken('missing');

            expect(findSpy).toHaveBeenCalledWith('missing');
            expect(result).toEqual({ success: false, error: Resource.TOKEN_NOT_FOUND });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.TOKEN_NOT_FOUND);
                expect(translate(result.error)).toBe(translate(Resource.TOKEN_NOT_FOUND));
            }
        });

        it('returns refresh token when repository returns a record', async () => {
            const token = makeRefreshToken({ id: 4, token: 'valid' });
            jest.spyOn(RefreshTokenRepository.prototype, 'findByToken').mockResolvedValue(token);

            const service = new RefreshTokenService();
            const result = await service.findByToken('valid');

            expect(result).toEqual({ success: true, data: token });
        });

        it('throws when repository lookup rejects', async () => {
            jest.spyOn(RefreshTokenRepository.prototype, 'findByToken').mockRejectedValue(new Error(Resource.INTERNAL_SERVER_ERROR));

            const service = new RefreshTokenService();
            let caught: unknown;

            try {
                await service.findByToken('fail');
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
        });
    });

    describe('createRefreshToken', () => {
        it('creates refresh token when repository succeeds', async () => {
            const token = makeRefreshToken({ id: 5 });
            const createSpy = jest.spyOn(RefreshTokenRepository.prototype, 'create').mockResolvedValue(token);

            const service = new RefreshTokenService();
            const payload = { token: 'refresh', userId: 1, expiresAt: token.expiresAt };
            const result = await service.createRefreshToken(payload);

            expect(createSpy).toHaveBeenCalledTimes(1);
            expect(result).toEqual({ success: true, data: token });
        });

        it('returns internal server error when repository create fails', async () => {
            jest.spyOn(RefreshTokenRepository.prototype, 'create').mockRejectedValue(new Error(Resource.INTERNAL_SERVER_ERROR));

            const service = new RefreshTokenService();
            const payload = { token: 'refresh', userId: 1, expiresAt: new Date() };
            const result = await service.createRefreshToken(payload);

            expect(result).toEqual({ success: false, error: Resource.INTERNAL_SERVER_ERROR });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.INTERNAL_SERVER_ERROR);
                expect(translate(result.error)).toBe(translate(Resource.INTERNAL_SERVER_ERROR));
            }
        });
    });

    describe('deleteRefreshToken', () => {
        it('deletes refresh token by id', async () => {
            const deleteSpy = jest.spyOn(RefreshTokenRepository.prototype, 'delete').mockResolvedValue();

            const service = new RefreshTokenService();
            await service.deleteRefreshToken(9);

            expect(deleteSpy).toHaveBeenCalledWith(9);
        });

        it('throws when repository delete rejects', async () => {
            jest.spyOn(RefreshTokenRepository.prototype, 'delete').mockRejectedValue(new Error(Resource.INTERNAL_SERVER_ERROR));

            const service = new RefreshTokenService();
            let caught: unknown;

            try {
                await service.deleteRefreshToken(10);
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
        });
    });

    describe('create', () => {
        it('creates refresh token when repository succeeds', async () => {
            const token = makeRefreshToken({ id: 6 });
            const createSpy = jest.spyOn(RefreshTokenRepository.prototype, 'create').mockResolvedValue(token);

            const service = new RefreshTokenService();
            const payload = { token: 'alias', userId: 1, expiresAt: token.expiresAt };
            const result = await service.create(payload);

            expect(createSpy).toHaveBeenCalledTimes(1);
            expect(result).toEqual(token);
        });

        it('throws when repository create rejects', async () => {
            jest.spyOn(RefreshTokenRepository.prototype, 'create').mockRejectedValue(new Error(Resource.INTERNAL_SERVER_ERROR));

            const service = new RefreshTokenService();
            let caught: unknown;

            try {
                await service.create({ token: 'alias', userId: 1, expiresAt: new Date() });
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
        });
    });

    describe('delete', () => {
        it('deletes refresh token by id', async () => {
            const deleteSpy = jest.spyOn(RefreshTokenRepository.prototype, 'delete').mockResolvedValue();

            const service = new RefreshTokenService();
            await service.delete(11);

            expect(deleteSpy).toHaveBeenCalledWith(11);
        });

        it('throws when repository delete rejects', async () => {
            jest.spyOn(RefreshTokenRepository.prototype, 'delete').mockRejectedValue(new Error(Resource.INTERNAL_SERVER_ERROR));

            const service = new RefreshTokenService();
            let caught: unknown;

            try {
                await service.delete(12);
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
        });
    });

    describe('deleteByToken', () => {
        it('deletes refresh token by token', async () => {
            const deleteSpy = jest.spyOn(RefreshTokenRepository.prototype, 'deleteByToken').mockResolvedValue();

            const service = new RefreshTokenService();
            await service.deleteByToken('token');

            expect(deleteSpy).toHaveBeenCalledWith('token');
        });

        it('throws when repository deleteByToken rejects', async () => {
            jest.spyOn(RefreshTokenRepository.prototype, 'deleteByToken').mockRejectedValue(new Error(Resource.INTERNAL_SERVER_ERROR));

            const service = new RefreshTokenService();
            let caught: unknown;

            try {
                await service.deleteByToken('token');
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
        });
    });
});
