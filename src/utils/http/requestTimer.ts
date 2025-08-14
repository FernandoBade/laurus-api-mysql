import { NextFunction, Request, Response } from 'express';

export function requestTimer() {
    return (_req: Request, res: Response, next: NextFunction) => {
        res.locals._startNs = process.hrtime.bigint();
        next();
    };
}

export function getDurationMs(res: Response) {
    const start = res.locals._startNs as bigint | undefined;
    if (typeof start === 'bigint') {
        const diff = process.hrtime.bigint() - start;
        return Number(diff) / 1e6;
    }
    return undefined;
}
