import type { IRoute } from 'express-serve-static-core';
import { verifyToken } from '../../../src/utils/auth/verifyToken';
import TransactionController from '../../../src/controller/transactionController';
import router from '../../../src/routes/transactionRoutes';

jest.mock('../../../src/utils/auth/verifyToken', () => ({
  verifyToken: jest.fn(),
}));

jest.mock('../../../src/controller/transactionController', () => ({
  __esModule: true,
  default: {
    createTransaction: jest.fn(),
    getTransactions: jest.fn(),
    getTransactionById: jest.fn(),
    getTransactionsByAccount: jest.fn(),
    getTransactionsByUser: jest.fn(),
    updateTransaction: jest.fn(),
    deleteTransaction: jest.fn(),
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

describe('transactionRoutes', () => {
  describe('POST', () => {
    it('registers / with verifyToken and createTransaction', () => {
      const route = getRoute('/', 'post');
      const handlers = getHandlers('/', 'post');

      expect(route.path).toBe('/');
      expect(route.methods.post).toBe(true);
      expect(handlers).toHaveLength(2);
      expect(handlers[0]).toBe(verifyToken);
      expect(handlers[1]).toEqual(expect.any(Function));
      expect(handlers[1].toString()).toContain('createTransaction');
    });
  });

  describe('GET', () => {
    it('registers / with verifyToken and getTransactions', () => {
      const route = getRoute('/', 'get');
      const handlers = getHandlers('/', 'get');

      expect(route.path).toBe('/');
      expect(route.methods.get).toBe(true);
      expect(handlers).toHaveLength(2);
      expect(handlers[0]).toBe(verifyToken);
      expect(handlers[1]).toEqual(expect.any(Function));
      expect(handlers[1].toString()).toContain('getTransactions');
    });

    it('registers /:id with verifyToken and getTransactionById', () => {
      const route = getRoute('/:id', 'get');
      const handlers = getHandlers('/:id', 'get');

      expect(route.path).toBe('/:id');
      expect(route.methods.get).toBe(true);
      expect(handlers).toHaveLength(2);
      expect(handlers[0]).toBe(verifyToken);
      expect(handlers[1]).toEqual(expect.any(Function));
      expect(handlers[1].toString()).toContain('getTransactionById');
    });

    it('registers /account/:accountId with verifyToken and getTransactionsByAccount', () => {
      const route = getRoute('/account/:accountId', 'get');
      const handlers = getHandlers('/account/:accountId', 'get');

      expect(route.path).toBe('/account/:accountId');
      expect(route.methods.get).toBe(true);
      expect(handlers).toHaveLength(2);
      expect(handlers[0]).toBe(verifyToken);
      expect(handlers[1]).toEqual(expect.any(Function));
      expect(handlers[1].toString()).toContain('getTransactionsByAccount');
    });

    it('registers /user/:userId with verifyToken and getTransactionsByUser', () => {
      const route = getRoute('/user/:userId', 'get');
      const handlers = getHandlers('/user/:userId', 'get');

      expect(route.path).toBe('/user/:userId');
      expect(route.methods.get).toBe(true);
      expect(handlers).toHaveLength(2);
      expect(handlers[0]).toBe(verifyToken);
      expect(handlers[1]).toEqual(expect.any(Function));
      expect(handlers[1].toString()).toContain('getTransactionsByUser');
    });
  });

  describe('PUT', () => {
    it('registers /:id with verifyToken and updateTransaction', () => {
      const route = getRoute('/:id', 'put');
      const handlers = getHandlers('/:id', 'put');

      expect(route.path).toBe('/:id');
      expect(route.methods.put).toBe(true);
      expect(handlers).toHaveLength(2);
      expect(handlers[0]).toBe(verifyToken);
      expect(handlers[1]).toEqual(expect.any(Function));
      expect(handlers[1].toString()).toContain('updateTransaction');
    });
  });

  describe('DELETE', () => {
    it('registers /:id with verifyToken and deleteTransaction', () => {
      const route = getRoute('/:id', 'delete');
      const handlers = getHandlers('/:id', 'delete');

      expect(route.path).toBe('/:id');
      expect(route.methods.delete).toBe(true);
      expect(handlers).toHaveLength(2);
      expect(handlers[0]).toBe(verifyToken);
      expect(handlers[1]).toEqual(expect.any(Function));
      expect(handlers[1].toString()).toContain('deleteTransaction');
    });
  });
});
