export enum AuthStatus {
    UNAUTHENTICATED = "unauthenticated",
    AUTHENTICATED = "authenticated",
    REFRESHING = "refreshing",
}

export enum AuthEvent {
    LOGIN_SUCCESS = "login_success",
    LOGOUT = "logout",
    SESSION_EXPIRED = "session_expired",
}
