import { Post, MediaFile } from "./Post";

export interface UnifiedSearch {
  success: boolean;
  data: UnifiedSearchResult;
  query: string;
  pagination?: PaginationInfo | null;
  message?: string | null;
}

export interface UnifiedSearchResult {
  users: SearchedUser[];
  posts: SearchedPost[];
  hashtags: SearchedHashtag[];
  locations: SearchedLocation[];
}

export interface SearchedPost {
  postId: string;
  userId: string;
  caption: string;
  postType: string;
  visibility: string;
  location: string;
  likesCount: string;
  commentsCount: string;
  sharesCount: string;
  viewsCount: string;
  createdAt: string;
  username: string;
  displayName: string;
  isVerified: boolean;
  userLiked: boolean;
  userSaved: boolean;
  isFollowing: boolean;
  hashtags: string | null;
  relevanceScore: string;
  media: SearchedMediaFile[];
}

export interface SearchedMediaFile {
  postId: string;
  mediaId: string;
  filePath: string;
  mimeType: string;
  mediaType: string;
  width: number;
  height: number;
  duration: number | null;
  aspectRatio: string | null;
  hasAudio: boolean;
  title: string | null;
  description: string | null;
  mediaOrder: number;
  thumbnailPath?: string;
  variants: MediaVariant[] | null;
}

export interface MediaVariant {
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

export interface SearchedHashtag {
  hashtagId: number;
  tagName: string;
  postsCount: string;
  trendingScore: string;
  isTrending: number;
  createdAt: string;
}

export interface SearchedLocation {
  location: string;
  postsCount: string;
  lastPostAt: string;
}

export interface SearchedUser {
  userId: string;
  username: string;
  accountStatus: string;
  displayName: string;
  media?: MediaFile[];
  bio?: string | null;
  isVerified: boolean;
  followersCount: string;
  followingCount: string;
  postsCount: string;
  isFollowing: boolean;
  followsYou: boolean;
  profilePictureUrl?: string | null;
  relevanceScore?: string;
}

export interface PaginationInfo {
  page?: number;
  limit: number;
  hasMore: boolean;
  nextCursor?: string | null;
  previousCursor?: string | null;
}

export interface SearchUsersResponse {
  success: boolean;
  query: string;
  nextCursor?: string | null;
  pagination: PaginationInfo;
  data: SearchedUser[];
}

export interface SearchHashtagsResponse {
  success: boolean;
  query: string;
  nextCursor?: string | null;
  pagination: PaginationInfo;
  data: SearchedHashtag[];
}

export interface SearchPostsResponse {
  success: boolean;
  query: string;
  sortBy: string;
  nextCursor?: string | null;
  pagination: PaginationInfo;
  message?: string | null;
  data: Post[];
}
