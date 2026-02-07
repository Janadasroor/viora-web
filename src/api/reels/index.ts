import type { ReelWithUser } from "@/types/api/reel.types";
import { apiUrl, jsonFetchOptions, defaultFetchOptions } from "../config";
import { fetchWithAuth } from "../fetchClient";


/**
 * Like a reel
 */
export async function apiLikeReel(reelId: string): Promise<boolean> {
    try {
        const res = await fetchWithAuth(`${apiUrl}/interactions/reels/${reelId}/like`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            ...defaultFetchOptions,
        });

        if (!res.ok) {
            throw new Error(`Server error: ${res.status}`);
        }

        const data = await res.json();

        if (!data.success) {
            throw new Error(data.message || "Invalid API response");
        }

        return data.success;
    } catch (err) {
        console.error("Error liking reel:", err);
        return false;
    }
}

/**
 * Unlike a reel
 */
export async function apiUnlikeReel(reelId: string): Promise<boolean> {
    try {
        const res = await fetchWithAuth(`${apiUrl}/interactions/reels/${reelId}/like`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            ...defaultFetchOptions,
        });

        if (!res.ok) {
            throw new Error(`Server error: ${res.status}`);
        }

        const data = await res.json();

        if (!data.success) {
            throw new Error(data.message || "Invalid API response");
        }

        return data.success;
    } catch (err) {
        console.error("Error unliking reel:", err);
        return false;
    }
}

/**
 * Get reels feed
 */
export async function getReelsFeed(page: number = 1, limit: number = 10): Promise<ReelWithUser[]> {
    try {
        const res = await fetchWithAuth(`${apiUrl}/reels/feed?page=${page}&limit=${limit}`, {
            ...jsonFetchOptions("GET"),
        });

        if (!res.ok) {
            throw new Error(`Server error: ${res.status}`);
        }

        const data = await res.json();

        if (!data.success || !Array.isArray(data.reels)) {
            throw new Error(data.message || "Invalid API response");
        }

        return data.reels;
    } catch (err) {
        console.error("Error fetching reels feed:", err);
        return [];
    }
}

/**
 * Get single reel by ID
 */
export async function getReelById(reelId: string): Promise<ReelWithUser | null> {
    try {
        const res = await fetchWithAuth(`${apiUrl}/reels/${reelId}`, {
            ...jsonFetchOptions("GET"),
        });

        if (!res.ok) {
            throw new Error(`Server error: ${res.status}`);
        }

        const data = await res.json();

        if (!data.success || !data.reel) {
            throw new Error(data.message || "Invalid API response");
        }

        return data.reel;
    } catch (err) {
        console.error("Error fetching reel by ID:", err);
        return null;
    }
}

/**
 * Get reels by user ID
 */
export async function getUserReels(userId: string, page: number = 1, limit: number = 20): Promise<ReelWithUser[]> {
    try {
        const res = await fetchWithAuth(`${apiUrl}/reels/user/${userId}?page=${page}&limit=${limit}`, {
            ...jsonFetchOptions("GET"),
        });

        if (!res.ok) {
            throw new Error(`Server error: ${res.status}`);
        }

        const data = await res.json();

        if (!data.success || !Array.isArray(data.reels)) {
            throw new Error(data.message || "Invalid API response");
        }

        return data.reels;
    } catch (err) {
        console.error("Error fetching user reels:", err);
        return [];
    }
}

/**
 * Increment reel views
 */
export async function apiIncrementReelViews(reelId: string, watchTime?: number, duration?: number): Promise<boolean> {
    try {
        const res = await fetchWithAuth(`${apiUrl}/reels/${reelId}/view`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ watchTime, duration }),
            ...defaultFetchOptions,
        });

        if (!res.ok) {
            throw new Error(`Server error: ${res.status}`);
        }

        const data = await res.json();

        if (!data.success) {
            throw new Error(data.message || "Invalid API response");
        }

        return data.success;
    } catch (err) {
        console.error("Error incrementing reel views:", err);
        return false;
    }
}


/**
 * Create reel payload
 */
export interface CreateReelPayload {
    caption?: string;
    mediaId: string; // UUID
    visibility?: 'public' | 'private' | 'friends';
    status?: string;
}

/**
 * Create a new reel
 */
export async function createReel(payload: CreateReelPayload): Promise<ReelWithUser | null> {
    try {
        const res = await fetchWithAuth(`${apiUrl}/reels`, {
            ...jsonFetchOptions("POST", payload),
        });

        if (!res.ok) {
            throw new Error(`Server error: ${res.status}`);
        }

        const data = await res.json();

        if (!data.success || !data.reel) {
            throw new Error(data.message || "Failed to create reel");
        }

        return data.reel;
    } catch (err) {
        console.error("Error creating reel:", err);
        return null;
    }
}

/**
 * Delete a reel
 */
export async function deleteReel(reelId: string): Promise<boolean> {
    try {
        const res = await fetchWithAuth(`${apiUrl}/reels/${reelId}`, {
            ...jsonFetchOptions("DELETE"),
        });

        if (!res.ok) {
            throw new Error(`Server error: ${res.status}`);
        }

        const data = await res.json();

        if (!data.success) {
            throw new Error(data.message || "Failed to delete reel");
        }

        return true;
    } catch (err) {
        console.error("Error deleting reel:", err);
        return false;
    }
}

/**
 * Update reel caption
 */
export async function updateReel(reelId: string, caption: string): Promise<ReelWithUser | null> {
    try {
        const res = await fetchWithAuth(`${apiUrl}/reels/${reelId}`, {
            ...jsonFetchOptions("PUT", { caption }),
        });

        if (!res.ok) {
            throw new Error(`Server error: ${res.status}`);
        }

        const data = await res.json();

        if (!data.success || !data.reel) {
            throw new Error(data.message || "Failed to update reel");
        }

        return data.reel;
    } catch (err) {
        console.error("Error updating reel:", err);
        return null;
    }
}
