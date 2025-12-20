import AuthController from '../../../src/controller/authController';
import { makeUser } from '../../helpers/factories';
import { AuthService } from '../../../src/service/authService';
import { HTTPStatus, LogCategory, LogOperation, LogType } from '../../../src/utils/enum';
import { Resource } from '../../../src/utils/resources/resource';
import { ResourceBase } from '../../../src/utils/resources/languages/resourceService';
import * as commons from '../../../src/utils/commons';
import { createMockRequest, createMockResponse, createNext } from '../../helpers/mockExpress';

describe('AuthController', () => {
    let logSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        logSpy = jest.spyOn(commons, 'createLog').mockResolvedValue();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('login', () => {
        it('returns 400 when credentials are missing', async () => {
            const loginSpy = jest.spyOn(AuthService.prototype, 'login');
            const req = createMockRequest({ body: { email: '', password: '' } });
            const res = createMockResponse();
            const next = createNext();

            await AuthController.login(req, res, next);

            expect(loginSpy).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(HTTPStatus.BAD_REQUEST);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: ResourceBase.translate(Resource.INVALID_CREDENTIALS, 'en-US'),
                })
            );
            expect(logSpy).not.toHaveBeenCalled();
            expect(next).not.toHaveBeenCalled();
        });

        it('returns 401 when service rejects credentials', async () => {
            const loginSpy = jest.spyOn(AuthService.prototype, 'login').mockResolvedValue({ success: false, error: Resource.INVALID_CREDENTIALS });
            const req = createMockRequest({ body: { email: 'a@b.com', password: 'wrong' } });
            const res = createMockResponse();
            const next = createNext();

            await AuthController.login(req, res, next);

            expect(loginSpy).toHaveBeenCalledTimes(1);
            expect(loginSpy).toHaveBeenCalledWith('a@b.com', 'wrong');
            expect(res.status).toHaveBeenCalledWith(HTTPStatus.UNAUTHORIZED);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: ResourceBase.translate(Resource.INVALID_CREDENTIALS, 'en-US'),
                })
            );
            expect(logSpy).not.toHaveBeenCalled();
            expect(next).not.toHaveBeenCalled();
        });

        it('returns 200 and logs on successful login', async () => {
            const data = { token: 'token123', refreshToken: 'refresh', user: makeUser({ id: 7 }) };
            const loginSpy = jest.spyOn(AuthService.prototype, 'login').mockResolvedValue({ success: true, data } as any);
            const req = createMockRequest({ body: { email: 'a@b.com', password: 'secret' }, cookies: {} });
            const res = createMockResponse();
            const next = createNext();

            await AuthController.login(req, res, next);

            expect(loginSpy).toHaveBeenCalledWith('a@b.com', 'secret');
            expect(res.cookie).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(HTTPStatus.OK);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: { token: data.token } }));
            expect(logSpy).toHaveBeenCalledWith(
                LogType.SUCCESS,
                LogOperation.LOGIN,
                LogCategory.AUTH,
                { "userId": 7 },
                7
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('returns 500 and logs when service throws', async () => {
            jest.spyOn(AuthService.prototype, 'login').mockRejectedValue(new Error('boom'));
            const req = createMockRequest({ body: { email: 'a@b.com', password: 'secret' } });
            const res = createMockResponse();
            const next = createNext();

            await AuthController.login(req, res, next);

            expect(res.status).toHaveBeenCalledWith(HTTPStatus.INTERNAL_SERVER_ERROR);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: ResourceBase.translate(Resource.INTERNAL_SERVER_ERROR, 'en-US'),
                })
            );
            expect(logSpy).toHaveBeenCalledWith(
                LogType.ERROR,
                LogOperation.LOGIN,
                LogCategory.AUTH,
                expect.any(Object),
                undefined,
                next
            );
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('refresh', () => {
        it('returns 401 when refresh token missing', async () => {
            const refreshSpy = jest.spyOn(AuthService.prototype, 'refresh');
            const req = createMockRequest({ cookies: {} });
            const res = createMockResponse();
            const next = createNext();

            await AuthController.refresh(req, res, next);

            expect(refreshSpy).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(HTTPStatus.UNAUTHORIZED);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: ResourceBase.translate(Resource.EXPIRED_OR_INVALID_TOKEN, 'en-US'),
                })
            );
            expect(logSpy).not.toHaveBeenCalled();
            expect(next).not.toHaveBeenCalled();
        });

        it('returns 401 when service rejects token', async () => {
            const refreshSpy = jest.spyOn(AuthService.prototype, 'refresh').mockResolvedValue({ success: false, error: Resource.EXPIRED_OR_INVALID_TOKEN });
            const req = createMockRequest({ cookies: { refreshToken: 'bad' } });
            const res = createMockResponse();
            const next = createNext();

            await AuthController.refresh(req, res, next);

            expect(refreshSpy).toHaveBeenCalledWith('bad');
            expect(res.status).toHaveBeenCalledWith(HTTPStatus.UNAUTHORIZED);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: ResourceBase.translate(Resource.EXPIRED_OR_INVALID_TOKEN, 'en-US'),
                })
            );
            expect(logSpy).not.toHaveBeenCalled();
            expect(next).not.toHaveBeenCalled();
        });

        it('returns 200 on success', async () => {
            const payload = { token: 'new-token' };
            const refreshSpy = jest.spyOn(AuthService.prototype, 'refresh').mockResolvedValue({ success: true, data: payload });
            const req = createMockRequest({ cookies: { refreshToken: 'good' } });
            const res = createMockResponse();
            const next = createNext();

            await AuthController.refresh(req, res, next);

            expect(refreshSpy).toHaveBeenCalledWith('good');
            expect(res.status).toHaveBeenCalledWith(HTTPStatus.OK);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: payload }));
            expect(logSpy).not.toHaveBeenCalled();
            expect(next).not.toHaveBeenCalled();
        });

        it('returns 500 and logs when service throws', async () => {
            jest.spyOn(AuthService.prototype, 'refresh').mockRejectedValue(new Error('boom'));
            const req = createMockRequest({ cookies: { refreshToken: 'x' } });
            const res = createMockResponse();
            const next = createNext();

            await AuthController.refresh(req, res, next);

            expect(res.status).toHaveBeenCalledWith(HTTPStatus.INTERNAL_SERVER_ERROR);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: ResourceBase.translate(Resource.INTERNAL_SERVER_ERROR, 'en-US'),
                })
            );
            expect(logSpy).toHaveBeenCalledWith(
                LogType.ERROR,
                LogOperation.UPDATE,
                LogCategory.AUTH,
                expect.any(Object),
                undefined,
                next
            );
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('logout', () => {
        it('returns 400 and logs alert when refresh token missing', async () => {
            const logoutSpy = jest.spyOn(AuthService.prototype, 'logout');
            const req = createMockRequest({ cookies: {} });
            const res = createMockResponse();
            const next = createNext();

            await AuthController.logout(req, res, next);

            expect(logoutSpy).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(HTTPStatus.BAD_REQUEST);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: ResourceBase.translate(Resource.TOKEN_NOT_FOUND, 'en-US'),
                })
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('returns 400 when service returns failure', async () => {
            const logoutSpy = jest.spyOn(AuthService.prototype, 'logout').mockResolvedValue({ success: false, error: Resource.TOKEN_NOT_FOUND });
            const req = createMockRequest({ cookies: { refreshToken: 'bad' } });
            const res = createMockResponse();
            const next = createNext();

            await AuthController.logout(req, res, next);

            expect(logoutSpy).toHaveBeenCalledWith('bad');
            expect(res.status).toHaveBeenCalledWith(HTTPStatus.BAD_REQUEST);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: ResourceBase.translate(Resource.TOKEN_NOT_FOUND, 'en-US'),
                })
            );
            expect(logSpy).not.toHaveBeenCalled();
            expect(next).not.toHaveBeenCalled();
        });

        it('returns 200 and logs on success', async () => {
            const logoutSpy = jest.spyOn(AuthService.prototype, 'logout').mockResolvedValue({ success: true, data: { userId: 8 } });
            const req = createMockRequest({ cookies: { refreshToken: 'good' } });
            const res = createMockResponse();
            const next = createNext();

            await AuthController.logout(req, res, next);

            expect(logoutSpy).toHaveBeenCalledWith('good');
            expect(res.clearCookie).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(HTTPStatus.OK);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
            expect(logSpy).toHaveBeenCalledWith(
                LogType.SUCCESS,
                LogOperation.LOGOUT,
                LogCategory.AUTH,
                { userId: 8 },
                8
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('returns 500 and logs when service throws', async () => {
            jest.spyOn(AuthService.prototype, 'logout').mockRejectedValue(new Error('boom'));
            const req = createMockRequest({ cookies: { refreshToken: 'x' } });
            const res = createMockResponse();
            const next = createNext();

            await AuthController.logout(req, res, next);

            expect(res.status).toHaveBeenCalledWith(HTTPStatus.INTERNAL_SERVER_ERROR);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: ResourceBase.translate(Resource.INTERNAL_SERVER_ERROR, 'en-US'),
                })
            );
            expect(logSpy).toHaveBeenCalledWith(
                LogType.ERROR,
                LogOperation.LOGOUT,
                LogCategory.AUTH,
                expect.any(Object),
                undefined,
                next
            );
            expect(next).not.toHaveBeenCalled();
        });
    });
});
