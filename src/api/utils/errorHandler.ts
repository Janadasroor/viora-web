import type { ApiError } from "@/models/ApiError";

/**
 * Helper to throw ApiError with proper typing
 */
export const throwApiError = (data: any, status: number): never => {
    const error = new Error(data.message || `Request failed with status ${status}`) as ApiError;
    error.code = data.code;
    error.status = status;
    error.details = data.details;
    throw error;
};

/**
 * Helper to handle API response errors
 */
export const handleApiError = async (res: Response): Promise<void> => {
    if (!res.ok) {
        const errorData = await res.json();
        throwApiError(errorData, res.status);
    }
};
