export interface AppEnv {
  readonly apiBaseUrl: string;
}

const DEFAULT_API_BASE_URL = "http://localhost:5050";

export const APP_ENV: AppEnv = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL,
};
