import { Request, Response, NextFunction } from 'express';
import { answerAPI } from '../commons';
import { HTTPStatus } from '../enum';
import { Resource } from '../resources/resource';

const RATE_LIMIT_MAX_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

type AttemptStore = Map<string, number[]>;

const loginAttempts: AttemptStore = new Map();
const refreshAttempts: AttemptStore = new Map();

const normalizeEmail = (value: unknown): string | null => {
    if (typeof value !== 'string') {
        return null;
    }
    const normalized = value.trim().toLowerCase();
    return normalized.length > 0 ? normalized : null;
};

const getClientIp = (req: Request): string => {
    if (typeof req.ip === 'string' && req.ip.trim().length > 0) {
        return req.ip;
    }
    return 'unknown';
};

const buildKey = (scope: 'login' | 'refresh', req: Request): string => {
    const ip = getClientIp(req);
    if (scope === 'refresh') {
        return `${scope}:${ip}`;
    }

    const email = normalizeEmail(req.body?.email);
    return email ? `${scope}:${ip}:${email}` : `${scope}:${ip}`;
};

const pruneAttempts = (attempts: number[], now: number) =>
    attempts.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);

const isRateLimited = (store: AttemptStore, key: string, now = Date.now()): boolean => {
    const attempts = pruneAttempts(store.get(key) ?? [], now);
    if (attempts.length >= RATE_LIMIT_MAX_ATTEMPTS) {
        store.set(key, attempts);
        return true;
    }
    if (attempts.length === 0) {
        store.delete(key);
    } else {
        store.set(key, attempts);
    }
    return false;
};

const registerFailure = (store: AttemptStore, key: string, now = Date.now()): void => {
    const attempts = pruneAttempts(store.get(key) ?? [], now);
    attempts.push(now);
    store.set(key, attempts);
};

const resetFailures = (store: AttemptStore, key: string): void => {
    store.delete(key);
};

export const rateLimitLogin = (req: Request, res: Response, next: NextFunction) => {
    const key = buildKey('login', req);
    if (isRateLimited(loginAttempts, key)) {
        answerAPI(req, res, HTTPStatus.TOO_MANY_REQUESTS, undefined, Resource.TOO_MANY_REQUESTS);
        return;
    }
    next();
};

export const rateLimitRefresh = (req: Request, res: Response, next: NextFunction) => {
    const key = buildKey('refresh', req);
    if (isRateLimited(refreshAttempts, key)) {
        answerAPI(req, res, HTTPStatus.TOO_MANY_REQUESTS, undefined, Resource.TOO_MANY_REQUESTS);
        return;
    }
    next();
};

export const recordLoginFailure = (req: Request): void => {
    const key = buildKey('login', req);
    registerFailure(loginAttempts, key);
};

export const resetLoginRateLimit = (req: Request): void => {
    const key = buildKey('login', req);
    resetFailures(loginAttempts, key);
};

export const recordRefreshFailure = (req: Request): void => {
    const key = buildKey('refresh', req);
    registerFailure(refreshAttempts, key);
};

export const resetRefreshRateLimit = (req: Request): void => {
    const key = buildKey('refresh', req);
    resetFailures(refreshAttempts, key);
};

export const clearRateLimitState = (): void => {
    loginAttempts.clear();
    refreshAttempts.clear();
};
