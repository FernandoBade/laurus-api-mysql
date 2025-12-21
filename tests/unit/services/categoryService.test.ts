import { CategoryService } from '../../../src/service/categoryService';
import { CategoryRepository } from '../../../src/repositories/categoryRepository';
import { UserService } from '../../../src/service/userService';
import { CategoryColor, CategoryType, Operator } from '../../../src/utils/enum';
import { Resource } from '../../../src/utils/resources/resource';
import { ResourceBase } from '../../../src/utils/resources/languages/resourceService';
import { SelectCategory } from '../../../src/db/schema';
import { makeUser } from '../../helpers/factories';

const translate = (resource: Resource) => ResourceBase.translate(resource, 'en-US');
const isResource = (value: string): value is Resource => value in Resource;

const makeCategory = (overrides: Partial<SelectCategory> = {}): SelectCategory => {
  const now = new Date('2024-01-01T00:00:00Z');
  return {
    id: overrides.id ?? 1,
    name: overrides.name ?? 'Groceries',
    type: overrides.type ?? CategoryType.EXPENSE,
    color: overrides.color ?? CategoryColor.BLUE,
    active: overrides.active ?? true,
    userId: overrides.userId ?? 1,
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
  };
};

describe('CategoryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createCategory', () => {
    it('returns user not found when linked user is missing', async () => {
      const getUserSpy = jest.spyOn(UserService.prototype, 'getUserById').mockResolvedValue({
        success: false,
        error: Resource.USER_NOT_FOUND,
      });
      const createSpy = jest.spyOn(CategoryRepository.prototype, 'create');

      const service = new CategoryService();
      const result = await service.createCategory({
        name: 'Food',
        type: CategoryType.EXPENSE,
        color: CategoryColor.RED,
        userId: 9,
      });

      expect(getUserSpy).toHaveBeenCalledWith(9);
      expect(createSpy).not.toHaveBeenCalled();
      expect(result).toEqual({ success: false, error: Resource.USER_NOT_FOUND });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe(Resource.USER_NOT_FOUND);
        expect(translate(result.error)).toBe(translate(Resource.USER_NOT_FOUND));
      }
    });

    it('creates category when user exists', async () => {
      const { password: _ignored, ...sanitized } = makeUser({ id: 2 });
      jest.spyOn(UserService.prototype, 'getUserById').mockResolvedValue({ success: true, data: sanitized });
      const created = makeCategory({ id: 10, userId: 2 });
      const createSpy = jest.spyOn(CategoryRepository.prototype, 'create').mockResolvedValue(created);

      const service = new CategoryService();
      const result = await service.createCategory({
        name: 'Food',
        type: CategoryType.EXPENSE,
        color: CategoryColor.RED,
        userId: 2,
        active: true,
      });

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Food',
          type: CategoryType.EXPENSE,
          color: CategoryColor.RED,
          user_id: 2,
          active: true,
        })
      );
      expect(result).toEqual({ success: true, data: created });
    });

    it('returns internal server error when repository create fails', async () => {
      const { password: _ignored, ...sanitized } = makeUser({ id: 3 });
      jest.spyOn(UserService.prototype, 'getUserById').mockResolvedValue({ success: true, data: sanitized });
      jest.spyOn(CategoryRepository.prototype, 'create').mockRejectedValue(new Error(Resource.INTERNAL_SERVER_ERROR));

      const service = new CategoryService();
      const result = await service.createCategory({
        name: 'Food',
        type: CategoryType.EXPENSE,
        color: CategoryColor.GREEN,
        userId: 3,
      });

      expect(result).toEqual({ success: false, error: Resource.INTERNAL_SERVER_ERROR });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe(Resource.INTERNAL_SERVER_ERROR);
        expect(translate(result.error)).toBe(translate(Resource.INTERNAL_SERVER_ERROR));
      }
    });
  });

  describe('getCategories', () => {
    it('returns categories when repository succeeds', async () => {
      const categories = [makeCategory({ id: 1 }), makeCategory({ id: 2 })];
      const findManySpy = jest.spyOn(CategoryRepository.prototype, 'findMany').mockResolvedValue(categories);

      const service = new CategoryService();
      const result = await service.getCategories({ limit: 2, offset: 2, sort: 'name', order: Operator.DESC });

      expect(findManySpy).toHaveBeenCalledWith(undefined, {
        limit: 2,
        offset: 2,
        sort: 'name',
        order: 'desc',
      });
      expect(result).toEqual({ success: true, data: categories });
    });

    it('returns internal server error when repository throws', async () => {
      jest.spyOn(CategoryRepository.prototype, 'findMany').mockRejectedValue(new Error(Resource.INTERNAL_SERVER_ERROR));

      const service = new CategoryService();
      const result = await service.getCategories();

      expect(result).toEqual({ success: false, error: Resource.INTERNAL_SERVER_ERROR });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe(Resource.INTERNAL_SERVER_ERROR);
        expect(translate(result.error)).toBe(translate(Resource.INTERNAL_SERVER_ERROR));
      }
    });
  });

  describe('countCategories', () => {
    it('returns total count when repository succeeds', async () => {
      const countSpy = jest.spyOn(CategoryRepository.prototype, 'count').mockResolvedValue(4);

      const service = new CategoryService();
      const result = await service.countCategories();

      expect(countSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ success: true, data: 4 });
    });

    it('returns internal server error when repository throws', async () => {
      jest.spyOn(CategoryRepository.prototype, 'count').mockRejectedValue(new Error(Resource.INTERNAL_SERVER_ERROR));

      const service = new CategoryService();
      const result = await service.countCategories();

      expect(result).toEqual({ success: false, error: Resource.INTERNAL_SERVER_ERROR });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe(Resource.INTERNAL_SERVER_ERROR);
        expect(translate(result.error)).toBe(translate(Resource.INTERNAL_SERVER_ERROR));
      }
    });
  });

  describe('getCategoryById', () => {
    it('returns no records found when repository returns null', async () => {
      const findSpy = jest.spyOn(CategoryRepository.prototype, 'findById').mockResolvedValue(null);

      const service = new CategoryService();
      const result = await service.getCategoryById(5);

      expect(findSpy).toHaveBeenCalledWith(5);
      expect(result).toEqual({ success: false, error: Resource.NO_RECORDS_FOUND });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe(Resource.NO_RECORDS_FOUND);
        expect(translate(result.error)).toBe(translate(Resource.NO_RECORDS_FOUND));
      }
    });

    it('returns category when repository returns a record', async () => {
      const category = makeCategory({ id: 6 });
      jest.spyOn(CategoryRepository.prototype, 'findById').mockResolvedValue(category);

      const service = new CategoryService();
      const result = await service.getCategoryById(6);

      expect(result).toEqual({ success: true, data: category });
    });

    it('throws when repository lookup rejects', async () => {
      jest.spyOn(CategoryRepository.prototype, 'findById').mockRejectedValue(new Error(Resource.INTERNAL_SERVER_ERROR));

      const service = new CategoryService();
      let caught: unknown;

      try {
        await service.getCategoryById(7);
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

  describe('getCategoriesByUser', () => {
    it('returns categories when repository succeeds', async () => {
      const categories = [makeCategory({ id: 7, userId: 2 })];
      const findManySpy = jest.spyOn(CategoryRepository.prototype, 'findMany').mockResolvedValue(categories);

      const service = new CategoryService();
      const result = await service.getCategoriesByUser(2, { limit: 3, offset: 3, sort: 'name', order: Operator.ASC });

      expect(findManySpy).toHaveBeenCalledWith(
        { userId: { operator: Operator.EQUAL, value: 2 } },
        { limit: 3, offset: 3, sort: 'name', order: 'asc' }
      );
      expect(result).toEqual({ success: true, data: categories });
    });

    it('returns internal server error when repository throws', async () => {
      jest.spyOn(CategoryRepository.prototype, 'findMany').mockRejectedValue(new Error(Resource.INTERNAL_SERVER_ERROR));

      const service = new CategoryService();
      const result = await service.getCategoriesByUser(2);

      expect(result).toEqual({ success: false, error: Resource.INTERNAL_SERVER_ERROR });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe(Resource.INTERNAL_SERVER_ERROR);
        expect(translate(result.error)).toBe(translate(Resource.INTERNAL_SERVER_ERROR));
      }
    });
  });

  describe('countCategoriesByUser', () => {
    it('returns count when repository succeeds', async () => {
      const countSpy = jest.spyOn(CategoryRepository.prototype, 'count').mockResolvedValue(3);

      const service = new CategoryService();
      const result = await service.countCategoriesByUser(2);

      expect(countSpy).toHaveBeenCalledWith({ userId: { operator: Operator.EQUAL, value: 2 } });
      expect(result).toEqual({ success: true, data: 3 });
    });

    it('returns internal server error when repository throws', async () => {
      jest.spyOn(CategoryRepository.prototype, 'count').mockRejectedValue(new Error(Resource.INTERNAL_SERVER_ERROR));

      const service = new CategoryService();
      const result = await service.countCategoriesByUser(2);

      expect(result).toEqual({ success: false, error: Resource.INTERNAL_SERVER_ERROR });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe(Resource.INTERNAL_SERVER_ERROR);
        expect(translate(result.error)).toBe(translate(Resource.INTERNAL_SERVER_ERROR));
      }
    });
  });

  describe('updateCategory', () => {
    it('returns user not found when new user is invalid', async () => {
      const getUserSpy = jest.spyOn(UserService.prototype, 'getUserById').mockResolvedValue({
        success: false,
        error: Resource.USER_NOT_FOUND,
      });
      const updateSpy = jest.spyOn(CategoryRepository.prototype, 'update');

      const service = new CategoryService();
      const result = await service.updateCategory(3, { userId: 99 });

      expect(getUserSpy).toHaveBeenCalledWith(99);
      expect(updateSpy).not.toHaveBeenCalled();
      expect(result).toEqual({ success: false, error: Resource.USER_NOT_FOUND });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe(Resource.USER_NOT_FOUND);
        expect(translate(result.error)).toBe(translate(Resource.USER_NOT_FOUND));
      }
    });

    it('updates category when validation succeeds', async () => {
      const { password: _ignored, ...sanitized } = makeUser({ id: 4 });
      jest.spyOn(UserService.prototype, 'getUserById').mockResolvedValue({ success: true, data: sanitized });
      const updated = makeCategory({ id: 4, userId: 4, name: 'Updated' });
      const updateSpy = jest.spyOn(CategoryRepository.prototype, 'update').mockResolvedValue(updated);

      const service = new CategoryService();
      const result = await service.updateCategory(4, { userId: 4, name: 'Updated' });

      expect(updateSpy).toHaveBeenCalledWith(4, expect.objectContaining({ userId: 4, name: 'Updated' }));
      expect(result).toEqual({ success: true, data: updated });
    });

    it('returns internal server error when repository update throws', async () => {
      const { password: _ignored, ...sanitized } = makeUser({ id: 5 });
      jest.spyOn(UserService.prototype, 'getUserById').mockResolvedValue({ success: true, data: sanitized });
      jest.spyOn(CategoryRepository.prototype, 'update').mockRejectedValue(new Error(Resource.INTERNAL_SERVER_ERROR));

      const service = new CategoryService();
      const result = await service.updateCategory(5, { userId: 5 });

      expect(result).toEqual({ success: false, error: Resource.INTERNAL_SERVER_ERROR });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe(Resource.INTERNAL_SERVER_ERROR);
        expect(translate(result.error)).toBe(translate(Resource.INTERNAL_SERVER_ERROR));
      }
    });
  });

  describe('deleteCategory', () => {
    it('returns category not found when repository returns null', async () => {
      const findSpy = jest.spyOn(CategoryRepository.prototype, 'findById').mockResolvedValue(null);
      const deleteSpy = jest.spyOn(CategoryRepository.prototype, 'delete');

      const service = new CategoryService();
      const result = await service.deleteCategory(10);

      expect(findSpy).toHaveBeenCalledWith(10);
      expect(deleteSpy).not.toHaveBeenCalled();
      expect(result).toEqual({ success: false, error: Resource.CATEGORY_NOT_FOUND });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe(Resource.CATEGORY_NOT_FOUND);
        expect(translate(result.error)).toBe(translate(Resource.CATEGORY_NOT_FOUND));
      }
    });

    it('deletes and returns id when category exists', async () => {
      const category = makeCategory({ id: 11 });
      jest.spyOn(CategoryRepository.prototype, 'findById').mockResolvedValue(category);
      const deleteSpy = jest.spyOn(CategoryRepository.prototype, 'delete').mockResolvedValue();

      const service = new CategoryService();
      const result = await service.deleteCategory(11);

      expect(deleteSpy).toHaveBeenCalledWith(11);
      expect(result).toEqual({ success: true, data: { id: 11 } });
    });

    it('returns internal server error when repository delete throws', async () => {
      const category = makeCategory({ id: 12 });
      jest.spyOn(CategoryRepository.prototype, 'findById').mockResolvedValue(category);
      jest.spyOn(CategoryRepository.prototype, 'delete').mockRejectedValue(new Error(Resource.INTERNAL_SERVER_ERROR));

      const service = new CategoryService();
      const result = await service.deleteCategory(12);

      expect(result).toEqual({ success: false, error: Resource.INTERNAL_SERVER_ERROR });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe(Resource.INTERNAL_SERVER_ERROR);
        expect(translate(result.error)).toBe(translate(Resource.INTERNAL_SERVER_ERROR));
      }
    });
  });
});
