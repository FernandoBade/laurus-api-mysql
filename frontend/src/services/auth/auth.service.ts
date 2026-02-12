import { AuthEvent } from "@shared/enums/auth.enums";
import * as authApi from "@/api/auth/auth.api";
import { setAuthRefreshHandler } from "@/api/http/httpClient";
import { emitAuthEvent, setAuthenticated, setRefreshing, setUnauthenticated } from "@/state/auth.store";

export interface AuthLoginResult {
  success: boolean;
  message?: string;
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
      message: response.message,
    };
  }

  setUnauthenticated();
  return {
    success: false,
    message: response.message,
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

setAuthRefreshHandler(refresh);
