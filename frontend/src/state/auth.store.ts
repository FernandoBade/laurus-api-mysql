import { AuthEvent, AuthStatus } from "@shared/enums/auth.enums";
import { StorageKey } from "@shared/enums/storage.enums";
import { storage } from "@/platform/storage/storage";

interface AuthState {
    status: AuthStatus;
    accessToken: string | null;
}

type AuthStateListener = (state: AuthState) => void;
type AuthEventListener = (event: AuthEvent) => void;

const authStateListeners = new Set<AuthStateListener>();
const authEventListeners = new Set<AuthEventListener>();

const initialToken = storage.get<string>(StorageKey.ACCESS_TOKEN);

let state: AuthState = {
    status: initialToken ? AuthStatus.AUTHENTICATED : AuthStatus.UNAUTHENTICATED,
    accessToken: initialToken,
};

function notifyStateListeners(): void {
    authStateListeners.forEach((listener) => listener(state));
}

/**
 * @summary Marks session as authenticated and persists the access token.
 * @param token Access token returned by auth endpoints.
 * @returns No return value.
 */
export function setAuthenticated(token: string): void {
    state = {
        status: AuthStatus.AUTHENTICATED,
        accessToken: token,
    };
    storage.set<string>(StorageKey.ACCESS_TOKEN, token);
    notifyStateListeners();
}

/**
 * @summary Clears authentication state and removes persisted token.
 * @returns No return value.
 */
export function setUnauthenticated(): void {
    state = {
        status: AuthStatus.UNAUTHENTICATED,
        accessToken: null,
    };
    storage.remove(StorageKey.ACCESS_TOKEN);
    notifyStateListeners();
}

/**
 * @summary Marks auth state as refreshing while keeping current token snapshot.
 * @returns No return value.
 */
export function setRefreshing(): void {
    state = {
        status: AuthStatus.REFRESHING,
        accessToken: state.accessToken,
    };
    notifyStateListeners();
}

/**
 * @summary Reads current access token from in-memory auth state.
 * @returns Access token or null when not authenticated.
 */
export function getAccessToken(): string | null {
    return state.accessToken;
}

/**
 * @summary Checks whether the app is currently authenticated.
 * @returns True when user is authenticated with a token.
 */
export function isAuthenticated(): boolean {
    return state.status === AuthStatus.AUTHENTICATED && state.accessToken !== null;
}

/**
 * @summary Reads the current auth lifecycle status.
 * @returns Current authentication status enum.
 */
export function getAuthStatus(): AuthStatus {
    return state.status;
}

/**
 * @summary Subscribes to auth state changes.
 * @param listener Callback invoked after auth state updates.
 * @returns Unsubscribe function for the provided listener.
 */
export function subscribeAuthState(listener: AuthStateListener): () => void {
    authStateListeners.add(listener);
    return (): void => {
        authStateListeners.delete(listener);
    };
}

/**
 * @summary Emits a typed auth event to registered listeners.
 * @param event Auth event value to dispatch.
 * @returns No return value.
 */
export function emitAuthEvent(event: AuthEvent): void {
    authEventListeners.forEach((listener) => listener(event));
}

/**
 * @summary Subscribes to auth event dispatches.
 * @param listener Callback invoked for each emitted auth event.
 * @returns Unsubscribe function for the provided listener.
 */
export function subscribeAuthEvent(listener: AuthEventListener): () => void {
    authEventListeners.add(listener);
    return (): void => {
        authEventListeners.delete(listener);
    };
}
