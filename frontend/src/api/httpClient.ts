import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getResourceLanguage } from "../../i18n";
import { getAccessToken } from "./tokenStore";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export const httpClient = axios.create({
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

httpClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return applyResourceLanguageHeader(config);
});

refreshClient.interceptors.request.use((config) => {
  return applyResourceLanguageHeader(config);
});

httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const config = error.config as (InternalAxiosRequestConfig & {
      _retry?: boolean;
    });

    if (status === 401 && config && !config._retry && !isAuthEndpoint(config.url)) {
      config._retry = true;
      const token = await getRefreshPromise();
      if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
        return httpClient(config);
      }

      if (unauthorizedHandler) {
        unauthorizedHandler();
      }
    }

    return Promise.reject(error);
  }
);
