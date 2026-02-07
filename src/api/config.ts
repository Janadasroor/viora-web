/**
 * Shared API configuration
 */

export const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003/api/1.0.0";

/**
 * Common fetch options for API requests
 */
export const defaultFetchOptions: RequestInit = {
    credentials: "include",
    cache: "no-store",
};

/**
 * Helper to create fetch options with JSON headers
 */
export const jsonFetchOptions = (method: string = "GET", body?: any): RequestInit => ({
    method,
    headers: { "Content-Type": "application/json" },
    ...defaultFetchOptions,
    ...(body ? { body: JSON.stringify(body) } : {}),
});
