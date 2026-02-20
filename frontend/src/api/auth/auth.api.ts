import type { LoginInput, LoginOutput, RefreshOutput } from "@shared/domains/auth/auth.types";
import { HttpContentType, HttpHeaderName, HttpMethod } from "@shared/enums/http.enums";
import { ApiRoutePath } from "@shared/enums/routes.enums";
import { request } from "@/api/http/httpClient";
import type { ApiResponse } from "@/api/http/httpTypes";

/**
 * @summary Authenticates the user with email and password credentials.
 * @param email User email.
 * @param password User password.
 * @returns API response containing access token when successful.
 */
export async function login(email: string, password: string): Promise<ApiResponse<LoginOutput>> {
  const payload: LoginInput = { email, password };

  return request<LoginOutput>(ApiRoutePath.AUTH_LOGIN, {
    method: HttpMethod.POST,
    headers: {
      [HttpHeaderName.CONTENT_TYPE]: HttpContentType.APPLICATION_JSON,
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
    method: HttpMethod.POST,
    headers: {
      [HttpHeaderName.CONTENT_TYPE]: HttpContentType.APPLICATION_JSON,
    },
  });
}

/**
 * @summary Invalidates the active session in the backend.
 * @returns API response for logout operation.
 */
export async function logout(): Promise<ApiResponse<unknown>> {
  return request<unknown>(ApiRoutePath.AUTH_LOGOUT, {
    method: HttpMethod.POST,
    headers: {
      [HttpHeaderName.CONTENT_TYPE]: HttpContentType.APPLICATION_JSON,
    },
  });
}
