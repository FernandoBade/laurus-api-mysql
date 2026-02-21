import { AuthEvent } from "@shared/enums/auth.enums";
import { ResourceKey } from "@shared/i18n/resource.keys";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const loginApiMock = vi.fn();
const refreshApiMock = vi.fn();
const logoutApiMock = vi.fn();
const setAuthRefreshHandlerMock = vi.fn();
const emitAuthEventMock = vi.fn();
const setAuthenticatedMock = vi.fn();
const setRefreshingMock = vi.fn();
const setUnauthenticatedMock = vi.fn();

vi.mock("@/api/auth/auth.api", () => ({
    login: (...args: unknown[]) => loginApiMock(...args),
    refresh: (...args: unknown[]) => refreshApiMock(...args),
    logout: (...args: unknown[]) => logoutApiMock(...args),
}));

vi.mock("@/api/http/httpClient", () => ({
    setAuthRefreshHandler: (...args: unknown[]) => setAuthRefreshHandlerMock(...args),
}));

vi.mock("@/state/auth.store", () => ({
    emitAuthEvent: (...args: unknown[]) => emitAuthEventMock(...args),
    setAuthenticated: (...args: unknown[]) => setAuthenticatedMock(...args),
    setRefreshing: (...args: unknown[]) => setRefreshingMock(...args),
    setUnauthenticated: (...args: unknown[]) => setUnauthenticatedMock(...args),
}));

import { initializeAuthService, login, logout, refresh } from "@/services/auth/auth.service";

describe("auth.service", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("prioritizes response.resource as semantic key", async () => {
        loginApiMock.mockResolvedValue({
            success: false,
            resource: ResourceKey.EMAIL_NOT_VERIFIED,
            message: "Email nao verificado",
            error: { canResend: true },
        });

        const result = await login("user@example.com", "wrong");

        expect(result).toEqual({
            success: false,
            messageKey: ResourceKey.EMAIL_NOT_VERIFIED,
            error: { canResend: true },
        });
        expect(setUnauthenticatedMock).toHaveBeenCalledTimes(1);
    });

    it("falls back to response.message when resource is absent", async () => {
        loginApiMock.mockResolvedValue({
            success: false,
            message: ResourceKey.INVALID_CREDENTIALS,
        });

        const result = await login("user@example.com", "wrong");

        expect(result.messageKey).toBe(ResourceKey.INVALID_CREDENTIALS);
        expect(setUnauthenticatedMock).toHaveBeenCalledTimes(1);
    });

    it("does not treat translated message text as semantic key", async () => {
        loginApiMock.mockResolvedValue({
            success: false,
            message: "Credenciais invalidas",
        });

        const result = await login("user@example.com", "wrong");

        expect(result.messageKey).toBeUndefined();
        expect(setUnauthenticatedMock).toHaveBeenCalledTimes(1);
    });

    it("stores token and emits login success on successful login", async () => {
        loginApiMock.mockResolvedValue({
            success: true,
            data: { token: "access-token" },
            resource: ResourceKey.EMAIL_VERIFICATION_SUCCESS,
        });

        const result = await login("user@example.com", "secret");

        expect(result).toEqual({
            success: true,
            messageKey: ResourceKey.EMAIL_VERIFICATION_SUCCESS,
        });
        expect(setAuthenticatedMock).toHaveBeenCalledWith("access-token");
        expect(emitAuthEventMock).toHaveBeenCalledWith(AuthEvent.LOGIN_SUCCESS);
    });

    it("registers refresh handler on initialize", () => {
        initializeAuthService();
        expect(setAuthRefreshHandlerMock).toHaveBeenCalledTimes(1);
        expect(setAuthRefreshHandlerMock).toHaveBeenCalledWith(refresh);
    });

    it("marks refreshing state and returns false when refresh fails", async () => {
        refreshApiMock.mockResolvedValue({ success: false });

        const result = await refresh();

        expect(result).toBe(false);
        expect(setRefreshingMock).toHaveBeenCalledTimes(1);
        expect(setUnauthenticatedMock).toHaveBeenCalledTimes(1);
    });

    it("logs out and emits event", async () => {
        logoutApiMock.mockResolvedValue({ success: true });

        const result = await logout();

        expect(result).toBe(true);
        expect(setUnauthenticatedMock).toHaveBeenCalledTimes(1);
        expect(emitAuthEventMock).toHaveBeenCalledWith(AuthEvent.LOGOUT);
    });
});
