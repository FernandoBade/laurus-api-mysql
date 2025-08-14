import { Request, Response, NextFunction } from 'express';


export function requestTimer() {
    return (_req: Request, res: Response, next: NextFunction) => {
        res.locals._startNs = process.hrtime.bigint();
        next();
    };
}

export function getDurationMs(res: Response): number {
    const start: bigint | undefined = res.locals?._startNs;
    if (!start) return 0;
    const end = process.hrtime.bigint();
    return Number((end - start) / 1_000_000n);

}
