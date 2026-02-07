export interface Post {
  postId: string;
  userId: string;
  postType: 'photo' | 'video' | 'carousel' | 'reel';
  caption: string | null;
  visibility: 'public' | 'private' | 'friends' | 'close_friends' | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  isArchived: boolean;
  commentsDisabled: boolean;
  likesCount: string;
  commentsCount: string;
  sharesCount: string;
  viewsCount: string;
  createdAt: Date;
  updatedAt: Date;
  username: string;
  displayName: string;
  userMedia?: MediaFile[];
  isVerified: boolean;
  userLiked: boolean;
  userSaved: boolean;
  isFollowing: boolean;
  hashtags: string | null;
  media: MediaFile[];
  isShared?: boolean;
  sharedAt?: Date;
}
export interface MediaFile {
  postId: string;
  mediaId: string; // UUID from media table
  filePath: string;
  mimeType: string;
  mediaType: string;
  width: number | null;
  height: number | null;
  thumbnailPath: string | null;
  thumbnailWidth: number | null;
  thumbnailHeight: number | null;
  fileName: string;
  altText: string | null;
  mediaOrder: number;
  duration: number | null;
  aspectRatio: string | null;
  codec: string | null;
  bitrate: number | null;
  fps: number | null;
  hasAudio: boolean | null;
  status: string;
  safeMode?: number;
  variants?: VideoVariant[] | null; // Only present for video media
}

export interface VideoVariant {
  variantId: string;
  quality: string;
  resolution: string;
  filePath: string;
  fileSize: number;
  bitrate: number;
  codec: string;
  format: string;
  width: number;
  height: number;
  fps: number | null;
  status: string;
}
export interface Media {
  mediaId: number;
  filePath: string;
  mimeType: string;
  mediaType: string;
  width?: number | null;
  height?: number | null;
  thumbnailPath?: string | null;
  fileName: string;
  altText?: string | null;
  mediaOrder: number;
}
