import type { User } from "@/models/User";
import type { ApiResponse } from "@/models/ApiResponse";
import type { UserProfile } from "@/models/UserProfile";
import { apiUrl, jsonFetchOptions, defaultFetchOptions } from "../config";
import { fetchWithAuth } from "../fetchClient";
import { throwApiError } from "../utils/errorHandler";

// ============================================================================
// GET - User Profile & Data
// ============================================================================

/**
 * Get users with filters and pagination
 */
export async function getUsers(
    page: number = 1,
    limit: number = 20,
    search?: string,
    verified?: boolean,
    status?: string
): Promise<User[]> {
    try {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(search ? { search } : {}),
            ...(verified !== undefined ? { verified: verified.toString() } : {}),
            ...(status ? { status } : {}),
        });

        const res = await fetchWithAuth(`${apiUrl}/users?${params.toString()}`, {
            ...jsonFetchOptions("GET"),
        });

        const data: ApiResponse<User[]> = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.message || "Failed to fetch users");
        }

        if (data.data && !Array.isArray(data.data) && (data.data as any).users) {
            return (data.data as any).users;
        }

        return (data.data as User[]) || [];
    } catch (err) {
        console.error("Error fetching users:", err);
        return [];
    }
}

/**
 * Get current user profile (me)
 */
export async function getMe(): Promise<UserProfile | null> {
    try {
        const res = await fetchWithAuth(`${apiUrl}/users/me`, {
            ...jsonFetchOptions("GET"),
        });

        const data: ApiResponse<UserProfile> & { data?: UserProfile } = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.message || "Failed to fetch current user");
        }

        return data.data || null;
    } catch (err) {
        console.error("Error fetching current user:", err);
        return null;
    }
}

/**
 * Get current user (new endpoint)
 */
export async function getCurrentUser(skipAutoErrorHandling: boolean = false): Promise<UserProfile | null> {
    try {
        const res = await fetchWithAuth(`${apiUrl}/users/current`, {
            ...jsonFetchOptions("GET"),
            skipAutoErrorHandling,
        });

        const data: ApiResponse<UserProfile> & { data?: UserProfile } = await res.json();

        if (!res.ok || !data.success) {
            if (res.status === 401 && skipAutoErrorHandling) {
                return null;
            }
            throw new Error(data.message || "Failed to fetch current user");
        }
        return data.data || null;
    } catch (err) {
        console.error("Error fetching current user:", err);
        return null;
    }
}

/**
 * Get user profile by ID
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
        const res = await fetchWithAuth(`${apiUrl}/users/${userId}/profile`, {
            ...jsonFetchOptions("GET"),
        });

        const data: ApiResponse<UserProfile> & { data?: UserProfile } = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.message || "Failed to fetch user profile");
        }
        return data.data || null;
    } catch (err) {
        console.error("Error fetching user profile:", err);
        return null;
    }
}

/**
 * Get user profile by username
 */
export async function getUserByUsername(username: string): Promise<UserProfile | null> {
    try {
        const res = await fetchWithAuth(`${apiUrl}/users/username/${username}`, {
            ...jsonFetchOptions("GET"),
        });

        const data: ApiResponse<UserProfile> & { data?: UserProfile } = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.message || "Failed to fetch user profile");
        }

        return data.data || null;
    } catch (err) {
        console.error("Error fetching user profile by username:", err);
        return null;
    }
}

/**
 * Get followers for a user
 */
export async function getFollowers(userId: string, page = 1, limit = 20): Promise<User[]> {
    try {
        const res = await fetchWithAuth(`${apiUrl}/users/${userId}/followers?page=${page}&limit=${limit}`, {
            ...jsonFetchOptions("GET"),
        });

        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || "Failed to fetch followers");
        return data.data || [];
    } catch (err) {
        console.error("Error fetching followers:", err);
        return [];
    }
}

/**
 * Get following for a user
 */
export async function getFollowing(userId: string, page = 1, limit = 20): Promise<User[]> {
    try {
        const res = await fetchWithAuth(`${apiUrl}/users/${userId}/following?page=${page}&limit=${limit}`, {
            ...jsonFetchOptions("GET"),
        });

        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || "Failed to fetch following");
        return data.data || [];
    } catch (err) {
        console.error("Error fetching following:", err);
        return [];
    }
}

// ============================================================================
// POST - User Actions
// ============================================================================

/**
 * Follow a user
 */
export async function followUser(userId: string): Promise<boolean> {
    try {
        const res = await fetchWithAuth(`${apiUrl}/users/${userId}/follow`, {
            method: "POST",
            ...defaultFetchOptions,
        });

        const data: ApiResponse<any> = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.message || "Failed to follow user");
        }

        return true;
    } catch (err) {
        console.error(`Error following user ${userId}:`, err);
        return false;
    }
}

/**
 * Unfollow a user
 */
export async function unfollowUser(userId: string): Promise<boolean> {
    try {
        const res = await fetchWithAuth(`${apiUrl}/users/${userId}/follow`, {
            method: "DELETE",
            ...defaultFetchOptions,
        });

        const data: ApiResponse<any> = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.message || "Failed to unfollow user");
        }

        return true;
    } catch (err) {
        console.error(`Error unfollowing user ${userId}:`, err);
        return false;
    }
}

// ============================================================================
// PUT - Update User Profile
// ============================================================================

/**
 * Update user profile picture
 */
export async function updateUserProfilePicture(images: string[]): Promise<ApiResponse<any>> {
    try {
        const res = await fetchWithAuth(`${apiUrl}/users/profile-picture`, {
            ...jsonFetchOptions("PUT", { images }),
        });

        const data: ApiResponse<any> = await res.json();

        if (!res.ok) throw new Error(data.message || "Failed to update profile picture");

        return data;
    } catch (err) {
        console.error("Error updating profile picture:", err);
        throw err;
    }
}

/**
 * Update user profile payload
 */
export interface UpdateUserProfilePayload {
    displayName?: string;
    bio?: string;
    website?: string;
    location?: string;
    isPrivate?: boolean;
    gender?: string;
    birthDate?: string; // YYYY-MM-DD
    safeMode?: number; // 0, 1, 2
}

/**
 * Update user profile
 */
export async function updateUserProfile(payload: UpdateUserProfilePayload): Promise<ApiResponse<any>> {
    try {
        const res = await fetchWithAuth(`${apiUrl}/users/profile`, {
            ...jsonFetchOptions("PUT", payload),
        });

        const data: ApiResponse<any> = await res.json();

        if (!res.ok) throw new Error(data.message || "Failed to update profile");

        return data;
    } catch (err) {
        console.error("Error updating profile:", err);
        throw err;
    }
}

/**
 * Complete profile after email verification (first-time setup)
 */
export interface CompleteProfilePayload {
    displayName: string;
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    birthDate?: string;
}

export async function completeProfile(payload: CompleteProfilePayload): Promise<ApiResponse<any>> {
    try {
        const res = await fetchWithAuth(`${apiUrl}/users/complete-profile`, {
            ...jsonFetchOptions("POST", payload),
        });

        const data: ApiResponse<any> = await res.json();

        if (!res.ok) {
            throwApiError(data, res.status);
        }

        return data;
    } catch (err) {
        console.error("Error completing profile:", err);
        throw err;
    }
}

// ============================================================================
// DELETE - Delete User
// ============================================================================

/**
 * Delete/Deactivate user account
 */
export async function deleteUser(userId: string): Promise<boolean> {
    try {
        const res = await fetchWithAuth(`${apiUrl}/users/${userId}`, {
            method: "DELETE",
            ...defaultFetchOptions,
        });

        const data: ApiResponse<string> = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.message || "Failed to delete user");
        }

        return true;
    } catch (err) {
        console.error(`Error deleting user ${userId}:`, err);
        return false;
    }
}

/**
 * Get activity log for the current user
 */
export async function getActivityLog(page = 1, limit = 20, type?: string): Promise<any[]> {
    try {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(type ? { type } : {}),
        });

        const res = await fetchWithAuth(`${apiUrl}/users/me/activity-log?${params.toString()}`, {
            ...jsonFetchOptions("GET"),
        });

        const data: ApiResponse<any[]> = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.message || "Failed to fetch activity log");
        }

        return data.data || [];
    } catch (err) {
        console.error("Error fetching activity log:", err);
        return [];
    }
}
