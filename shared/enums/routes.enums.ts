/** @summary History API route paths used by the frontend application shell. */
export enum AppRoutePath {
    LOGIN = "/login",
    DASHBOARD = "/dashboard",
}

/** @summary API route paths used by frontend HTTP clients. */
export enum ApiRoutePath {
    AUTH_LOGIN = "/auth/login",
    AUTH_REFRESH = "/auth/refresh",
    AUTH_LOGOUT = "/auth/logout",
    USERS = "/users",
    USER_BY_ID = "/users/:id",
}
