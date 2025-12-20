import { verifyToken } from '../../../src/utils/auth/verifyToken';
import { HTTPStatus } from '../../../src/utils/enum';
import { TokenUtils } from '../../../src/utils/auth/tokenUtils';
import { createMockRequest, createMockResponse, createNext } from '../../helpers/mockExpress';

jest.mock('../../../src/utils/auth/tokenUtils', () => ({
  TokenUtils: {
    verifyAccessToken: jest.fn(),
  },
}));

const verifyAccessTokenMock = TokenUtils.verifyAccessToken as jest.Mock;

describe('verifyToken middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('responds with 401 when Authorization header is missing', () => {
    const req = createMockRequest({ headers: {} });
    const res = createMockResponse();
    const next = createNext();

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(HTTPStatus.UNAUTHORIZED);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.any(String),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('attaches user to request and calls next when token is valid', () => {
    verifyAccessTokenMock.mockReturnValue({ id: 42 });
    const req = createMockRequest({ headers: { authorization: 'Bearer validtoken' } });
    const res = createMockResponse();
    const next = createNext();

    verifyToken(req, res, next);

    expect(verifyAccessTokenMock).toHaveBeenCalledWith('validtoken');
    expect(req.user).toEqual({ id: 42 });
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('returns 401 when token verification throws', () => {
    verifyAccessTokenMock.mockImplementation(() => {
      throw new Error('invalid');
    });
    const req = createMockRequest({ headers: { authorization: 'Bearer broken' } });
    const res = createMockResponse();
    const next = createNext();

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(HTTPStatus.UNAUTHORIZED);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.any(String),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });
});
