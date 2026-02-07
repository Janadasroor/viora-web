import type { Post } from "@/models/Post";
import { apiUrl, jsonFetchOptions } from "../config";
import { fetchWithAuth } from "../fetchClient";

/**
 * Get feed posts
 */
export async function getFeedPosts(page: number = 1, limit: number = 10, safeMode: number = 1): Promise<{ data: Post[], hasMore: boolean }> {
    try {
        const res = await fetchWithAuth(`${apiUrl}/feed/posts?page=${page}&limit=${limit}&safeMode=${safeMode}`, {
            ...jsonFetchOptions("GET"),
        });

        if (!res.ok) {
            throw new Error(`Server error: ${res.status}`);
        }

        const data = await res.json();

        if (!data.success || !Array.isArray(data.data)) {
            throw new Error(data.message || "Invalid API response");
        }

        return {
            data: data.data,
            hasMore: data.pagination?.hasMore ?? false
        };
    } catch (err) {
        console.error("Error fetching feed:", err);
        return { data: [], hasMore: false };
    }
}

/**
 * Fetch suggested posts
 */
export async function getSuggestedPosts(page: number = 1, limit: number = 20, safeMode: number = 1): Promise<{ data: Post[], hasMore: boolean }> {
    try {
        const res = await fetchWithAuth(`${apiUrl}/feed/posts/suggested?page=${page}&limit=${limit}&safeMode=${safeMode}`, {
            ...jsonFetchOptions("GET"),
        });

        if (!res.ok) throw new Error(`Server error: ${res.status}`);

        const data = await res.json();

        if (!data.success || !Array.isArray(data.data)) {
            throw new Error(data.message || "Invalid API response");
        }

        return {
            data: data.data,
            hasMore: data.pagination?.hasMore ?? false
        };
    } catch (err) {
        console.error("Error fetching suggested posts:", err);
        return { data: [], hasMore: false };
    }
}

/**
 * Fetch trending posts
 */
export async function getTrendingPosts(
    page: number = 1,
    limit: number = 20,
    timeRange?: string,
    cursor?: string
): Promise<{ data: Post[], hasMore: boolean, nextCursor?: string }> {
    try {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(timeRange ? { timeRange } : {}),
            ...(cursor ? { cursor } : {}),
        });

        const res = await fetchWithAuth(`${apiUrl}/feed/posts/trending?${params.toString()}`, {
            ...jsonFetchOptions("GET"),
        });

        if (!res.ok) throw new Error(`Server error: ${res.status}`);

        const data = await res.json();

        if (!data.success || !Array.isArray(data.data)) {
            throw new Error(data.message || "Invalid API response");
        }

        return {
            data: data.data,
            hasMore: data.pagination?.hasMore ?? false,
            nextCursor: data.pagination?.nextCursor
        };
    } catch (err) {
        console.error("Error fetching trending posts:", err);
        return { data: [], hasMore: false };
    }
}

/**
 * Hashtag interface
 */
export interface TrendingHashtag {
    hashtag: string;
    postCount: number;
    samplePosts?: Post[];
}

/**
 * Fetch trending hashtags
 */
export async function getTrendingHashtags(
    limit: number = 10,
    timeRange?: string
): Promise<TrendingHashtag[]> {
    try {
        const params = new URLSearchParams({
            limit: limit.toString(),
            ...(timeRange ? { timeRange } : {}),
        });

        const res = await fetchWithAuth(`${apiUrl}/feed/trending/hashtags?${params.toString()}`, {
            ...jsonFetchOptions("GET"),
        });

        if (!res.ok) throw new Error(`Server error: ${res.status}`);

        const data = await res.json();

        if (!data.success || !Array.isArray(data.data)) {
            throw new Error(data.message || "Invalid API response");
        }

        return data.data;
    } catch (err) {
        console.error("Error fetching trending hashtags:", err);
        return [];
    }
}

/**
 * Fetch posts by hashtag
 */
export async function getPostsByHashtag(
    hashtag: string,
    page: number = 1,
    limit: number = 20,
    sortBy?: string,
    cursor?: string
): Promise<{ data: Post[], hasMore: boolean, nextCursor?: string }> {
    try {
        const params = new URLSearchParams({
            hashtag,
            page: page.toString(),
            limit: limit.toString(),
            ...(sortBy ? { sortBy } : {}),
            ...(cursor ? { cursor } : {}),
        });

        const res = await fetchWithAuth(`${apiUrl}/feed/posts/hashtag/${encodeURIComponent(hashtag)}?${params.toString()}`, {
            ...jsonFetchOptions("GET"),
        });

        if (!res.ok) throw new Error(`Server error: ${res.status}`);

        const data = await res.json();

        if (!data.success || !Array.isArray(data.data)) {
            throw new Error(data.message || "Invalid API response");
        }

        return {
            data: data.data,
            hasMore: data.pagination?.hasMore ?? false,
            nextCursor: data.pagination?.nextCursor
        };
    } catch (err) {
        console.error(`Error fetching posts by hashtag "${hashtag}":`, err);
        return { data: [], hasMore: false };
    }
}

/**
 * Record interest in a post
 */
export async function recordPostInterested(postId: string): Promise<boolean> {
    try {
        const res = await fetchWithAuth(`${apiUrl}/interactions/posts/${postId}/interested`, {
            ...jsonFetchOptions("POST"),
        });
        return res.ok;
    } catch (err) {
        console.error("Error recording post interest:", err);
        return false;
    }
}

/**
 * Record disinterest in a post
 */
export async function recordPostNotInterested(postId: string): Promise<boolean> {
    try {
        const res = await fetchWithAuth(`${apiUrl}/interactions/posts/${postId}/not-interested`, {
            ...jsonFetchOptions("POST"),
        });
        return res.ok;
    } catch (err) {
        console.error("Error recording post disinterest:", err);
        return false;
    }
}
