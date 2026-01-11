import type { IRoute } from 'express-serve-static-core';
import { verifyToken } from '../../../src/utils/auth/verifyToken';
import FeedbackController from '../../../src/controller/feedbackController';
import router from '../../../src/routes/feedbackRoutes';

jest.mock('../../../src/utils/auth/verifyToken', () => ({
  verifyToken: jest.fn(),
}));

jest.mock('../../../src/controller/feedbackController', () => ({
  __esModule: true,
  default: {
    sendFeedback: jest.fn(),
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

const getHandlers = (path: string, method: HttpMethod) =>
  getRoute(path, method).stack.map(layer => layer.handle);

describe('feedbackRoutes', () => {
  describe('POST', () => {
    it('registers / with verifyToken and sendFeedback', () => {
      const route = getRoute('/', 'post');
      const handlers = getHandlers('/', 'post');

      expect(route.path).toBe('/');
      expect(route.methods.post).toBe(true);
      expect(handlers).toHaveLength(3);
      expect(handlers[0]).toBe(verifyToken);
      expect(handlers[2]).toEqual(expect.any(Function));
      expect(handlers[2].toString()).toContain('sendFeedback');
    });
  });
});
