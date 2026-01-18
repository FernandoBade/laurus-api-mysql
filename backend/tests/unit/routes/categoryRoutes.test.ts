import type { IRoute } from 'express-serve-static-core';
import { verifyToken } from '../../../src/utils/auth/verifyToken';
import CategoryController from '../../../src/controller/categoryController';
import router from '../../../src/routes/categoryRoutes';

jest.mock('../../../src/utils/auth/verifyToken', () => ({
  verifyToken: jest.fn(),
}));

jest.mock('../../../src/controller/categoryController', () => ({
  __esModule: true,
  default: {
    createCategory: jest.fn(),
    getCategories: jest.fn(),
    getCategoryById: jest.fn(),
    getCategoriesByUser: jest.fn(),
    updateCategory: jest.fn(),
    deleteCategory: jest.fn(),
  },
}));

type HttpMethod = 'get' | 'post' | 'put' | 'delete';
type RouteWithMethods = IRoute & { methods: Record<string, boolean> };

const isRouteWithMethods = (route: IRoute | undefined): route is RouteWithMethods => {
  return Boolean(route && 'methods' in route);
};

const getRoute = (path: string, method: HttpMethod): RouteWithMethods => {
  const layer = router.stack.find(item => {
    if (!item.route || !isRouteWithMethods(item.route)) {
      return false;
    }
    return item.route.path === path && item.route.methods[method];
  });

  if (!layer || !layer.route || !isRouteWithMethods(layer.route)) {
    throw new Error(`Route not found: ${method.toUpperCase()} ${path}`);
  }

  return layer.route;
};

const getHandlers = (path: string, method: HttpMethod) => getRoute(path, method).stack.map(layer => layer.handle);

describe('categoryRoutes', () => {
  describe('POST', () => {
    it('registers / with verifyToken and createCategory', () => {
      const route = getRoute('/', 'post');
      const handlers = getHandlers('/', 'post');

      expect(route.path).toBe('/');
      expect(route.methods.post).toBe(true);
      expect(handlers).toHaveLength(2);
      expect(handlers[0]).toBe(verifyToken);
      expect(handlers[1]).toEqual(expect.any(Function));
      expect(handlers[1].toString()).toContain('createCategory');
    });
  });

  describe('GET', () => {
    it('registers / with verifyToken and getCategories', () => {
      const route = getRoute('/', 'get');
      const handlers = getHandlers('/', 'get');

      expect(route.path).toBe('/');
      expect(route.methods.get).toBe(true);
      expect(handlers).toHaveLength(2);
      expect(handlers[0]).toBe(verifyToken);
      expect(handlers[1]).toEqual(expect.any(Function));
      expect(handlers[1].toString()).toContain('getCategories');
    });

    it('registers /:id with verifyToken and getCategoryById', () => {
      const route = getRoute('/:id', 'get');
      const handlers = getHandlers('/:id', 'get');

      expect(route.path).toBe('/:id');
      expect(route.methods.get).toBe(true);
      expect(handlers).toHaveLength(2);
      expect(handlers[0]).toBe(verifyToken);
      expect(handlers[1]).toEqual(expect.any(Function));
      expect(handlers[1].toString()).toContain('getCategoryById');
    });

    it('registers /user/:userId with verifyToken and getCategoriesByUser', () => {
      const route = getRoute('/user/:userId', 'get');
      const handlers = getHandlers('/user/:userId', 'get');

      expect(route.path).toBe('/user/:userId');
      expect(route.methods.get).toBe(true);
      expect(handlers).toHaveLength(2);
      expect(handlers[0]).toBe(verifyToken);
      expect(handlers[1]).toEqual(expect.any(Function));
      expect(handlers[1].toString()).toContain('getCategoriesByUser');
    });
  });

  describe('PUT', () => {
    it('registers /:id with verifyToken and updateCategory', () => {
      const route = getRoute('/:id', 'put');
      const handlers = getHandlers('/:id', 'put');

      expect(route.path).toBe('/:id');
      expect(route.methods.put).toBe(true);
      expect(handlers).toHaveLength(2);
      expect(handlers[0]).toBe(verifyToken);
      expect(handlers[1]).toEqual(expect.any(Function));
      expect(handlers[1].toString()).toContain('updateCategory');
    });
  });

  describe('DELETE', () => {
    it('registers /:id with verifyToken and deleteCategory', () => {
      const route = getRoute('/:id', 'delete');
      const handlers = getHandlers('/:id', 'delete');

      expect(route.path).toBe('/:id');
      expect(route.methods.delete).toBe(true);
      expect(handlers).toHaveLength(2);
      expect(handlers[0]).toBe(verifyToken);
      expect(handlers[1]).toEqual(expect.any(Function));
      expect(handlers[1].toString()).toContain('deleteCategory');
    });
  });
});
