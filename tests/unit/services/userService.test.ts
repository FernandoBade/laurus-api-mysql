import bcrypt from 'bcrypt';
import { UserService } from '../../../src/service/userService';
import { Resource } from '../../../src/utils/resources/resource';
import { makeCreateUserInput, makeUser } from '../../helpers/factories';

const mockUserRepository = {
  findMany: jest.fn(),
  findById: jest.fn(),
  count: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

jest.mock('../../../src/repositories/userRepository', () => ({
  UserRepository: jest.fn(() => mockUserRepository),
}));

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('hashes the password and returns sanitized user when email is unique', async () => {
      const service = new UserService();
      const input = makeCreateUserInput({ email: 'NEW@EXAMPLE.COM ' });
      const createdUser = makeUser({ id: 123, email: 'new@example.com', password: 'hashedPwd' });
      const originalPassword = input.password;

      mockUserRepository.findMany.mockResolvedValue([]);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPwd');
      mockUserRepository.create.mockResolvedValue(createdUser);

      const result = await service.createUser(input);

      expect(mockUserRepository.findMany).toHaveBeenCalledWith({
        email: { operator: '=', value: 'new@example.com' },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(originalPassword, 10);
      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'new@example.com',
          password: 'hashedPwd',
        })
      );
      expect(result).toEqual({
        success: true,
        data: expect.objectContaining({
          id: 123,
          email: 'new@example.com',
        }),
      });
      expect((result as any).data.password).toBeUndefined();
    });

    it('short-circuits when email already exists', async () => {
      const service = new UserService();
      const existing = makeUser();
      mockUserRepository.findMany.mockResolvedValue([existing]);

      const result = await service.createUser(makeCreateUserInput());

      expect(result).toEqual({ success: false, error: Resource.EMAIL_IN_USE });
      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });
  });

  describe('updateUser', () => {
    it('does not rehash password when unchanged', async () => {
      const service = new UserService();
      const currentUser = makeUser({ id: 5, password: 'existingHash' });

      mockUserRepository.findById.mockResolvedValue(currentUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockUserRepository.update.mockResolvedValue(currentUser);

      const result = await service.updateUser(5, { password: 'samePassword' });

      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(mockUserRepository.update).toHaveBeenCalledWith(5, {});
      expect(result).toEqual({
        success: true,
        data: expect.objectContaining({ id: 5 }),
      });
      expect((result as any).data.password).toBeUndefined();
    });

    it('rehashes password when it changes', async () => {
      const service = new UserService();
      const currentUser = makeUser({ id: 5, password: 'oldHash' });
      const updatedUser = makeUser({ id: 5, password: 'newHashed' });

      mockUserRepository.findById.mockResolvedValue(currentUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashed');
      mockUserRepository.update.mockResolvedValue(updatedUser);

      const result = await service.updateUser(5, { password: 'newPassword' });

      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword', 10);
      expect(mockUserRepository.update).toHaveBeenCalledWith(5, { password: 'newHashed' });
      expect(result).toEqual({
        success: true,
        data: expect.objectContaining({ id: 5 }),
      });
      expect((result as any).data.password).toBeUndefined();
    });
  });
});
