import type {
    SearchedUser,
    SearchedLocation,
    SearchedHashtag,
    SearchPostsResponse,
    SearchUsersResponse,
    SearchHashtagsResponse,
    UnifiedSearch,
} from "@/models/SearchResponses";
import type { ApiResponse } from "@/models/ApiResponse";
import { apiUrl, defaultFetchOptions } from "../config";
import { fetchWithAuth } from "../fetchClient";

/**
 * Suggestion type for autocomplete
 */
export type SuggestionType = "all" | "users" | "hashtags" | "locations";

/**
 * Search suggestion interface
 */
export interface SearchSuggestion {
    type: string;
    value: string;
    label: string;
    metadata?: any;
}

/**
 * Search posts with optional sorting
 */
export async function searchPosts(
    query: string,
    page: number = 1,
    limit: number = 20,
    sortBy: "relevance" | "recent" | "popular" = "relevance",
    cursor?: string
): Promise<SearchPostsResponse | null> {
    try {
        const params = new URLSearchParams({
            query: encodeURIComponent(query),
            page: page.toString(),
            limit: limit.toString(),
            sortBy,
        });
        if (cursor) params.append("cursor", cursor);

        const res = await fetchWithAuth(
            `${apiUrl}/search/posts?${params.toString()}`,
            { ...defaultFetchOptions }
        );
        const data: ApiResponse<SearchPostsResponse> = await res.json();
        return data.data ?? null;
    } catch (err) {
        console.error("Error searching posts:", err);
        return null;
    }
}

/**
 * Search users
 */
export async function searchUsers(
    query: string,
    page: number = 1,
    limit: number = 20,
    cursor?: string
): Promise<SearchUsersResponse | null> {
    try {
        const params = new URLSearchParams({
            query: encodeURIComponent(query),
            page: page.toString(),
            limit: limit.toString(),
        });
        if (cursor) params.append("cursor", cursor);

        const res = await fetchWithAuth(
            `${apiUrl}/search/users?${params.toString()}`,
            { ...defaultFetchOptions }
        );
        const data: SearchUsersResponse = await res.json();
        return data ?? null;
    } catch (err) {
        console.error("Error searching users:", err);
        return null;
    }
}

/**
 * Search locations
 */
export async function searchLocations(
    query: string,
    page: number = 1,
    limit: number = 20,
    cursor?: string
): Promise<SearchedLocation | null> {
    try {
        const params = new URLSearchParams({
            query: encodeURIComponent(query),
            page: page.toString(),
            limit: limit.toString(),
        });
        if (cursor) params.append("cursor", cursor);

        const res = await fetchWithAuth(
            `${apiUrl}/search/locations?${params.toString()}`,
            { ...defaultFetchOptions }
        );
        const data: ApiResponse<SearchedLocation> = await res.json();
        return data.data ?? null;
    } catch (err) {
        console.error("Error searching locations:", err);
        return null;
    }
}

/**
 * Search hashtags
 */
export async function searchHashtags(
    query: string,
    page: number = 1,
    limit: number = 20,
    cursor?: string
): Promise<SearchHashtagsResponse | null> {
    try {
        const params = new URLSearchParams({
            query: encodeURIComponent(query),
            page: page.toString(),
            limit: limit.toString(),
        });
        if (cursor) params.append("cursor", cursor);

        const res = await fetchWithAuth(
            `${apiUrl}/search/hashtags?${params.toString()}`,
            { ...defaultFetchOptions }
        );
        const data: SearchHashtagsResponse = await res.json();
        return data ?? null;
    } catch (err) {
        console.error("Error searching hashtags:", err);
        return null;
    }
}

/**
 * Unified search (posts, users, hashtags, locations)
 */
export async function searchUnified(
    query: string,
    page: number = 1,
    limit: number = 20,
    cursor?: string
): Promise<UnifiedSearch | null> {
    try {
        const params = new URLSearchParams({
            query: encodeURIComponent(query),
            page: page.toString(),
            limit: limit.toString(),
        });
        if (cursor) params.append("cursor", cursor);

        const res = await fetchWithAuth(
            `${apiUrl}/search?${params.toString()}`,
            { ...defaultFetchOptions }
        );
        const result: UnifiedSearch = await res.json();
        return result ?? null;
    } catch (err) {
        console.error("Error performing unified search:", err);
        return null;
    }
}

/**
 * Get search suggestions for autocomplete
 */
export async function getSearchSuggestions(
    query: string,
    type: SuggestionType = "all"
): Promise<SearchSuggestion[]> {
    try {
        const params = new URLSearchParams({
            query: encodeURIComponent(query),
            type,
        });

        const res = await fetchWithAuth(
            `${apiUrl}/search/suggestions?${params.toString()}`,
            { ...defaultFetchOptions }
        );
        const data: ApiResponse<SearchSuggestion[]> = await res.json();
        return data.data ?? [];
    } catch (err) {
        console.error("Error fetching search suggestions:", err);
        return [];
    }
}
