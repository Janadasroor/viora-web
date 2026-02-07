import type { Story, StoryData, StoryView } from "@/types/api/story.types";
import type { ApiResponse } from "@/models/ApiResponse";
import { apiUrl, jsonFetchOptions, defaultFetchOptions } from "../config";
import { fetchWithAuth } from "../fetchClient";



/**
 * Like a story
 */
export async function likeStory(storyId: string): Promise<boolean> {
    try {
        const res = await fetchWithAuth(`${apiUrl}/interactions/stories/${storyId}/like`, {
            ...jsonFetchOptions("POST", {}),
        });

        const data: ApiResponse<string> = await res.json();
        return data.success;
    } catch (err) {
        console.error(`Error liking story ${storyId}:`, err);
        return false;
    }
}

/**
 * Unlike a story
 */
export async function unlikeStory(storyId: string): Promise<boolean> {
    try {
        const res = await fetchWithAuth(`${apiUrl}/interactions/stories/${storyId}/like`, {
            ...jsonFetchOptions("DELETE", {}),
        });

        const data: ApiResponse<string> = await res.json();
        return data.success;
    } catch (err) {
        console.error(`Error unliking story ${storyId}:`, err);
        return false;
    }
}


/**
 * Get user's own stories
 */
export async function getStories(page: number = 1, limit: number = 20): Promise<Story[]> {
    try {
        const res = await fetchWithAuth(`${apiUrl}/stories?page=${page}&limit=${limit}`, {
            ...jsonFetchOptions("GET"),
        });

        if (!res.ok) throw new Error(`Server error: ${res.status}`);

        const data: ApiResponse<Story[]> = await res.json();

        if (!data.success || !Array.isArray(data.data)) {
            throw new Error(data.message || "Invalid API response");
        }

        return data.data;
    } catch (err) {
        console.error("Error fetching stories:", err);
        return [];
    }
}

/**
 * Get a single story by ID
 */
export async function getStory(storyId: string): Promise<Story | null> {
    try {
        const res = await fetchWithAuth(`${apiUrl}/stories/${storyId}`, {
            ...jsonFetchOptions("GET"),
        });

        if (!res.ok) throw new Error(`Server error: ${res.status}`);

        const data: ApiResponse<Story> = await res.json();

        if (!data.success || !data.data) {
            throw new Error(data.message || "Invalid API response");
        }

        return data.data;
    } catch (err) {
        console.error(`Error fetching story ${storyId}:`, err);
        return null;
    }
}

/**
 * Get stories from users you follow
 */
export async function getFollowingStories(page: number = 1, limit: number = 20): Promise<Story[]> {
    try {
        const res = await fetchWithAuth(`${apiUrl}/stories/following?page=${page}&limit=${limit}`, {
            ...jsonFetchOptions("GET"),
        });

        if (!res.ok) throw new Error(`Server error: ${res.status}`);

        const data: ApiResponse<Story[]> = await res.json();

        if (!data.success || !Array.isArray(data.data)) {
            throw new Error(data.message || "Invalid API response");
        }

        return data.data;
    } catch (err) {
        console.error("Error fetching following stories:", err);
        return [];
    }
}

/**
 * Get viewers of a specific story
 */
export async function getStoryViews(
    storyId: string,
    page: number = 1,
    limit: number = 20
): Promise<StoryView[]> {
    try {
        const res = await fetchWithAuth(`${apiUrl}/stories/${storyId}/views?page=${page}&limit=${limit}`, {
            ...jsonFetchOptions("GET"),
        });

        if (!res.ok) throw new Error(`Server error: ${res.status}`);

        const data: ApiResponse<StoryView[]> = await res.json();

        if (!data.success || !Array.isArray(data.data)) {
            throw new Error(data.message || "Invalid API response");
        }

        return data.data;
    } catch (err) {
        console.error(`Error fetching story views for story ${storyId}:`, err);
        return [];
    }
}

/**
 * Create story response interface
 */
export interface CreateStoryResponse {
    story: Story;
    message: string;
}

/**
 * Create a new story
 */
export async function createStory(storyData: StoryData): Promise<CreateStoryResponse | null> {
    try {
        const res = await fetchWithAuth(`${apiUrl}/stories`, {
            ...jsonFetchOptions("POST", storyData),
        });

        if (!res.ok) throw new Error(`Server error: ${res.status}`);

        const data: ApiResponse<Story> & { data?: Story } = await res.json();

        if (!data.success || !data.data) {
            throw new Error(data.message || "Failed to create story");
        }

        return {
            story: data.data,
            message: data.message || "Story created successfully",
        };
    } catch (err) {
        console.error("Error creating story:", err);
        return null;
    }
}

/**
 * Delete a story
 */
export async function deleteStory(storyId: string): Promise<boolean> {
    try {
        const res = await fetchWithAuth(`${apiUrl}/stories/${storyId}`, {
            method: "DELETE",
            ...defaultFetchOptions,
        });

        if (!res.ok) throw new Error(`Server error: ${res.status}`);

        const data: ApiResponse<string> = await res.json();

        if (!data.success) {
            throw new Error(data.message || "Failed to delete story");
        }

        return true;
    } catch (err) {
        console.error(`Error deleting story ${storyId}:`, err);
        return false;
    }
}

/**
 * Update a story
 */
export async function updateStory(storyId: string, updates: Partial<StoryData>): Promise<Story | null> {
    try {
        const res = await fetchWithAuth(`${apiUrl}/stories/${storyId}`, {
            ...jsonFetchOptions("PUT", updates),
        });

        if (!res.ok) throw new Error(`Server error: ${res.status}`);

        const data: ApiResponse<Story> = await res.json();

        if (!data.success || !data.data) {
            throw new Error(data.message || "Failed to update story");
        }

        return data.data;
    } catch (err) {
        console.error(`Error updating story ${storyId}:`, err);
        return null;
    }
}
