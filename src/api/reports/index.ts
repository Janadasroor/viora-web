import { fetchWithAuth } from "../fetchClient";
import { apiUrl, jsonFetchOptions } from "../config";

export interface ReportPayload {
    reportedUserId?: string;
    targetType: 'post' | 'comment' | 'story' | 'user' | 'reel'
    targetId: string;
    reportCategory: string;
    description?: string;
}

/**
 * Submit a content report
 */
export async function submitReport(payload: ReportPayload): Promise<boolean> {
    try {
        const res = await fetchWithAuth(`${apiUrl}/reports`, {
            ...jsonFetchOptions("POST", payload),
        });
        return res.ok;
    } catch (err) {
        console.error("Error submitting report:", err);
        return false;
    }
}
