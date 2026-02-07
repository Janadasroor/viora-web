import type { ApiResponse } from "@/models/ApiResponse";
import type { Notification } from "@/models/Notification";
import { apiUrl, defaultFetchOptions, jsonFetchOptions } from "../config";
import { fetchWithAuth } from "../fetchClient";

/**
 * Fetch paginated notifications
 */
export async function getNotifications(
    page: number = 1,
    limit: number = 20
): Promise<Notification[] | null> {
    try {
        const res = await fetchWithAuth(
            `${apiUrl}/notifications?page=${page}&limit=${limit}`,
            { ...defaultFetchOptions }
        );
        const data: ApiResponse<Notification[]> = await res.json();
        return data.data ?? null;
    } catch (err) {
        console.error("Error fetching notifications:", err);
        return null;
    }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(): Promise<number> {
    try {
        const res = await fetchWithAuth(`${apiUrl}/notifications/unread-count`, {
            ...defaultFetchOptions,
        });
        const data: ApiResponse<any> & { count?: number } = await res.json();
        return data.count ?? 0;
    } catch (err) {
        console.error("Error fetching unread count:", err);
        return 0;
    }
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsRead(
    notificationId: number
): Promise<boolean> {
    try {
        const res = await fetchWithAuth(`${apiUrl}/notifications/read/${notificationId}`, {
            method: "PUT",
            ...defaultFetchOptions,
        });
        return res.ok;
    } catch (err) {
        console.error("Error marking notification as read:", err);
        return false;
    }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(): Promise<boolean> {
    try {
        const res = await fetchWithAuth(`${apiUrl}/notifications/read-all`, {
            method: "PUT",
            ...defaultFetchOptions,
        });
        return res.ok;
    } catch (err) {
        console.error("Error marking all notifications as read:", err);
        return false;
    }
}

/**
 * Delete a notification
 */
export async function deleteNotification(
    notificationId: number
): Promise<boolean> {
    try {
        const res = await fetchWithAuth(`${apiUrl}/notifications/${notificationId}`, {
            method: "DELETE",
            ...defaultFetchOptions,
        });
        return res.ok;
    } catch (err) {
        console.error("Error deleting notification:", err);
        return false;
    }
}

/**
 * Delete all notifications
 */
export async function deleteAllNotifications(): Promise<boolean> {
    try {
        const res = await fetchWithAuth(`${apiUrl}/notifications`, {
            method: "DELETE",
            ...defaultFetchOptions,
        });
        return res.ok;
    } catch (err) {
        console.error("Error deleting all notifications:", err);
        return false;
    }
}

/**
 * Update FCM token for push notifications
 */
export async function updateFcmToken(userId: string, token: string): Promise<boolean> {
    try {
        const res = await fetchWithAuth(`${apiUrl}/notifications/fcm-token`, {
            ...jsonFetchOptions("POST", { userId, token }),
        });
        return res.ok;
    } catch (err) {
        console.error("Error updating FCM token:", err);
        return false;
    }
}


