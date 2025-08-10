import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * @summary Wraps async route handlers and forwards errors to Express.
 * @param fn Async function to wrap.
 * @returns Express request handler with centralized error propagation.
 */
export function asyncHandler(
    fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
