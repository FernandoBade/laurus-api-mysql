import { TokenService } from '../../../src/service/tokenService';
import { TokenRepository } from '../../../src/repositories/tokenRepository';
import { LogCategory, LogOperation, LogType, TokenType } from '../../../src/utils/enum';
import { Resource } from '../../../src/utils/resources/resource';
import { ResourceBase } from '../../../src/utils/resources/languages/resourceService';
import { SelectToken, tokens } from '../../../src/db/schema';
import { db } from '../../../src/db';
import * as commons from '../../../src/utils/commons';

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

describe('TokenService', () => {
    let logSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        logSpy = jest.spyOn(commons, 'createLog').mockResolvedValue();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('findById', () => {
        it('returns token when repository returns a record', async () => {
            const token = makeToken({ id: 1 });
            const findSpy = jest.spyOn(TokenRepository.prototype, 'findById').mockResolvedValue(token);

            const service = new TokenService();
            const result = await service.findById(1);

            expect(findSpy).toHaveBeenCalledWith(1);
            expect(result).toEqual(token);
        });

        it('returns null when repository returns null', async () => {
            jest.spyOn(TokenRepository.prototype, 'findById').mockResolvedValue(null);

            const service = new TokenService();
            const result = await service.findById(2);

            expect(result).toBeNull();
        });

        it('throws when repository lookup rejects', async () => {
            jest.spyOn(TokenRepository.prototype, 'findById').mockRejectedValue(new Error(Resource.INTERNAL_SERVER_ERROR));

            const service = new TokenService();
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

    describe('findByTokenHash', () => {
        it('returns token not found when repository returns null', async () => {
            const findSpy = jest.spyOn(TokenRepository.prototype, 'findByTokenHash').mockResolvedValue(null);

            const service = new TokenService();
            const result = await service.findByTokenHash('missing');

            expect(findSpy).toHaveBeenCalledWith('missing');
            expect(result).toEqual({ success: false, error: Resource.TOKEN_NOT_FOUND });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.TOKEN_NOT_FOUND);
                expect(translate(result.error)).toBe(translate(Resource.TOKEN_NOT_FOUND));
            }
        });

        it('returns token when repository returns a record', async () => {
            const token = makeToken({ id: 4, tokenHash: 'valid-hash' });
            jest.spyOn(TokenRepository.prototype, 'findByTokenHash').mockResolvedValue(token);

            const service = new TokenService();
            const result = await service.findByTokenHash('valid-hash');

            expect(result).toEqual({ success: true, data: token });
        });

        it('throws when repository lookup rejects', async () => {
            jest.spyOn(TokenRepository.prototype, 'findByTokenHash').mockRejectedValue(new Error(Resource.INTERNAL_SERVER_ERROR));

            const service = new TokenService();
            let caught: unknown;

            try {
                await service.findByTokenHash('fail');
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

    describe('createToken', () => {
        it('creates token when repository succeeds', async () => {
            const token = makeToken({ id: 5 });
            const createSpy = jest.spyOn(TokenRepository.prototype, 'create').mockResolvedValue(token);

            const service = new TokenService();
            const payload = { tokenHash: 'refresh-hash', userId: 1, type: TokenType.REFRESH, expiresAt: token.expiresAt };
            const result = await service.createToken(payload);

            expect(createSpy).toHaveBeenCalledTimes(1);
            expect(result).toEqual({ success: true, data: token });
        });

        it('returns internal server error when repository create fails', async () => {
            jest.spyOn(TokenRepository.prototype, 'create').mockRejectedValue(new Error(Resource.INTERNAL_SERVER_ERROR));

            const service = new TokenService();
            const payload = { tokenHash: 'refresh-hash', userId: 1, type: TokenType.REFRESH, expiresAt: new Date() };
            const result = await service.createToken(payload);

            expect(result).toEqual({ success: false, error: Resource.INTERNAL_SERVER_ERROR });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.INTERNAL_SERVER_ERROR);
                expect(translate(result.error)).toBe(translate(Resource.INTERNAL_SERVER_ERROR));
            }
        });
    });

    describe('deleteToken', () => {
        it('deletes token by id', async () => {
            const deleteSpy = jest.spyOn(TokenRepository.prototype, 'delete').mockResolvedValue(1);

            const service = new TokenService();
            const result = await service.deleteToken(9);

            expect(deleteSpy).toHaveBeenCalledWith(9);
            expect(result).toBe(1);
        });

        it('throws when repository delete rejects', async () => {
            jest.spyOn(TokenRepository.prototype, 'delete').mockRejectedValue(new Error(Resource.INTERNAL_SERVER_ERROR));

            const service = new TokenService();
            let caught: unknown;

            try {
                await service.deleteToken(10);
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
        it('creates token when repository succeeds', async () => {
            const token = makeToken({ id: 6 });
            const createSpy = jest.spyOn(TokenRepository.prototype, 'create').mockResolvedValue(token);

            const service = new TokenService();
            const payload = { tokenHash: 'alias-hash', userId: 1, type: TokenType.REFRESH, expiresAt: token.expiresAt };
            const result = await service.create(payload);

            expect(createSpy).toHaveBeenCalledTimes(1);
            expect(result).toEqual(token);
        });

        it('throws when repository create rejects', async () => {
            jest.spyOn(TokenRepository.prototype, 'create').mockRejectedValue(new Error(Resource.INTERNAL_SERVER_ERROR));

            const service = new TokenService();
            let caught: unknown;

            try {
                await service.create({ tokenHash: 'alias-hash', userId: 1, type: TokenType.REFRESH, expiresAt: new Date() });
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
        it('deletes token by id', async () => {
            const deleteSpy = jest.spyOn(TokenRepository.prototype, 'delete').mockResolvedValue(1);

            const service = new TokenService();
            const result = await service.delete(11);

            expect(deleteSpy).toHaveBeenCalledWith(11);
            expect(result).toBe(1);
        });

        it('throws when repository delete rejects', async () => {
            jest.spyOn(TokenRepository.prototype, 'delete').mockRejectedValue(new Error(Resource.INTERNAL_SERVER_ERROR));

            const service = new TokenService();
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

    describe('deleteExpiredTokens', () => {
        it('deletes expired tokens and returns count', async () => {
            const whereSpy = jest.fn().mockResolvedValue([{ affectedRows: 2 }]);
            const originalDelete = db.delete.bind(db);
            const deleteSpy = jest.spyOn(db, 'delete').mockImplementation((...args) => {
                const builder = originalDelete(...args);
                jest.spyOn(builder, 'where').mockImplementation(whereSpy);
                return builder;
            });

            const service = new TokenService();
            const result = await service.deleteExpiredTokens();

            expect(deleteSpy).toHaveBeenCalledWith(tokens);
            expect(whereSpy).toHaveBeenCalledWith(expect.any(Object));
            expect(result).toEqual({ success: true, data: { deleted: 2 } });
            expect(logSpy).toHaveBeenCalledWith(
                LogType.DEBUG,
                LogOperation.DELETE,
                LogCategory.AUTH,
                expect.stringContaining('Deleted 2 expired tokens'),
                undefined
            );
        });

        it('returns internal server error when deletion fails', async () => {
            jest.spyOn(db, 'delete').mockImplementation(() => {
                throw new Error(Resource.INTERNAL_SERVER_ERROR);
            });

            const service = new TokenService();
            const result = await service.deleteExpiredTokens();

            expect(result).toEqual({ success: false, error: Resource.INTERNAL_SERVER_ERROR });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe(Resource.INTERNAL_SERVER_ERROR);
                expect(translate(result.error)).toBe(translate(Resource.INTERNAL_SERVER_ERROR));
            }
            expect(logSpy).not.toHaveBeenCalled();
        });
    });

    describe('deleteByTokenHash', () => {
        it('deletes token by token hash', async () => {
            const deleteSpy = jest.spyOn(TokenRepository.prototype, 'deleteByTokenHash').mockResolvedValue();

            const service = new TokenService();
            await service.deleteByTokenHash('token-hash');

            expect(deleteSpy).toHaveBeenCalledWith('token-hash');
        });

        it('throws when repository deleteByTokenHash rejects', async () => {
            jest.spyOn(TokenRepository.prototype, 'deleteByTokenHash').mockRejectedValue(new Error(Resource.INTERNAL_SERVER_ERROR));

            const service = new TokenService();
            let caught: unknown;

            try {
                await service.deleteByTokenHash('token-hash');
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
