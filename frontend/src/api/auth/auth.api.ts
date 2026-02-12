import type { LoginInput, LoginOutput, RefreshOutput } from "@shared/domains/auth/auth.types";
import { ApiRoutePath } from "@shared/enums/routes.enums";
import { request } from "@/api/http/httpClient";
import type { ApiResponse } from "@/api/http/httpTypes";

const HEADER_NAME = {
  CONTENT_TYPE: "Content-Type",
} as const;

const CONTENT_TYPE = {
  APPLICATION_JSON: "application/json",
} as const;

const HTTP_METHOD = {
  POST: "POST",
} as const;

/**
 * @summary Authenticates the user with email and password credentials.
 * @param email User email.
 * @param password User password.
 * @returns API response containing access token when successful.
 */
export async function login(email: string, password: string): Promise<ApiResponse<LoginOutput>> {
  const payload: LoginInput = { email, password };

  return request<LoginOutput>(ApiRoutePath.AUTH_LOGIN, {
    method: HTTP_METHOD.POST,
    headers: {
      [HEADER_NAME.CONTENT_TYPE]: CONTENT_TYPE.APPLICATION_JSON,
    },
    body: JSON.stringify(payload),
  });
}

/**
 * @summary Requests a refreshed access token using the refresh cookie session.
 * @returns API response containing a new access token when successful.
 */
export async function refresh(): Promise<ApiResponse<RefreshOutput>> {
  return request<RefreshOutput>(ApiRoutePath.AUTH_REFRESH, {
    method: HTTP_METHOD.POST,
    headers: {
      [HEADER_NAME.CONTENT_TYPE]: CONTENT_TYPE.APPLICATION_JSON,
    },
  });
}

/**
 * @summary Invalidates the active session in the backend.
 * @returns API response for logout operation.
 */
export async function logout(): Promise<ApiResponse<unknown>> {
  return request<unknown>(ApiRoutePath.AUTH_LOGOUT, {
    method: HTTP_METHOD.POST,
    headers: {
      [HEADER_NAME.CONTENT_TYPE]: CONTENT_TYPE.APPLICATION_JSON,
    },
  });
}
