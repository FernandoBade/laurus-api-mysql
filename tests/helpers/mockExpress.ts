import { NextFunction, Request, Response } from 'express';

/**
 * @summary Creates a lightweight mock of Express.Request for controller tests.
 */
export function createMockRequest(overrides: Partial<Request> = {}): Request {
    return {
        body: {},
        params: {},
        query: {},
        headers: {},
        language: 'en-US',
        ...overrides,
    } as Request;
}

/**
 * @summary Builds a chainable Express.Response mock capturing status and json calls.
 */
export function createMockResponse(): Response {
    const res: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        cookie: jest.fn().mockReturnThis(),
        clearCookie: jest.fn().mockReturnThis(),
        headersSent: false,
        locals: { _startNs: process.hrtime.bigint() },
    };

    return res as Response;
}

/**
 * @summary Returns a jest.fn to assert middleware next() calls.
 */
export function createNext(): NextFunction {
    return jest.fn();
}
