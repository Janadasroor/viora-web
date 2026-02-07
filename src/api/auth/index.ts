import { apiUrl, jsonFetchOptions } from "../config";
import type { ApiResponse } from "@/models/ApiResponse";
import type { AuthResponse } from "@/models/AuthResponse";
import { throwApiError } from "../utils/errorHandler";

/**
 * Login user
 */
export async function login(email: string, password: string): Promise<AuthResponse> {
    try {
        const res = await fetch(`${apiUrl}/auth/login`, {
            ...jsonFetchOptions("POST", { email, password }),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throwApiError(errorData, res.status);
        }

        const data = await res.json() as AuthResponse;
        return data;
    } catch (err) {
        console.error("Error login", err);
        throw err;
    }
}

/**
 * Register new user
 */
export async function register(
    email: string,
    username: string,
    password: string
): Promise<AuthResponse> {
    try {
        const res = await fetch(`${apiUrl}/auth/register`, {
            ...jsonFetchOptions("POST", { email, username, password }),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throwApiError(errorData, res.status);
        }

        const data = await res.json() as AuthResponse;
        return data;
    } catch (err) {
        console.error("Error registering", err);
        throw err;
    }
}

/**
 * Refresh access token
 */
export async function refreshToken(token?: string): Promise<{ accessToken: string }> {
    try {
        const body = token ? { refreshToken: token } : {};
        const res = await fetch(`${apiUrl}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            cache: "no-store",
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throwApiError(errorData, res.status);
        }

        const data = await res.json();
        return data.data;
    } catch (err) {
        console.error("Error refreshing token", err);
        throw err;
    }
}

/**
 * Logout user
 */
export async function logout(): Promise<boolean> {
    try {
        const res = await fetch(`${apiUrl}/auth/logout`, {
            ...jsonFetchOptions("POST", {}),
        });
        return res.ok;
    } catch (err) {
        console.error("Error logging out", err);
        return false;
    }
}

/**
 * Request verification code
 */
export async function requestVerificationCode(email: string, userId: string): Promise<boolean> {
    try {
        const res = await fetch(`${apiUrl}/auth/request-code`, {
            ...jsonFetchOptions("POST", { email, userId }),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throwApiError(errorData, res.status);
        }

        return true;
    } catch (err) {
        console.error("Error requesting verification code", err);
        throw err;
    }
}

/**
 * Verify email with code
 */
export async function verifyCode(email: string, code: string): Promise<AuthResponse> {
    try {
        const res = await fetch(`${apiUrl}/auth/verify-code`, {
            ...jsonFetchOptions("POST", { email, code }),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throwApiError(errorData, res.status);
        }

        const data = await res.json() as AuthResponse;
        return data;
    } catch (err) {
        console.error("Error verifying code", err);
        throw err;
    }
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email: string): Promise<ApiResponse<any>> {
    try {
        const res = await fetch(`${apiUrl}/auth/forgot-password`, {
            ...jsonFetchOptions("POST", { email }),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throwApiError(errorData, res.status);
        }

        const data = await res.json();
        return data;
    } catch (err) {
        console.error("Error requesting password reset", err);
        throw err;
    }
}

/**
 * Reset password with code
 */
export async function resetPassword(email: string, code: string, newPassword: string): Promise<ApiResponse<any>> {
    try {
        const res = await fetch(`${apiUrl}/auth/reset-password`, {
            ...jsonFetchOptions("POST", { email, code, newPassword }),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throwApiError(errorData, res.status);
        }

        const data = await res.json();
        return data;
    } catch (err) {
        console.error("Error resetting password", err);
        throw err;
    }
}

/**
 * Change password (authenticated)
 */
export async function changePassword(oldPassword: string, newPassword: string): Promise<ApiResponse<any>> {
    try {
        const res = await fetch(`${apiUrl}/auth/change-password`, {
            ...jsonFetchOptions("POST", { oldPassword, newPassword }),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throwApiError(errorData, res.status);
        }

        const data = await res.json();
        return data;
    } catch (err) {
        console.error("Error changing password", err);
        throw err;
    }
}
