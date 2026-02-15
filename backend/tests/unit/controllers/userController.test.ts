import UserController from '../../../src/controller/userController';
import { UserService } from '../../../src/service/userService';
import { HTTPStatus } from '../../../../shared/enums/http-status.enums';
import { LogCategory, LogOperation, LogType } from '../../../../shared/enums/log.enums';
import { SortOrder } from '../../../../shared/enums/operator.enums';
import { ResourceKey as Resource } from '../../../../shared/i18n/resource.keys';
import * as commons from '../../../src/utils/commons';
import { createMockRequest, createMockResponse, createNext } from '../../helpers/mockExpress';
import { makeCreateUserInput, makeSanitizedUser, makeUser } from '../../helpers/factories';
import { translateResource } from '../../../../shared/i18n/resource.utils';

describe('UserController', () => {
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    logSpy = jest.spyOn(commons, 'createLog').mockResolvedValue();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createUser', () => {
    it('returns 201 and payload when user creation succeeds', async () => {
      const payload = makeCreateUserInput({ email: 'UPPER@example.com' });
      const sanitized = makeSanitizedUser({ id: 5, email: 'upper@example.com' });
      const createUserSpy = jest.spyOn(UserService.prototype, 'createUser').mockResolvedValue({ success: true, data: sanitized });

      const req = createMockRequest({ body: payload });
      const res = createMockResponse();
      const next = createNext();

      await UserController.createUser(req, res, next);

      expect(createUserSpy).toHaveBeenCalledTimes(1);
      expect(createUserSpy).toHaveBeenCalledWith({
        ...payload,
        email: payload.email.trim().toLowerCase(),
      });
      expect(res.status).toHaveBeenCalledWith(HTTPStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: sanitized,
          message: translateResource(Resource.EMAIL_VERIFICATION_REQUIRED, 'en-US'),
        })
      );
      expect(logSpy).toHaveBeenCalledWith(
        LogType.SUCCESS,
        LogOperation.CREATE,
        LogCategory.USER,
        sanitized,
        sanitized.id
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('returns 400 without calling service when validation fails', async () => {
      const createUserSpy = jest.spyOn(UserService.prototype, 'createUser');
      const req = createMockRequest({
        body: { firstName: 'A', lastName: '', email: 'invalid', password: '123' },
      });
      const res = createMockResponse();
      const next = createNext();

      await UserController.createUser(req, res, next);

      expect(createUserSpy).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(HTTPStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: translateResource(Resource.VALIDATION_ERROR, 'en-US'),
          error: expect.arrayContaining([
            expect.objectContaining({ property: 'firstName', error: 'First name must be at least 2 characters.' }),
            expect.objectContaining({ property: 'lastName', error: 'Last name must be at least 2 characters.' }),
            expect.objectContaining({ property: 'email', error: 'Invalid email address.' }),
            expect.objectContaining({ property: 'password', error: 'Password must be at least 6 characters.' }),
          ]),
        })
      );
      expect(logSpy).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('maps service error to HTTP 400', async () => {
      const payload = makeCreateUserInput();
      const createUserSpy = jest.spyOn(UserService.prototype, 'createUser').mockResolvedValue({ success: false, error: Resource.EMAIL_IN_USE });

      const req = createMockRequest({ body: payload });
      const res = createMockResponse();
      const next = createNext();

      await UserController.createUser(req, res, next);

      expect(createUserSpy).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(HTTPStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: translateResource(Resource.EMAIL_IN_USE, 'en-US'),
        })
      );
      expect(logSpy).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('returns email not verified payload when service reports unverified user', async () => {
      const payload = makeCreateUserInput({ email: 'user@example.com' });
      const createUserSpy = jest.spyOn(UserService.prototype, 'createUser').mockResolvedValue({ success: false, error: Resource.EMAIL_NOT_VERIFIED });

      const req = createMockRequest({ body: payload });
      const res = createMockResponse();
      const next = createNext();

      await UserController.createUser(req, res, next);

      expect(createUserSpy).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(HTTPStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: translateResource(Resource.EMAIL_NOT_VERIFIED, 'en-US'),
          error: expect.objectContaining({
            code: Resource.EMAIL_NOT_VERIFIED,
            email: 'user@example.com',
            canResend: true,
            verificationSent: true,
          }),
        })
      );
      expect(logSpy).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('getUsers', () => {
    it('returns 200 with data and pagination when service succeeds', async () => {
      const users = [makeSanitizedUser({ id: 1 }), makeSanitizedUser({ id: 2 })];
      jest.spyOn(UserService.prototype, 'getUsers').mockResolvedValue({ success: true, data: users });
      jest.spyOn(UserService.prototype, 'countUsers').mockResolvedValue({ success: true, data: users.length });

      const req = createMockRequest({ query: { page: '1', pageSize: '1', sort: 'firstName', order: 'asc' } });
      const res = createMockResponse();
      const next = createNext();

      await UserController.getUsers(req, res, next);

      expect(UserService.prototype.getUsers).toHaveBeenCalledTimes(1);
      expect(UserService.prototype.getUsers).toHaveBeenCalledWith({
        limit: 1,
        offset: 0,
        sort: 'firstName',
        order: SortOrder.ASC,
      });
      expect(UserService.prototype.countUsers).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(HTTPStatus.OK);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: users,
          page: 1,
          pageSize: 1,
          pageCount: expect.any(Number),
          totalItems: users.length,
        })
      );
      expect(logSpy).not.toHaveBeenCalled();
    });

    it('returns 400 when listing service fails', async () => {
      const getUsersSpy = jest.spyOn(UserService.prototype, 'getUsers').mockResolvedValue({ success: false, error: Resource.INTERNAL_SERVER_ERROR });
      const countUsersSpy = jest.spyOn(UserService.prototype, 'countUsers').mockResolvedValue({ success: true, data: 0 });

      const req = createMockRequest({ query: {} });
      const res = createMockResponse();
      const next = createNext();

      await UserController.getUsers(req, res, next);

      expect(getUsersSpy).toHaveBeenCalledTimes(1);
      expect(countUsersSpy).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(HTTPStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: translateResource(Resource.INTERNAL_SERVER_ERROR, 'en-US'),
        })
      );
      expect(logSpy).not.toHaveBeenCalled();
    });

    it('returns 400 when count service fails', async () => {
      const getUsersSpy = jest.spyOn(UserService.prototype, 'getUsers').mockResolvedValue({ success: true, data: [] });
      const countUsersSpy = jest.spyOn(UserService.prototype, 'countUsers').mockResolvedValue({ success: false, error: Resource.INTERNAL_SERVER_ERROR });

      const req = createMockRequest({ query: {} });
      const res = createMockResponse();
      const next = createNext();

      await UserController.getUsers(req, res, next);

      expect(getUsersSpy).toHaveBeenCalledTimes(1);
      expect(countUsersSpy).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(HTTPStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: translateResource(Resource.INTERNAL_SERVER_ERROR, 'en-US'),
        })
      );
      expect(logSpy).not.toHaveBeenCalled();
    });
  });

  describe('getUserById', () => {
    it('returns 400 when id is invalid', async () => {
      const getUserByIdSpy = jest.spyOn(UserService.prototype, 'getUserById');
      const req = createMockRequest({ params: { id: 'abc' } });
      const res = createMockResponse();
      const next = createNext();

      await UserController.getUserById(req, res, next);

      expect(getUserByIdSpy).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(HTTPStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: translateResource(Resource.INVALID_USER_ID, 'en-US'),
        })
      );
      expect(logSpy).not.toHaveBeenCalled();
    });

    it('returns 400 when service reports not found', async () => {
      jest.spyOn(UserService.prototype, 'getUserById').mockResolvedValue({ success: false, error: Resource.USER_NOT_FOUND });
      const req = createMockRequest({ params: { id: '99' } });
      const res = createMockResponse();
      const next = createNext();

      await UserController.getUserById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(HTTPStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: translateResource(Resource.USER_NOT_FOUND, 'en-US'),
        })
      );
      expect(logSpy).not.toHaveBeenCalled();
    });

    it('returns 200 when user is found', async () => {
      const user = makeSanitizedUser({ id: 7 });
      jest.spyOn(UserService.prototype, 'getUserById').mockResolvedValue({ success: true, data: user });

      const req = createMockRequest({ params: { id: '7' } });
      const res = createMockResponse();
      const next = createNext();

      await UserController.getUserById(req, res, next);

      expect(UserService.prototype.getUserById).toHaveBeenCalledWith(7);
      expect(res.status).toHaveBeenCalledWith(HTTPStatus.OK);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: user }));
      expect(logSpy).not.toHaveBeenCalled();
    });

    it('returns 500 and logs when service throws', async () => {
      const error = new Error('boom');
      jest.spyOn(UserService.prototype, 'getUserById').mockRejectedValue(error);
      const req = createMockRequest({ params: { id: '7' } });
      const res = createMockResponse();
      const next = createNext();

      await UserController.getUserById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(HTTPStatus.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: translateResource(Resource.INTERNAL_SERVER_ERROR, 'en-US'),
        })
      );
      expect(logSpy).toHaveBeenCalledWith(
        LogType.ERROR,
        LogOperation.CREATE,
        LogCategory.USER,
        expect.any(Object),
        undefined,
        next
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('getUsersByEmail', () => {
    it('returns 400 when search term is too short', async () => {
      const getUsersByEmailSpy = jest.spyOn(UserService.prototype, 'getUsersByEmail');
      const req = createMockRequest({ query: { email: 'ab' } });
      const res = createMockResponse();
      const next = createNext();

      await UserController.getUsersByEmail(req, res, next);

      expect(getUsersByEmailSpy).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(HTTPStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: translateResource(Resource.SEARCH_TERM_TOO_SHORT, 'en-US'),
        })
      );
      expect(logSpy).not.toHaveBeenCalled();
    });

    it('returns 200 when search succeeds', async () => {
      const users = [makeSanitizedUser({ id: 1 })];
      jest.spyOn(UserService.prototype, 'getUsersByEmail').mockResolvedValue({ success: true, data: users });
      jest.spyOn(UserService.prototype, 'countUsersByEmail').mockResolvedValue({ success: true, data: 1 });

      const req = createMockRequest({ query: { email: 'test', page: '1', pageSize: '10' } });
      const res = createMockResponse();
      const next = createNext();

      await UserController.getUsersByEmail(req, res, next);

      expect(UserService.prototype.getUsersByEmail).toHaveBeenCalledWith('test', {
        limit: 10,
        offset: 0,
        sort: undefined,
        order: SortOrder.ASC,
      });
      expect(UserService.prototype.countUsersByEmail).toHaveBeenCalledWith('test');
      expect(res.status).toHaveBeenCalledWith(HTTPStatus.OK);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: users,
          page: 1,
          pageSize: 10,
          totalItems: 1,
        })
      );
      expect(logSpy).not.toHaveBeenCalled();
    });

    it('returns 400 when count service fails', async () => {
      const getUsersByEmailSpy = jest.spyOn(UserService.prototype, 'getUsersByEmail').mockResolvedValue({ success: true, data: [] });
      const countUsersByEmailSpy = jest.spyOn(UserService.prototype, 'countUsersByEmail').mockResolvedValue({ success: false, error: Resource.INTERNAL_SERVER_ERROR });

      const req = createMockRequest({ query: { email: 'abc' } });
      const res = createMockResponse();
      const next = createNext();

      await UserController.getUsersByEmail(req, res, next);

      expect(getUsersByEmailSpy).toHaveBeenCalledTimes(1);
      expect(countUsersByEmailSpy).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(HTTPStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: translateResource(Resource.INTERNAL_SERVER_ERROR, 'en-US'),
        })
      );
      expect(logSpy).not.toHaveBeenCalled();
    });
  });

  describe('updateUser', () => {
    it('returns 400 for invalid id', async () => {
      const findOneSpy = jest.spyOn(UserService.prototype, 'findOne');
      const req = createMockRequest({ params: { id: '0' } });
      const res = createMockResponse();
      const next = createNext();

      await UserController.updateUser(req, res, next);

      expect(findOneSpy).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(HTTPStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false, message: translateResource(Resource.INVALID_USER_ID, 'en-US') }));
      expect(logSpy).not.toHaveBeenCalled();
    });

    it('returns 400 when user does not exist', async () => {
      jest.spyOn(UserService.prototype, 'findOne').mockResolvedValue({ success: false, error: Resource.USER_NOT_FOUND });
      const req = createMockRequest({ params: { id: '5' }, body: { firstName: 'John' } });
      const res = createMockResponse();
      const next = createNext();

      await UserController.updateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(HTTPStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false, message: translateResource(Resource.USER_NOT_FOUND, 'en-US') }));
      expect(logSpy).not.toHaveBeenCalled();
    });

    it('returns 400 when validation fails', async () => {
      jest.spyOn(UserService.prototype, 'findOne').mockResolvedValue({ success: true, data: makeUser({ id: 3 }) });
      const updateUserSpy = jest.spyOn(UserService.prototype, 'updateUser');
      const req = createMockRequest({ params: { id: '3' }, body: { firstName: 'A' } });
      const res = createMockResponse();
      const next = createNext();

      await UserController.updateUser(req, res, next);

      expect(updateUserSpy).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(HTTPStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: translateResource(Resource.VALIDATION_ERROR, 'en-US'),
        })
      );
      expect(logSpy).not.toHaveBeenCalled();
    });

    it('returns 200 when update succeeds', async () => {
      const existing = makeUser({ id: 3 });
      const sanitized = makeSanitizedUser({ id: 3, firstName: 'Jane' });
      const expectedDelta = { firstName: { from: existing.firstName, to: sanitized.firstName } };
      jest.spyOn(UserService.prototype, 'findOne').mockResolvedValue({ success: true, data: existing });
      jest.spyOn(UserService.prototype, 'updateUser').mockResolvedValue({ success: true, data: sanitized });

      const req = createMockRequest({ params: { id: '3' }, body: { firstName: 'Jane', email: 'jane@example.com' } });
      const res = createMockResponse();
      const next = createNext();

      await UserController.updateUser(req, res, next);

      expect(UserService.prototype.updateUser).toHaveBeenCalledWith(3, {
        firstName: 'Jane',
        email: 'jane@example.com',
      });
      expect(res.status).toHaveBeenCalledWith(HTTPStatus.OK);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: sanitized }));
      expect(logSpy).toHaveBeenCalledWith(
        LogType.SUCCESS,
        LogOperation.UPDATE,
        LogCategory.USER,
        expectedDelta,
        sanitized.id
      );
    });
  });

  describe('deleteUser', () => {
    it('returns 400 for invalid id', async () => {
      const deleteSpy = jest.spyOn(UserService.prototype, 'deleteUser');
      const req = createMockRequest({ params: { id: 'abc' } });
      const res = createMockResponse();
      const next = createNext();

      await UserController.deleteUser(req, res, next);

      expect(deleteSpy).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(HTTPStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false, message: translateResource(Resource.INVALID_USER_ID, 'en-US') }));
      expect(logSpy).not.toHaveBeenCalled();
    });

    it('returns 400 when service signals failure', async () => {
      jest.spyOn(UserService.prototype, 'getUserById').mockResolvedValue({ success: true, data: makeSanitizedUser({ id: 10 }) });
      jest.spyOn(UserService.prototype, 'deleteUser').mockResolvedValue({ success: false, error: Resource.USER_NOT_FOUND });
      const req = createMockRequest({ params: { id: '10' } });
      const res = createMockResponse();
      const next = createNext();

      await UserController.deleteUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(HTTPStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false, message: translateResource(Resource.USER_NOT_FOUND, 'en-US') }));
      expect(logSpy).not.toHaveBeenCalled();
    });

    it('returns 200 when deletion succeeds', async () => {
      const snapshot = makeSanitizedUser({ id: 1 });
      const { createdAt, updatedAt, ...expectedSnapshot } = snapshot;
      void createdAt;
      void updatedAt;
      jest.spyOn(UserService.prototype, 'getUserById').mockResolvedValue({ success: true, data: snapshot });
      jest.spyOn(UserService.prototype, 'deleteUser').mockResolvedValue({ success: true, data: { id: 1 } });
      const req = createMockRequest({ params: { id: '1' } });
      const res = createMockResponse();
      const next = createNext();

      await UserController.deleteUser(req, res, next);

      expect(UserService.prototype.deleteUser).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(HTTPStatus.OK);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: { id: 1 } }));
      expect(logSpy).toHaveBeenCalledWith(
        LogType.SUCCESS,
        LogOperation.DELETE,
        LogCategory.USER,
        expectedSnapshot,
        1
      );
    });
  });

  describe('uploadAvatar', () => {
    it('returns 401 when user is missing from request', async () => {
      const uploadSpy = jest.spyOn(UserService.prototype, 'uploadAvatar');
      const req = createMockRequest({ user: undefined });
      const res = createMockResponse();
      const next = createNext();

      await UserController.uploadAvatar(req, res, next);

      expect(uploadSpy).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(HTTPStatus.UNAUTHORIZED);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: translateResource(Resource.EXPIRED_OR_INVALID_TOKEN, 'en-US'),
        })
      );
    });

    it('returns 400 when file is missing', async () => {
      const uploadSpy = jest.spyOn(UserService.prototype, 'uploadAvatar');
      const req = createMockRequest({ user: { id: 1 }, file: undefined });
      const res = createMockResponse();
      const next = createNext();

      await UserController.uploadAvatar(req, res, next);

      expect(uploadSpy).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(HTTPStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: translateResource(Resource.VALIDATION_ERROR, 'en-US'),
          error: expect.arrayContaining([
            expect.objectContaining({ property: 'avatar' }),
          ]),
        })
      );
    });

    it('returns 200 when upload succeeds', async () => {
      const payload = { url: 'https://bade.digital/laurus/users/1/avatar/avatar.jpg' };
      jest.spyOn(UserService.prototype, 'uploadAvatar').mockResolvedValue({ success: true, data: payload });

      const req = createMockRequest({
        user: { id: 1 },
        file: { buffer: Buffer.from('avatar'), mimetype: 'image/jpeg', size: 1024 } as Express.Multer.File,
      });
      const res = createMockResponse();
      const next = createNext();

      await UserController.uploadAvatar(req, res, next);

      expect(UserService.prototype.uploadAvatar).toHaveBeenCalledWith(1, expect.any(Object));
      expect(res.status).toHaveBeenCalledWith(HTTPStatus.OK);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: payload }));
      expect(logSpy).toHaveBeenCalledWith(
        LogType.SUCCESS,
        LogOperation.UPDATE,
        LogCategory.USER,
        { avatarUrl: payload.url },
        1
      );
    });
  });
});

