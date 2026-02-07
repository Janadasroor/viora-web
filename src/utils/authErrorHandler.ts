import type { ApiError } from "@/models/ApiError";

/**
 * Authentication error codes that require specific handling
 */
export const AUTH_ERROR_CODES = {
    AUTH_REQUIRED: 'AUTH_REQUIRED',
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',
    INVALID_TOKEN: 'INVALID_TOKEN',
    TOKEN_REUSE_DETECTED: 'TOKEN_REUSE_DETECTED',
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
    ACCOUNT_SUSPENDED: 'ACCOUNT_SUSPENDED',
    ACCOUNT_BANNED: 'ACCOUNT_BANNED',
    EMAIL_TAKEN: 'EMAIL_TAKEN',
    USERNAME_TAKEN: 'USERNAME_TAKEN',
    USER_NOT_FOUND: 'USER_NOT_FOUND',
    INVALID_CODE: 'INVALID_CODE',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const;

export type AuthErrorCode = typeof AUTH_ERROR_CODES[keyof typeof AUTH_ERROR_CODES];

/**
 * Error handling action types
 */
export type ErrorAction =
    | { type: 'REDIRECT'; path: string }
    | { type: 'REFRESH_TOKEN' }
    | { type: 'SHOW_MESSAGE'; message: string }
    | { type: 'LOGOUT' }
    | { type: 'NONE' };

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: ApiError | Error): string {
    if ('code' in error && error.code) {
        const code = error.code as AuthErrorCode;

        switch (code) {
            case AUTH_ERROR_CODES.AUTH_REQUIRED:
                return 'Please sign in to continue';
            case AUTH_ERROR_CODES.TOKEN_EXPIRED:
                return 'Your session has expired. Refreshing...';
            case AUTH_ERROR_CODES.INVALID_TOKEN:
                return 'Your session is invalid. Please sign in again';
            case AUTH_ERROR_CODES.TOKEN_REUSE_DETECTED:
                return 'Security alert: Please sign in again';
            case AUTH_ERROR_CODES.INVALID_CREDENTIALS:
                return 'Invalid email or password';
            case AUTH_ERROR_CODES.EMAIL_NOT_VERIFIED:
                return 'Please verify your email to continue';
            case AUTH_ERROR_CODES.ACCOUNT_SUSPENDED:
                return 'Please complete your profile to continue';
            case AUTH_ERROR_CODES.ACCOUNT_BANNED:
                return 'Your account has been banned';
            case AUTH_ERROR_CODES.EMAIL_TAKEN:
                return 'This email is already registered';
            case AUTH_ERROR_CODES.USERNAME_TAKEN:
                return 'This username is already taken';
            case AUTH_ERROR_CODES.USER_NOT_FOUND:
                return 'User not found';
            case AUTH_ERROR_CODES.INVALID_CODE:
                return 'Invalid or expired verification code';
            case AUTH_ERROR_CODES.VALIDATION_ERROR:
                return 'Please check your input and try again';
            default:
                return error.message || 'An error occurred';
        }
    }

    return error.message || 'An unexpected error occurred';
}

/**
 * Determine what action to take based on error code
 */
export function getErrorAction(error: ApiError | Error, currentPath?: string, userEmail?: string): ErrorAction {
    if (!('code' in error) || !error.code) {
        return { type: 'SHOW_MESSAGE', message: getErrorMessage(error) };
    }

    const code = error.code as AuthErrorCode;

    switch (code) {
        case AUTH_ERROR_CODES.AUTH_REQUIRED:
            // Only redirect if not already on a public page
            const publicRoutes = ['/login', '/register', '/verify-email', '/forgot-password', '/reset-password'];
            if (!publicRoutes.includes(currentPath || '')) {
                return { type: 'REDIRECT', path: '/login' };
            }
            return { type: 'NONE' };

        case AUTH_ERROR_CODES.TOKEN_EXPIRED:
            return { type: 'REFRESH_TOKEN' };

        case AUTH_ERROR_CODES.INVALID_TOKEN:
        case AUTH_ERROR_CODES.TOKEN_REUSE_DETECTED:
            return { type: 'LOGOUT' };

        case AUTH_ERROR_CODES.EMAIL_NOT_VERIFIED:
            // Use email from user context if available, otherwise from error
            const email = userEmail || ('email' in error ? (error as any).email : undefined);
            const verifyPath = email ? `/verify-email?email=${encodeURIComponent(email)}` : '/verify-email';
            return { type: 'REDIRECT', path: verifyPath };

        case AUTH_ERROR_CODES.ACCOUNT_SUSPENDED:
            return { type: 'REDIRECT', path: '/complete-profile' };

        case AUTH_ERROR_CODES.ACCOUNT_BANNED:
            return { type: 'LOGOUT' };

        case AUTH_ERROR_CODES.INVALID_CREDENTIALS:
        case AUTH_ERROR_CODES.EMAIL_TAKEN:
        case AUTH_ERROR_CODES.USERNAME_TAKEN:
        case AUTH_ERROR_CODES.USER_NOT_FOUND:
        case AUTH_ERROR_CODES.INVALID_CODE:
        case AUTH_ERROR_CODES.VALIDATION_ERROR:
            return { type: 'SHOW_MESSAGE', message: getErrorMessage(error) };

        default:
            return { type: 'SHOW_MESSAGE', message: getErrorMessage(error) };
    }
}

/**
 * Check if error should trigger automatic handling
 */
export function shouldAutoHandle(error: ApiError | Error): boolean {
    if (!('code' in error) || !error.code) {
        return false;
    }

    const code = error.code as AuthErrorCode;

    // These errors should be handled automatically by the system
    const autoHandleCodes = [
        AUTH_ERROR_CODES.AUTH_REQUIRED,
        AUTH_ERROR_CODES.TOKEN_EXPIRED,
        AUTH_ERROR_CODES.INVALID_TOKEN,
        AUTH_ERROR_CODES.TOKEN_REUSE_DETECTED,
        AUTH_ERROR_CODES.EMAIL_NOT_VERIFIED,
        AUTH_ERROR_CODES.ACCOUNT_SUSPENDED,
        AUTH_ERROR_CODES.ACCOUNT_BANNED,
        AUTH_ERROR_CODES.INVALID_CREDENTIALS,
        AUTH_ERROR_CODES.EMAIL_TAKEN,
        AUTH_ERROR_CODES.USERNAME_TAKEN,
        AUTH_ERROR_CODES.USER_NOT_FOUND,
        AUTH_ERROR_CODES.INVALID_CODE,
        AUTH_ERROR_CODES.VALIDATION_ERROR,
    ];

    return autoHandleCodes.includes(code);
}
