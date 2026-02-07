import type { ApiResponse } from "@/models/ApiResponse";
import type { LikeRequest, SavePostRequest } from "@/models/PostInteractions";
import { apiUrl, jsonFetchOptions, defaultFetchOptions } from "../config";
import { fetchWithAuth } from "../fetchClient";

/**
 * Post interactions API class
 */
class PostInteractions {
    /**
     * Like a post
     */
    async likePost(
        postId: string,
        request: LikeRequest = { reactionType: "like" }
    ): Promise<boolean> {
        try {
            const res = await fetchWithAuth(`${apiUrl}/interactions/posts/${postId}/like`, {
                ...jsonFetchOptions("POST", request),
            });

            const data: ApiResponse<string> = await res.json();
            return data.success;
        } catch (err) {
            console.error("Error liking post:", err);
            return false;
        }
    }

    /**
     * Unlike a post
     */
    async unlikePost(postId: string): Promise<boolean> {
        try {
            const res = await fetchWithAuth(`${apiUrl}/interactions/posts/${postId}/like`, {
                method: "DELETE",
                ...defaultFetchOptions,
            });

            const data: ApiResponse<string> = await res.json();
            return data.success;
        } catch (err) {
            console.error("Error unliking post:", err);
            return false;
        }
    }

    /**
     * Share a post
     */
    async sharePost(postId: string): Promise<boolean> {
        try {
            const res = await fetchWithAuth(`${apiUrl}/interactions/posts/${postId}/share`, {
                method: "POST",
                ...defaultFetchOptions,
            });

            const data: ApiResponse<string> = await res.json();
            return data.success;
        } catch (err) {
            console.error("Error sharing post:", err);
            return false;
        }
    }

    /**
     * Save a post
     */
    async savePost(
        postId: string,
        request: SavePostRequest = {}
    ): Promise<boolean> {
        try {
            const res = await fetchWithAuth(`${apiUrl}/posts/${postId}/save`, {
                ...jsonFetchOptions("POST", request),
            });

            const data: ApiResponse<string> = await res.json();
            return data.success;
        } catch (err) {
            console.error("Error saving post:", err);
            return false;
        }
    }

    /**
     * Unsave a post
     */
    async unsavePost(postId: string): Promise<boolean> {
        try {
            const res = await fetchWithAuth(`${apiUrl}/posts/${postId}/unsave`, {
                method: "POST",
                ...defaultFetchOptions,
            });

            const data: ApiResponse<string> = await res.json();
            return data.success;
        } catch (err) {
            console.error("Error unsaving post:", err);
            return false;
        }
    }
}

export const postInteractionsApi = new PostInteractions();
