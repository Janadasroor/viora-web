import { apiUrl, defaultFetchOptions } from "./config";
import { refreshToken } from "./auth";
import { getErrorAction, shouldAutoHandle } from "@/utils/authErrorHandler";
import type { ApiError } from "@/models/ApiError";

interface FetchOptions extends RequestInit {
    skipAuthRefresh?: boolean;
    skipAutoErrorHandling?: boolean;
}

let errorCallback: ((error: ApiError) => void) | null = null;
let isRefreshing = false;
let refreshPromise: Promise<any> | null = null;

/**
 * Register a callback to handle errors globally
 */
export function registerErrorCallback(callback: (error: ApiError) => void) {
    errorCallback = callback;
}

/**
 * Custom fetch wrapper that handles automatic token refreshing and error handling
 */
export async function fetchWithAuth(endpoint: string, options: FetchOptions = {}): Promise<Response> {
    const url = endpoint.startsWith("http") ? endpoint : `${apiUrl}${endpoint}`;
    const { skipAuthRefresh, skipAutoErrorHandling, ...fetchOptions } = options;

    // Merge default options
    const finalOptions: RequestInit = {
        ...defaultFetchOptions,
        ...fetchOptions,
        headers: {
            ...defaultFetchOptions.headers,
            ...fetchOptions.headers,
        },
    };

    try {
        // 1. Attempt the request
        let response = await fetch(url, finalOptions);

        // 2. Check for 401 (Unauthorized)
        if (response.status === 401 && !skipAuthRefresh) {
            // Check if it's an auth error that warrants a refresh
            // We clone since we might need to read it multiple times
            const clone = response.clone();
            let errorData: any = null;
            try {
                errorData = await clone.json();
            } catch (e) {
                // Not JSON, continue with generic 401 handling
            }

            // We attempt refresh if it's explicitly TOKEN_EXPIRED OR if it's AUTH_REQUIRED
            // (AUTH_REQUIRED might happen if the access token cookie is missing/expired)
            const shouldTryRefresh = errorData?.code === 'TOKEN_EXPIRED' || errorData?.code === 'AUTH_REQUIRED';

            if (shouldTryRefresh) {
                try {
                    // Handle concurrent refreshes
                    if (!isRefreshing) {
                        isRefreshing = true;
                        refreshPromise = refreshToken().finally(() => {
                            isRefreshing = false;
                            refreshPromise = null;
                        });
                    }

                    // Wait for the refresh to complete
                    await refreshPromise;

                    // 4. Retry original request
                    response = await fetch(url, finalOptions);

                    // If it still fails with 401 after refresh, don't try again
                    if (response.status === 401) {
                        const finalErrorData = await response.json();
                        if (errorCallback && !skipAutoErrorHandling) {
                            errorCallback(finalErrorData as ApiError);
                        }
                    }
                } catch (refreshError: any) {
                    // Refresh failed (e.g. refresh token expired)
                    if (errorCallback && !skipAutoErrorHandling) {
                        // The refresh error itself might be a 401, handle it
                        const error = refreshError as ApiError;
                        if (shouldAutoHandle(error)) {
                            errorCallback(error);
                        } else {
                            // Fallback to the original 401 if refreshError is obscure
                            if (errorData) errorCallback(errorData as ApiError);
                        }
                    }
                    throw refreshError;
                }
            } else if (!skipAutoErrorHandling && errorCallback && errorData) {
                // Handle other auth errors (e.g. INVALID_TOKEN, BANNED) automatically
                if (shouldAutoHandle(errorData)) {
                    errorCallback(errorData as ApiError);
                }
            }
        }

        // 3. Check for other error status codes (non-401)
        if (!response.ok && response.status !== 401 && !skipAutoErrorHandling && errorCallback) {
            try {
                const clone = response.clone();
                const errorData = await clone.json();
                const error = errorData as ApiError;

                if (shouldAutoHandle(error)) {
                    errorCallback(error);
                }
            } catch (e) {
                // Ignore non-JSON errors
            }
        }

        return response;
    } catch (error) {
        throw error;
    }
}

