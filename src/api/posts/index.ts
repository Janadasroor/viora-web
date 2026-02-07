import type { Post } from "@/models/Post";
import type { ApiResponse } from "@/models/ApiResponse";
import type {
    CreatePostRequest,
    CreatePostResponse,
    UpdatePostRequest,
} from "@/models/PostRequests";
import { SavedPost } from "@/models/SavedPost";
import { apiUrl, jsonFetchOptions, defaultFetchOptions } from "../config";
import { fetchWithAuth } from "../fetchClient";

// ============================================================================
// GET - Fetch Posts
// ============================================================================

export async function getPosts(
    page: number = 1,
    limit: number = 20,
    userId?: string,
    hashtag?: string,
    type?: string
): Promise<Post[]> {
    try {
        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(userId ? { userId: userId.toString() } : {}),
            ...(hashtag ? { hashtag } : {}),
            ...(type ? { type } : {}),
        });

        const res = await fetchWithAuth(`${apiUrl}/posts?${queryParams.toString()}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            ...defaultFetchOptions,
        });

        if (!res.ok) throw new Error(`Server error: ${res.status}`);

        const data: ApiResponse<Post[]> = await res.json();

        if (!data.success || !Array.isArray(data.data)) {
            throw new Error(data.message || "Invalid API response");
        }
        return data.data;
    } catch (err) {
        console.error("Error fetching posts:", err);
        return [];
    }
}

/**
 * Fetch a specific post by its ID.
 * Mirrors Kotlin:
 *  @GET("/posts/by/{postId}")
 *  suspend fun getPostById(@Path("postId") postId): ApiResponse<Post>
 */
export async function getPostById(postId: string): Promise<Post | null> {
    try {
        const res = await fetchWithAuth(`${apiUrl}/posts/by/${postId}`, {
            ...jsonFetchOptions("GET"),
        });

        if (!res.ok) throw new Error(`Server error: ${res.status}`);

        const data: ApiResponse<Post> = await res.json();

        if (!data.success || !data.data) {
            throw new Error(data.message || "Invalid API response");
        }

        return data.data;
    } catch (err) {
        console.error(`Error fetching post ${postId}:`, err);
        return null;
    }
}

/**
 * Get saved posts
 */
export async function getSavedPosts(
    collectionId?: number,
    limit: number = 20,
    offset: number = 0
): Promise<SavedPost[]> {
    try {
        const params = new URLSearchParams();
        if (collectionId) params.append("collectionId", String(collectionId));
        params.append("limit", String(limit));
        params.append("offset", String(offset));

        const res = await fetchWithAuth(`${apiUrl}/posts/saved?${params.toString()}`, {
            method: "GET",
            ...defaultFetchOptions,
        });

        const data: ApiResponse<SavedPost[]> = await res.json();

        if (!data.success || !Array.isArray(data.data)) {
            throw new Error(data.message || "Invalid saved posts response");
        }

        return data.data;
    } catch (err) {
        console.error("Error fetching saved posts:", err);
        return [];
    }
}
/**
 * Save a post
 */
export async function savePost(postId: string, collectionId?: number): Promise<boolean> {
    try {
        const body = collectionId ? { collectionId } : {};
        const res = await fetchWithAuth(`${apiUrl}/posts/${postId}/save`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...defaultFetchOptions.headers,
            },
            body: JSON.stringify(body),
            ...defaultFetchOptions,
        });

        if (!res.ok) throw new Error(`Server error: ${res.status}`);

        const data: ApiResponse<string> = await res.json();

        if (!data.success) {
            throw new Error(data.message || "Failed to save post");
        }

        return true;
    } catch (err) {
        console.error(`Error saving post ${postId}:`, err);
        return false;
    }
}

/**
 * Remove saved post
 */
export async function removeSavedPost(postId: string): Promise<boolean> {
    try {
        const res = await fetchWithAuth(`${apiUrl}/posts/${postId}/save`, {
            method: "DELETE",
            ...defaultFetchOptions,
        });

        if (!res.ok) throw new Error(`Server error: ${res.status}`);

        const data: ApiResponse<string> = await res.json();

        if (!data.success) {
            throw new Error(data.message || "Failed to remove saved post");
        }

        return true;
    } catch (err) {
        console.error(`Error removing saved post ${postId}:`, err);
        return false;
    }
}

/**
 * Share a post
 */
export async function sharePost(postId: string): Promise<boolean> {
    try {
        const res = await fetchWithAuth(`${apiUrl}/posts/${postId}/share`, {
            method: "POST",
            ...defaultFetchOptions,
        });

        if (!res.ok) throw new Error(`Server error: ${res.status}`);

        const data: ApiResponse<string> = await res.json();

        if (!data.success) {
            throw new Error(data.message || "Failed to share post");
        }

        return true;
    } catch (err) {
        console.error(`Error sharing post ${postId}:`, err);
        return false;
    }
}

/**
 * Unshare a post
 */
export async function unsharePost(postId: string): Promise<boolean> {
    try {
        const res = await fetchWithAuth(`${apiUrl}/posts/${postId}/share`, {
            method: "DELETE",
            ...defaultFetchOptions,
        });

        if (!res.ok) throw new Error(`Server error: ${res.status}`);

        const data: ApiResponse<string> = await res.json();

        if (!data.success) {
            throw new Error(data.message || "Failed to unshare post");
        }

        return true;
    } catch (err) {
        console.error(`Error unsharing post ${postId}:`, err);
        return false;
    }
}

// ============================================================================
// POST - Create Post
// ============================================================================

export async function createPost(
    request: CreatePostRequest
): Promise<CreatePostResponse | null> {
    try {
        const res = await fetchWithAuth(`${apiUrl}/posts`, {
            ...jsonFetchOptions("POST", request),
        });

        if (!res.ok) throw new Error(`Server error: ${res.status}`);

        const data: ApiResponse<CreatePostResponse> = await res.json();

        if (!data.success || !data.data) {
            throw new Error(data.message || "Failed to create post");
        }

        return data.data;
    } catch (err) {
        console.error("Error creating post:", err);
        return null;
    }
}

// ============================================================================
// PUT - Update Post
// ============================================================================

export async function updatePost(
    postId: string,
    request: UpdatePostRequest
): Promise<boolean> {
    try {
        const res = await fetchWithAuth(`${apiUrl}/posts/${postId}`, {
            ...jsonFetchOptions("PUT", request),
        });

        if (!res.ok) throw new Error(`Server error: ${res.status}`);

        const data: ApiResponse<string> = await res.json();

        if (!data.success) {
            throw new Error(data.message || "Failed to update post");
        }

        return true;
    } catch (err) {
        console.error(`Error updating post ${postId}:`, err);
        return false;
    }
}

// ============================================================================
// DELETE - Delete Post
// ============================================================================

export async function deletePost(postId: string): Promise<boolean> {
    try {
        const res = await fetchWithAuth(`${apiUrl}/posts/${postId}`, {
            method: "DELETE",
            ...defaultFetchOptions,
        });

        if (!res.ok) throw new Error(`Server error: ${res.status}`);

        const data: ApiResponse<string> = await res.json();

        if (!data.success) {
            throw new Error(data.message || "Failed to delete post");
        }

        return true;
    } catch (err) {
        console.error(`Error deleting post ${postId}:`, err);
        return false;
    }
}
