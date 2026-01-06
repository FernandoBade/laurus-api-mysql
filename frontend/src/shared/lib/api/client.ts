import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import { getResourceLanguage } from "@/shared/i18n";
import { getAccessToken } from "@/shared/lib/auth/session";
import type { ApiResponse, QueryParams } from "@/shared/types/api";
import { getApiErrorFromPayload, normalizeApiError } from "./errors";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

export const refreshClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

type RefreshHandler = () => Promise<string | null>;
type UnauthorizedHandler = () => void;

let refreshHandler: RefreshHandler | null = null;
let unauthorizedHandler: UnauthorizedHandler | null = null;
let refreshPromise: Promise<string | null> | null = null;

export const setRefreshHandler = (handler: RefreshHandler) => {
  refreshHandler = handler;
};

export const setUnauthorizedHandler = (handler: UnauthorizedHandler) => {
  unauthorizedHandler = handler;
};

const isAuthEndpoint = (url?: string) => {
  if (!url) return false;
  return (
    url.includes("/auth/login") ||
    url.includes("/auth/refresh") ||
    url.includes("/auth/logout")
  );
};

const getRefreshPromise = async () => {
  if (!refreshHandler) {
    return null;
  }
  if (!refreshPromise) {
    refreshPromise = refreshHandler()
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

const applyResourceLanguageHeader = (config: InternalAxiosRequestConfig) => {
  const language = getResourceLanguage();
  config.headers = config.headers ?? {};
  config.headers["Accept-Language"] = language;
  return config;
};

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return applyResourceLanguageHeader(config);
});

refreshClient.interceptors.request.use((config) => {
  return applyResourceLanguageHeader(config);
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const config = error.config as (InternalAxiosRequestConfig & {
      _retry?: boolean;
    });

    if (
      status === 401 &&
      config &&
      !config._retry &&
      !isAuthEndpoint(config.url)
    ) {
      config._retry = true;
      const token = await getRefreshPromise();
      if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
        return apiClient(config);
      }

      if (unauthorizedHandler) {
        unauthorizedHandler();
      }
    }

    return Promise.reject(error);
  }
);

type ApiRequestConfig = Omit<AxiosRequestConfig, "params" | "data"> & {
  params?: QueryParams;
  data?: unknown;
};

const request = async <TData, TResponse extends ApiResponse<TData> = ApiResponse<TData>>(
  config: ApiRequestConfig,
  client: AxiosInstance = apiClient
): Promise<TResponse> => {
  try {
    const response = await client.request<TResponse>(config);
    const payload = response.data;
    if (!payload || typeof payload !== "object" || payload.success !== true) {
      throw getApiErrorFromPayload(payload, response.status);
    }
    return payload;
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const apiGet = <TData, TResponse extends ApiResponse<TData> = ApiResponse<TData>>(
  url: string,
  params?: QueryParams,
  config?: Omit<ApiRequestConfig, "url" | "method" | "params">
) => request<TData, TResponse>({ url, method: "GET", params, ...config });

export const apiPost = <TData, TResponse extends ApiResponse<TData> = ApiResponse<TData>>(
  url: string,
  data?: unknown,
  config?: Omit<ApiRequestConfig, "url" | "method" | "data">
) => request<TData, TResponse>({ url, method: "POST", data, ...config });

export const apiPut = <TData, TResponse extends ApiResponse<TData> = ApiResponse<TData>>(
  url: string,
  data?: unknown,
  config?: Omit<ApiRequestConfig, "url" | "method" | "data">
) => request<TData, TResponse>({ url, method: "PUT", data, ...config });

export const apiDelete = <TData, TResponse extends ApiResponse<TData> = ApiResponse<TData>>(
  url: string,
  config?: Omit<ApiRequestConfig, "url" | "method">
) => request<TData, TResponse>({ url, method: "DELETE", ...config });

export const refreshRequest = <TData, TResponse extends ApiResponse<TData> = ApiResponse<TData>>(
  config: ApiRequestConfig
) => request<TData, TResponse>(config, refreshClient);
