export interface AppEnv {
    readonly apiBaseUrl: string;
    readonly isDev: boolean;
    readonly isProd: boolean;
    readonly mode: string;
}

function getEnvVariable(key: keyof ImportMetaEnv): string {
    const value = import.meta.env[key];

    if (!value) {
        throw new Error(`Missing environment variable: ${key}`);
    }

    return value;
}

export const APP_ENV: AppEnv = {
    apiBaseUrl: getEnvVariable("VITE_API_BASE_URL"),
    isDev: import.meta.env.DEV,
    isProd: import.meta.env.PROD,
    mode: import.meta.env.MODE,
};
