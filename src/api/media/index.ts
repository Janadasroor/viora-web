import type {
    MediaUploadParams,
    MediaUploadResponse,
    MediaResponse,
    MediaDeleteResponse,
    MediaType
} from "@/models/Media";
import { apiUrl, defaultFetchOptions } from "../config";
import { fetchWithAuth } from "../fetchClient";

// ============================================================================
// POST - Upload Media
// ============================================================================

/**
 * Upload images to the server
 * @param params - Upload parameters including files, title, description, targetId, targetType
 * @returns Promise with upload response containing file paths
 */
export async function uploadImages(params: MediaUploadParams): Promise<MediaUploadResponse> {
    try {
        const { files, title, description, targetId, targetType } = params;

        // Create FormData for multipart upload
        const formData = new FormData();

        // Append files
        files.forEach((file) => {
            formData.append('image', file);
        });

        // Append metadata
        if (title) formData.append('title', title);
        if (description) formData.append('description', description);

        // Build query parameters
        const queryParams = new URLSearchParams();
        if (targetId) queryParams.append('postId', targetId);
        if (targetType) queryParams.append('targetType', targetType);

        const url = `${apiUrl}/media/upload/image${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

        const res = await fetch(url, {
            method: 'POST',
            credentials: 'include',
            cache: 'no-store',
            body: formData,
        });

        const data: MediaUploadResponse = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.error || 'Failed to upload images');
        }

        return data;
    } catch (err) {
        console.error('Error uploading images:', err);
        return {
            success: false,
            error: err instanceof Error ? err.message : 'Failed to upload images',
        };
    }
}

/**
 * Upload videos to the server
 * @param params - Upload parameters including files, title, description, targetId, targetType
 * @returns Promise with upload response containing file paths
 */
export async function uploadVideos(params: MediaUploadParams): Promise<MediaUploadResponse> {
    try {
        const { files, title, description, targetId, targetType } = params;

        // Create FormData for multipart upload
        const formData = new FormData();

        // Append files
        files.forEach((file) => {
            formData.append('video', file);
        });

        // Append metadata
        if (title) formData.append('title', title);
        if (description) formData.append('description', description);

        // Build query parameters
        const queryParams = new URLSearchParams();
        if (targetId) queryParams.append('postId', targetId);
        if (targetType) queryParams.append('targetType', targetType);

        const url = `${apiUrl}/media/upload/video${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

        const res = await fetch(url, {
            method: 'POST',
            credentials: 'include',
            cache: 'no-store',
            body: formData,
        });

        const data: MediaUploadResponse = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.error || 'Failed to upload videos');
        }

        return data;
    } catch (err) {
        console.error('Error uploading videos:', err);
        return {
            success: false,
            error: err instanceof Error ? err.message : 'Failed to upload videos',
        };
    }
}

// ============================================================================
// GET - Retrieve Media
// ============================================================================

/**
 * Get media with pagination and filtering
 * @param type - Type of media to retrieve (image, video, or all)
 * @param page - Page number (default: 1)
 * @param limit - Number of items per page (default: 10)
 * @returns Promise with media items
 */
export async function getMedia(
    type: MediaType = 'image',
    page: number = 1,
    limit: number = 10
): Promise<MediaResponse> {
    try {
        const params = new URLSearchParams({
            type,
            page: page.toString(),
            limit: limit.toString(),
        });

        const res = await fetchWithAuth(`${apiUrl}/media?${params.toString()}`, {
            ...defaultFetchOptions,
            method: 'GET',
        });

        const data: MediaResponse = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.error || 'Failed to fetch media');
        }

        return data;
    } catch (err) {
        console.error('Error fetching media:', err);
        return {
            success: false,
            error: err instanceof Error ? err.message : 'Failed to fetch media',
        };
    }
}

// ============================================================================
// DELETE - Delete Media
// ============================================================================

/**
 * Delete a media file by ID
 * @param mediaId - ID of the media file to delete
 * @returns Promise with delete response
 */
export async function deleteMedia(mediaId: string): Promise<MediaDeleteResponse> {
    try {
        const res = await fetchWithAuth(`${apiUrl}/delete/${mediaId}`, {
            method: 'DELETE',
            ...defaultFetchOptions,
        });

        const data: MediaDeleteResponse = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.error || 'Failed to delete media');
        }

        return data;
    } catch (err) {
        console.error('Error deleting media:', err);
        return {
            success: false,
            error: err instanceof Error ? err.message : 'Failed to delete media',
        };
    }
}
