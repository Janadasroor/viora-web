import { Comment, CommentsResponse } from "@/models/Comment";
import type { ApiResponse } from "@/models/ApiResponse";
import { apiUrl, jsonFetchOptions, defaultFetchOptions } from "../config";
import { fetchWithAuth } from "../fetchClient";

// ============================================================================
// GET - Fetch Comments
// ============================================================================

/**
 * Get comments for a post or reel
 */
export async function getComments(
    targetId: string | number,
    targetType: "post" | "reel",
    cursor: string | null = null,
    limit: number = 20
): Promise<CommentsResponse> {
    try {
        const endpoint = `${apiUrl}/comments/${targetId}`;
        const queryParams = new URLSearchParams({
            limit: limit.toString(),
            targetType,
        });
        if (cursor) queryParams.append("cursor", cursor);

        const res = await fetchWithAuth(
            `${endpoint}?${queryParams.toString()}`,
            {
                ...jsonFetchOptions("GET"),
            }
        );

        if (!res.ok) throw new Error(`Server error: ${res.status}`);

        const data: CommentsResponse = await res.json();

        if (!data.success || !Array.isArray(data.data)) {
            throw new Error("Invalid API response");
        }

        return data;
    } catch (err) {
        console.error(`Error fetching ${targetType} comments:`, err);
        return { success: false, data: [] };
    }
}

/**
 * Get replies for a comment
 */
export async function getCommentReplies(
    commentId: string,
    cursor: string | null = null,
    limit: number = 20
): Promise<CommentsResponse> {
    try {
        const queryParams = new URLSearchParams({
            limit: limit.toString(),
        });
        if (cursor) queryParams.append("cursor", cursor);

        const res = await fetchWithAuth(
            `${apiUrl}/comments/${commentId}/replies?${queryParams.toString()}`,
            {
                ...jsonFetchOptions("GET"),
            }
        );

        if (!res.ok) throw new Error(`Server error: ${res.status}`);

        const data: CommentsResponse = await res.json();

        if (!data.success || !Array.isArray(data.data)) {
            throw new Error("Invalid API response");
        }

        return data;
    } catch (err) {
        console.error("Error fetching comment replies:", err);
        return { success: false, data: [] };
    }
}

// ============================================================================
// POST - Create Comment
// ============================================================================

export interface CreateCommentRequest {
    content: string;
    parentCommentId?: string; // optional for replies
}

export interface CreateCommentResponse {
    commentId: string; // UUID
    message: string | "";
}

/**
 * Comment on a post
 */
export async function commentPost(
    postId: string,
    request: CreateCommentRequest
): Promise<ApiResponse<CreateCommentResponse>> {
    try {
        const res = await fetchWithAuth(`${apiUrl}/comments/posts/${postId}/comments`, {
            ...jsonFetchOptions("POST", request),
        });

        const data = await res.json();
        return data;
    } catch (err) {
        console.error("Error creating comment:", err);
        return { success: false, data: { commentId: "", message: "Network error" }, message: "Network error" };
    }
}

/**
 * Comment on a reel
 */
export async function commentReel(
    reelId: string,
    request: CreateCommentRequest
): Promise<ApiResponse<CreateCommentResponse>> {
    try {
        const res = await fetchWithAuth(`${apiUrl}/comments/reels/${reelId}/comments`, {
            ...jsonFetchOptions("POST", request),
        });

        const data = await res.json();
        return data;
    } catch (err) {
        console.error("Error creating reel comment:", err);
        return { success: false, data: { commentId: "", message: "Network error" }, message: "Network error" };
    }
}

// ============================================================================
// PUT - Update Comment
// ============================================================================

export interface UpdateCommentRequest {
    content: string;
}

/**
 * Update a post comment
 */
export async function updatePostComment(
    commentId: string,
    request: UpdateCommentRequest
): Promise<ApiResponse<string>> {
    try {
        const res = await fetchWithAuth(`${apiUrl}/comments/${commentId}`, {
            ...jsonFetchOptions("PUT", request),
        });

        const data = await res.json();
        return data;
    } catch (err) {
        console.error("Error updating comment:", err);
        return { success: false, data: "Network error", message: "Network error" };
    }
}

/**
 * Update a reel comment
 */
export async function updateReelComment(
    commentId: number,
    request: UpdateCommentRequest
): Promise<ApiResponse<string>> {
    try {
        const res = await fetchWithAuth(`${apiUrl}/comments/${commentId}`, {
            ...jsonFetchOptions("PUT", request),
        });

        const data = await res.json();
        return data;
    } catch (err) {
        console.error("Error updating reel comment:", err);
        return { success: false, data: "Network error", message: "Network error" };
    }
}

// ============================================================================
// DELETE - Delete Comment
// ============================================================================

/**
 * Delete a post comment
 */
export async function deletePostComment(commentId: string): Promise<ApiResponse<string>> {
    try {
        const res = await fetchWithAuth(`${apiUrl}/comments/${commentId}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            ...defaultFetchOptions,
        });

        const data = await res.json();
        return data;
    } catch (err) {
        console.error("Error deleting comment:", err);
        return { success: false, data: "Network error", message: "Network error" };
    }
}

/**
 * Delete a reel comment
 */
export async function deleteReelComment(commentId: string): Promise<ApiResponse<string>> {
    try {
        const res = await fetchWithAuth(`${apiUrl}/comments/reels/comments/${commentId}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            ...defaultFetchOptions,
        });

        const data = await res.json();
        return data;
    } catch (err) {
        console.error("Error deleting reel comment:", err);
        return { success: false, data: "Network error", message: "Network error" };
    }
}

// ============================================================================
// Comment Interactions - Like/Unlike
// ============================================================================

export interface LikeRequest {
    userId?: string;
}

/**
 * Like a comment
 */
export async function likePostComment(
    commentId: string,
    request: LikeRequest = {}
): Promise<ApiResponse<string>> {
    try {
        const res = await fetchWithAuth(`${apiUrl}/interactions/comments/${commentId}/like`, {
            ...jsonFetchOptions("POST", request),
        });

        const data = await res.json();
        return data;
    } catch (err) {
        console.error("Error liking comment:", err);
        return { success: false, data: "Network error", message: "Network error" };
    }
}

/**
 * Unlike a comment
 */
export async function unlikePostComment(commentId: string): Promise<ApiResponse<string>> {
    try {
        const res = await fetchWithAuth(`${apiUrl}/comments/${commentId}/unlike`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            ...defaultFetchOptions,
        });

        const data = await res.json();
        return data;
    } catch (err) {
        console.error("Error unliking comment:", err);
        return { success: false, data: "Network error", message: "Network error" };
    }
}
