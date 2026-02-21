import { AuthEvent } from "@shared/enums/auth.enums";
import { ResourceKey } from "@shared/i18n/resource.keys";
import * as authApi from "@/api/auth/auth.api";
import type { ApiResponse } from "@/api/http/httpTypes";
import { setAuthRefreshHandler } from "@/api/http/httpClient";
import { emitAuthEvent, setAuthenticated, setRefreshing, setUnauthenticated } from "@/state/auth.store";

function resolveFailureResource<T>(response: ApiResponse<T>): ResourceKey {
    if (!response.success) {
        return response.resource ?? ResourceKey.UNEXPECTED_ERROR;
    }

    return ResourceKey.UNEXPECTED_ERROR;
}

export interface AuthLoginResult {
    success: boolean;
    messageKey?: ResourceKey;
    error?: unknown;
}

/**
 * @summary Authenticates the user and stores the resulting access token.
 * @param email User email.
 * @param password User password.
 * @returns Login operation result with normalized success and error fields.
 */
export async function login(email: string, password: string): Promise<AuthLoginResult> {
    const response = await authApi.login(email, password);
    const token = response.data?.token;

    if (response.success && typeof token === "string" && token.length > 0) {
        setAuthenticated(token);
        emitAuthEvent(AuthEvent.LOGIN_SUCCESS);
        return {
            success: true,
            messageKey: response.resource,
        };
    }

    setUnauthenticated();
    return {
        success: false,
        messageKey: resolveFailureResource(response),
        error: response.error,
    };
}

/**
 * @summary Refreshes the access token using backend refresh cookies.
 * @returns True when refresh succeeds and token is updated, otherwise false.
 */
export async function refresh(): Promise<boolean> {
    setRefreshing();

    const response = await authApi.refresh();
    const token = response.data?.token;

    if (response.success && typeof token === "string" && token.length > 0) {
        setAuthenticated(token);
        return true;
    }

    setUnauthenticated();
    return false;
}

/**
 * @summary Logs out current session and clears local auth state.
 * @returns True when backend logout succeeds, otherwise false.
 */
export async function logout(): Promise<boolean> {
    const response = await authApi.logout();
    setUnauthenticated();
    emitAuthEvent(AuthEvent.LOGOUT);
    return response.success;
}

/**
 * @summary Registers auth service runtime hooks required by the HTTP layer.
 * @returns No return value.
 */
export function initializeAuthService(): void {
    setAuthRefreshHandler(refresh);
}
