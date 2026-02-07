import type { VideoVariant } from "./post.types.js";

export interface Reel {
  reelId: string; // UUID
  userId: string;
  caption: string;
  audioUrl?: string | null;
  trendingScore: string;
  viewsCount: string;
  likesCount: string;
  commentsCount: string;
  sharesCount: string;
  createdAt: string;
  updatedAt: string;
  mediaId?: string | null;
  media?: ReelMedia[];
}

export interface ReelMediaVariant {
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

export interface ReelMedia {
  reelId: string;
  mediaId: string; // UUID from media table
  filePath: string;
  mimeType: string;
  mediaType: string;
  width: number | null;
  height: number | null;
  duration: number | null;
  aspectRatio: string | null;
  hasAudio: boolean | null;
  title: string | null;
  description: string | null;
  mediaOrder: number;
  safeMode?: number;
  variants?: ReelMediaVariant[];
}


export interface ReelWithUser extends Reel {
  username: string;
  profilePictureUrl?: string;
  isLiked?: boolean;
}

export interface ReelView {
  reelId: string;
  userId: string;
  createdAt: Date | string;
}
