import { fetchWithAuth } from "./fetchClient";
import type { ApiResponse } from "@/models/ApiResponse";

export interface ProfileStats {
    [day: string]: {
        profile_visit?: number;
        follow?: number;
        unfollow?: number;
        link_click?: number;
    };
}

/**
 * Fetch profile analytics for the creator dashboard
 */
export const getProfileAnalytics = async (userId: string, days: number = 7): Promise<ProfileStats> => {
    try {
        const response = await fetchWithAuth(`/analytics/profile/${userId}?days=${days}`);
        const data: ApiResponse<ProfileStats> = await response.json();
        if (response.ok && data.success) {
            return data.data;
        }
        return {};
    } catch (error) {
        console.error("Error fetching profile analytics:", error);
        return {};
    }
};

/**
 * Send content watch heartbeat
 */
export const trackWatchHeartbeat = async (contentId: string, duration: number, deviceType: string = 'web') => {
    try {
        await fetchWithAuth(`/analytics/watch`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ contentId, duration, deviceType })
        });
    } catch (error) {
        console.error("Error tracking watch heartbeat:", error);
    }
};

/**
 * Send user heartbeat (app usage)
 */
export const trackHeartbeat = async (duration: number, type: 'active_time' | 'watch_time' = 'active_time') => {
    try {
        await fetchWithAuth(`/analytics/heartbeat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ duration, type })
        });
    } catch (error) {
        console.error("Error tracking heartbeat:", error);
    }
}

/**
 * Get aggregated usage statistics for the current user
 */
export const getUsageStats = async (): Promise<{ activeTime: number; watchTime: number }> => {
    try {
        const response = await fetchWithAuth(`/analytics/usage`);
        const data: ApiResponse<{ activeTime: number; watchTime: number }> = await response.json();
        if (response.ok && data.success) {
            return data.data;
        }
        return { activeTime: 0, watchTime: 0 };
    } catch (error) {
        console.error("Error fetching usage stats:", error);
        return { activeTime: 0, watchTime: 0 };
    }
}
