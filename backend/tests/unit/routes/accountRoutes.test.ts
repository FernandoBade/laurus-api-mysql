import type { IRoute } from 'express-serve-static-core';
import { verifyToken } from '../../../src/utils/auth/verifyToken';
import AccountController from '../../../src/controller/accountController';
import router from '../../../src/routes/accountRoutes';

jest.mock('../../../src/utils/auth/verifyToken', () => ({
  verifyToken: jest.fn(),
}));

jest.mock('../../../src/controller/accountController', () => ({
  __esModule: true,
  default: {
    createAccount: jest.fn(),
    getAccounts: jest.fn(),
    getAccountsByUser: jest.fn(),
    getAccountById: jest.fn(),
    updateAccount: jest.fn(),
    deleteAccount: jest.fn(),
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

describe('accountRoutes', () => {
  describe('POST', () => {
    it('registers / with verifyToken and createAccount', () => {
      const route = getRoute('/', 'post');
      const handlers = getHandlers('/', 'post');

      expect(route.path).toBe('/');
      expect(route.methods.post).toBe(true);
      expect(handlers).toHaveLength(2);
      expect(handlers[0]).toBe(verifyToken);
      expect(handlers[1]).toEqual(expect.any(Function));
      expect(handlers[1].toString()).toContain('createAccount');
    });
  });

  describe('GET', () => {
    it('registers / with verifyToken and getAccounts', () => {
      const route = getRoute('/', 'get');
      const handlers = getHandlers('/', 'get');

      expect(route.path).toBe('/');
      expect(route.methods.get).toBe(true);
      expect(handlers).toHaveLength(2);
      expect(handlers[0]).toBe(verifyToken);
      expect(handlers[1]).toEqual(expect.any(Function));
      expect(handlers[1].toString()).toContain('getAccounts');
    });

    it('registers /user/:userId with verifyToken and getAccountsByUser', () => {
      const route = getRoute('/user/:userId', 'get');
      const handlers = getHandlers('/user/:userId', 'get');

      expect(route.path).toBe('/user/:userId');
      expect(route.methods.get).toBe(true);
      expect(handlers).toHaveLength(2);
      expect(handlers[0]).toBe(verifyToken);
      expect(handlers[1]).toEqual(expect.any(Function));
      expect(handlers[1].toString()).toContain('getAccountsByUser');
    });

    it('registers /:id with verifyToken and getAccountById', () => {
      const route = getRoute('/:id', 'get');
      const handlers = getHandlers('/:id', 'get');

      expect(route.path).toBe('/:id');
      expect(route.methods.get).toBe(true);
      expect(handlers).toHaveLength(2);
      expect(handlers[0]).toBe(verifyToken);
      expect(handlers[1]).toEqual(expect.any(Function));
      expect(handlers[1].toString()).toContain('getAccountById');
    });
  });

  describe('PUT', () => {
    it('registers /:id with verifyToken and updateAccount', () => {
      const route = getRoute('/:id', 'put');
      const handlers = getHandlers('/:id', 'put');

      expect(route.path).toBe('/:id');
      expect(route.methods.put).toBe(true);
      expect(handlers).toHaveLength(2);
      expect(handlers[0]).toBe(verifyToken);
      expect(handlers[1]).toEqual(expect.any(Function));
      expect(handlers[1].toString()).toContain('updateAccount');
    });
  });

  describe('DELETE', () => {
    it('registers /:id with verifyToken and deleteAccount', () => {
      const route = getRoute('/:id', 'delete');
      const handlers = getHandlers('/:id', 'delete');

      expect(route.path).toBe('/:id');
      expect(route.methods.delete).toBe(true);
      expect(handlers).toHaveLength(2);
      expect(handlers[0]).toBe(verifyToken);
      expect(handlers[1]).toEqual(expect.any(Function));
      expect(handlers[1].toString()).toContain('deleteAccount');
    });
  });
});
