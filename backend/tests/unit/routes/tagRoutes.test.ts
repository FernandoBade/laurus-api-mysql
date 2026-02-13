import type { IRoute } from 'express-serve-static-core';
import { verifyToken } from '../../../src/utils/auth/verifyToken';
import router from '../../../src/routes/tagRoutes';

jest.mock('../../../src/utils/auth/verifyToken', () => ({
  verifyToken: jest.fn(),
}));

jest.mock('../../../src/controller/tagController', () => ({
  __esModule: true,
  default: {
    createTag: jest.fn(),
    getTags: jest.fn(),
    getTagById: jest.fn(),
    getTagsByUser: jest.fn(),
    updateTag: jest.fn(),
    deleteTag: jest.fn(),
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

describe('tagRoutes', () => {
  describe('POST', () => {
    it('registers / with verifyToken and createTag', () => {
      const route = getRoute('/', 'post');
      const handlers = getHandlers('/', 'post');

      expect(route.path).toBe('/');
      expect(route.methods.post).toBe(true);
      expect(handlers).toHaveLength(2);
      expect(handlers[0]).toBe(verifyToken);
      expect(handlers[1]).toEqual(expect.any(Function));
      expect(handlers[1].toString()).toContain('createTag');
    });
  });

  describe('GET', () => {
    it('registers / with verifyToken and getTags', () => {
      const route = getRoute('/', 'get');
      const handlers = getHandlers('/', 'get');

      expect(route.path).toBe('/');
      expect(route.methods.get).toBe(true);
      expect(handlers).toHaveLength(2);
      expect(handlers[0]).toBe(verifyToken);
      expect(handlers[1]).toEqual(expect.any(Function));
      expect(handlers[1].toString()).toContain('getTags');
    });

    it('registers /:id with verifyToken and getTagById', () => {
      const route = getRoute('/:id', 'get');
      const handlers = getHandlers('/:id', 'get');

      expect(route.path).toBe('/:id');
      expect(route.methods.get).toBe(true);
      expect(handlers).toHaveLength(2);
      expect(handlers[0]).toBe(verifyToken);
      expect(handlers[1]).toEqual(expect.any(Function));
      expect(handlers[1].toString()).toContain('getTagById');
    });

    it('registers /user/:userId with verifyToken and getTagsByUser', () => {
      const route = getRoute('/user/:userId', 'get');
      const handlers = getHandlers('/user/:userId', 'get');

      expect(route.path).toBe('/user/:userId');
      expect(route.methods.get).toBe(true);
      expect(handlers).toHaveLength(2);
      expect(handlers[0]).toBe(verifyToken);
      expect(handlers[1]).toEqual(expect.any(Function));
      expect(handlers[1].toString()).toContain('getTagsByUser');
    });
  });

  describe('PUT', () => {
    it('registers /:id with verifyToken and updateTag', () => {
      const route = getRoute('/:id', 'put');
      const handlers = getHandlers('/:id', 'put');

      expect(route.path).toBe('/:id');
      expect(route.methods.put).toBe(true);
      expect(handlers).toHaveLength(2);
      expect(handlers[0]).toBe(verifyToken);
      expect(handlers[1]).toEqual(expect.any(Function));
      expect(handlers[1].toString()).toContain('updateTag');
    });
  });

  describe('DELETE', () => {
    it('registers /:id with verifyToken and deleteTag', () => {
      const route = getRoute('/:id', 'delete');
      const handlers = getHandlers('/:id', 'delete');

      expect(route.path).toBe('/:id');
      expect(route.methods.delete).toBe(true);
      expect(handlers).toHaveLength(2);
      expect(handlers[0]).toBe(verifyToken);
      expect(handlers[1]).toEqual(expect.any(Function));
      expect(handlers[1].toString()).toContain('deleteTag');
    });
  });
});
