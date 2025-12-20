import { AccountService } from '../../../src/service/accountService';
import { Resource } from '../../../src/utils/resources/resource';
import { makeAccount, makeAccountInput, makeSanitizedUser } from '../../helpers/factories';

const mockAccountRepository = {
  findById: jest.fn(),
  findMany: jest.fn(),
  count: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const getUserByIdMock = jest.fn();

jest.mock('../../../src/repositories/accountRepository', () => ({
  AccountRepository: jest.fn(() => mockAccountRepository),
}));

jest.mock('../../../src/service/userService', () => ({
  UserService: jest.fn(() => ({ getUserById: getUserByIdMock })),
}));

describe('AccountService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createAccount', () => {
    it('creates an account when the user exists', async () => {
      const service = new AccountService();
      const input = makeAccountInput({ userId: 2 });
      const created = makeAccount({ id: 10, userId: input.userId });

      getUserByIdMock.mockResolvedValue({ success: true, data: makeSanitizedUser({ id: input.userId }) });
      mockAccountRepository.create.mockResolvedValue(created);

      const result = await service.createAccount(input);

      expect(getUserByIdMock).toHaveBeenCalledWith(input.userId);
      expect(mockAccountRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: input.userId })
      );
      expect(result).toEqual({ success: true, data: created });
    });

    it('returns USER_NOT_FOUND when the linked user is missing', async () => {
      const service = new AccountService();
      const input = makeAccountInput({ userId: 99 });
      getUserByIdMock.mockResolvedValue({ success: false, error: Resource.USER_NOT_FOUND });

      const result = await service.createAccount(input);

      expect(result).toEqual({ success: false, error: Resource.USER_NOT_FOUND });
      expect(mockAccountRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('deleteAccount', () => {
    it('returns ACCOUNT_NOT_FOUND when no record exists', async () => {
      const service = new AccountService();
      mockAccountRepository.findById.mockResolvedValue(null);

      const result = await service.deleteAccount(123);

      expect(result).toEqual({ success: false, error: Resource.ACCOUNT_NOT_FOUND });
      expect(mockAccountRepository.delete).not.toHaveBeenCalled();
    });
  });
});
