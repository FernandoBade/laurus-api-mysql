import type { ApiResponse } from "@/shared/types/api";
import {
  apiGet,
  apiPost,
  refreshRequest,
  setRefreshHandler,
} from "@/shared/lib/api/client";
import { getUserId, setAccessToken } from "./session";
import type { User } from "@/features/users/types";
import type {
  AuthTokenResponse,
  LoginRequest,
  RegisterRequest,
  ResendVerificationRequest,
  ResendVerificationResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
} from "./types";

export const login = (payload: LoginRequest): Promise<ApiResponse<AuthTokenResponse>> =>
  apiPost<AuthTokenResponse>("/auth/login", payload);

export const register = (
  payload: RegisterRequest
): Promise<ApiResponse<User>> => apiPost<User>("/users", payload);

export const verifyEmail = (
  payload: VerifyEmailRequest
): Promise<ApiResponse<VerifyEmailResponse>> =>
  apiPost<VerifyEmailResponse>("/auth/verify-email", payload);

export const resendVerificationEmail = (
  payload: ResendVerificationRequest
): Promise<ApiResponse<ResendVerificationResponse>> =>
  apiPost<ResendVerificationResponse>("/auth/resend-verification", payload);

export const refreshAccessToken = async () => {
  try {
    const response = await refreshRequest<AuthTokenResponse>({
      url: "/auth/refresh",
      method: "POST",
    });
    const token = response.data?.token ?? null;
    if (token) {
      setAccessToken(token);
    }
    return token;
  } catch {
    return null;
  }
};

export const logout = (): Promise<ApiResponse<unknown>> =>
  apiPost<unknown>("/auth/logout");

export const getMe = async (): Promise<ApiResponse<User> | null> => {
  const userId = getUserId();
  if (!userId) {
    return null;
  }
  return apiGet<User>(`/users/${userId}`);
};

setRefreshHandler(refreshAccessToken);
