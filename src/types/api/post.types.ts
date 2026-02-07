export interface Post {
  postId: string;
  userId: string;
  caption: string;
  postType: string;
  visibility: string;
  location: string | null;
  likesCount: string;
  sharesCount: string;
  commentsCount: string;
  createdAt: Date;
  username: string;
  isOnline: boolean; 
  displayName: string;
  profilePictureUrl: string | null;
  isVerified: boolean;
  userLiked: boolean;
  userSaved: boolean;
  hashtags: string | null;
  media?: MediaFile[];
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
  variants?: VideoVariant[] | null; // Only present for video media
}

export interface VideoVariant {
  variantId: string;
  quality: string;
  resolution: string;
  filePath: string;
  fileSize: string;
  bitrate: string;
  codec: string;
  format: string;
  width: number;
  height: number;
  fps: number | null;
  status: string;
}
export interface MediaFileInput {
  mediaId: string;
  altText?: string | null;
}
export interface GetPostsParams {
  page: number;
  limit: number;
  userId?: string | undefined;
  hashtag?: string | undefined;
  type?: string | undefined;
  requesterId: string; //This comes from the token
}


export interface CreatePostParams {
  userId: string;
  caption: string;
  postType: string;
  visibility: string;
  location?: string | null;
  hashtags?: string[];
  mediaFiles?: MediaFileInput[];
}

export interface UpdatePostParams {
  caption?: string | null;
  location?: string | null;
  visibility?: Visibility | null;
}



export interface GetSavedPostsParams {
  userId: string;
  collectionId?: number | null;
  limit: number;
  offset: number;
}

export interface SavedPost {
  postId: string;
  savedAt: Date;
  postOwner: string;
  caption: string;
  postType: string;
  visibility: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  isArchived: boolean;
  commentsDisabled: boolean;
  likesCount: string;
  commentsCount: string;
  sharesCount: string;
  viewsCount: string;
  postCreatedAt: Date;
}
export type Visibility = 'PUBLIC' | 'FRIENDS' | 'PRIVATE';