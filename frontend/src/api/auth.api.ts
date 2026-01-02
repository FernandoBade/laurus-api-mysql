import type { ApiResponse } from "./api.types";
import type {
  AuthTokenResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from "./auth.types";
import { httpClient, refreshClient, setRefreshHandler } from "./httpClient";
import { setAccessToken } from "./tokenStore";

export const login = async (payload: LoginRequest) => {
  const response = await httpClient.post<ApiResponse<AuthTokenResponse>>(
    "/auth/login",
    payload
  );
  return response.data;
};

export const register = async (payload: RegisterRequest) => {
  const response = await httpClient.post<ApiResponse<User>>("/users", payload);
  return response.data;
};

export const refreshAccessToken = async () => {
  const response = await refreshClient.post<ApiResponse<AuthTokenResponse>>(
    "/auth/refresh"
  );
  const token = response.data?.data?.token ?? null;
  if (token) {
    setAccessToken(token);
  }
  return token;
};

export const logout = async () => {
  const response = await httpClient.post<ApiResponse<unknown>>("/auth/logout");
  return response.data;
};

setRefreshHandler(refreshAccessToken);
