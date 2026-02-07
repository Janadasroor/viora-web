import { ApiError } from "@/models/ApiError";

const ERROR_MESSAGES: Record<string, string> = {
    // Auth Errors
    MISSING_CREDENTIALS: "Please enter both email and password.",
    INVALID_CREDENTIALS: "The email or password you entered is incorrect.",
    MISSING_FIELDS: "Please fill in all required fields.",
    INVALID_USERNAME_LENGTH: "Username must be between 3 and 30 characters.",
    INVALID_USERNAME_CHARS: "Username can only contain letters, numbers, underscores, and hyphens.",
    WEAK_PASSWORD: "Password must be at least 8 characters long.",
    USERNAME_TAKEN: "This username is already taken. Please choose another one.",
    INVALID_EMAIL: "Please enter a valid email address.",
    USER_NOT_FOUND: "No account found with this information.",
    EMAIL_TAKEN: "This email is already registered. Please sign in instead.",
    INVALID_CODE: "The verification code is invalid or has expired.",
    MISSING_TOKEN: "Authentication token is missing. Please sign in again.",
    INVALID_TOKEN: "Your session has expired. Please sign in again.",
    MISSING_EMAIL: "Email address is required.",
    INVALID_PASSWORD: "The password you entered is incorrect.",

    // Generic Errors
    UNKNOWN_ERROR: "An unexpected error occurred. Please try again.",
    NETWORK_ERROR: "Unable to connect to the server. Please check your internet connection.",
};

export interface ValidationErrorDetail {
    field: string;
    message: string;
}

export function getValidationErrors(error: any): Record<string, string> | null {
    // Handle direct error object (e.g. from axios response.data)
    let errorData = error;
    // Handle axios error structure
    if (error?.response?.data) {
        errorData = error.response.data;
    }

    if (errorData && errorData.code === 'VALIDATION_ERROR' && Array.isArray(errorData.details)) {
        const errors: Record<string, string> = {};
        errorData.details.forEach((detail: ValidationErrorDetail) => {
            errors[detail.field] = detail.message;
        });
        return errors;
    }
    return null;
}

export function getErrorMessage(error: any): string {
    if (!error) return "";

    // If it's an ApiError with a code, look it up
    if (error.code && ERROR_MESSAGES[error.code]) {
        return ERROR_MESSAGES[error.code];
    }

    // If it has a message, use it (fallback for unmapped errors)
    if (error.message) {
        return error.message;
    }

    // Fallback for string errors
    if (typeof error === "string") {
        return error;
    }

    return ERROR_MESSAGES.UNKNOWN_ERROR;
}
