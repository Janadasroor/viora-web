/**
 * Media type definitions
 */

export type MediaType = 'image' | 'video' | 'all';

export type TargetType = 'POST' | 'REEL' | 'STORY' | 'USER';

/**
 * Parameters for uploading media files
 */
export interface MediaUploadParams {
    files: File[];
    title?: string;
    description?: string;
    targetId?: string;
    targetType?: TargetType;
}

/**
 * Media item returned from API
 */
export interface MediaItem {
    mediaId: string;
    userId: string;
    type: string;
    originalFilename: string;
    originalSize: number;
    originalPath: string;
    width: number;
    height: number;
    thumbnailPath?: string;
    thumbnailHeight?: number;
    thumbnailWidth?: number;
    mimeType: string;
    title?: string;
    description?: string;
    tags?: string[];
    visibility?: string;
    locationLat?: number;
    locationLng?: number;
    locationName?: string;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
}

/**
 * Response from media upload
 */
export interface MediaUploadResponse {
    success: boolean;
    data?: string[];
    message?: string;
    error?: string;
}

/**
 * Response from get media endpoint
 */
export interface MediaResponse {
    success: boolean;
    data?: MediaItem[];
    message?: string;
    error?: string;
}

/**
 * Response from delete media endpoint
 */
export interface MediaDeleteResponse {
    success: boolean;
    message?: string;
    error?: string;
}
