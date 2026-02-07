import type { MediaFile } from "./post.types";

// Text overlay item structure
export interface TextOverlayItem {
  id: string;
  text: string;
  font?: {
    family?: string;
    size?: number;
    weight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
    color?: string; // Hex color
  };
  style?: {
    backgroundColor?: string;
    letterSpacing?: number;
    lineHeight?: number;
  };
  transform?: {
    position: {
      x: number; // 0-1 normalized
      y: number; // 0-1 normalized
    };
    scale?: number;
    rotation?: number; // Degrees
  };
  shadow?: {
    color?: string;
    blur?: number;
    dx?: number;
    dy?: number;
  };
  animation?: {
    type?: 'none' | 'fade' | 'slide' | 'bounce' | 'zoom';
    durationMs?: number;
  };
}

// Sticker item structure
export interface StickerItem {
  id: string;
  type: 'image' | 'emoji' | 'gif';
  src?: string; // URL for image/gif
  emoji?: string; // For emoji type
  transform: {
    position: {
      x: number; // 0-1 normalized
      y: number; // 0-1 normalized
    };
    scale?: number;
    rotation?: number; // Degrees
  };
  opacity?: number; // 0-1
  zIndex?: number;
  animation?: {
    type?: 'none' | 'bounce' | 'spin' | 'pulse' | 'shake';
    durationMs?: number;
  };
  meta?: {
    isPremium?: boolean;
  };
}

export interface StoryData {
  //mediaId: string;
  storyType?: string;
  content?: string | null;
  backgroundColor?: string | null;
  textOverlay?: TextOverlayItem[] | null;
  stickers?: StickerItem[] | null;
  musicId?: number | null;
  visibility?: string;
  status?: string;
}

export interface Story {
  storyId: string;
  userId: string;
  content: string | null;
  storyType: string;
  visibility: string;
  backgroundColor?: string | null;
  stickers: StickerItem[] | null;
  musicId: number | null;
  textOverlay: TextOverlayItem[] | null;
  expiresAt: Date;
  viewsCount: string;
  createdAt: Date;
  fileName: string;
  username: string;
  displayName: string;
  userMedia?: MediaFile[];
  media: MediaFile[];
  likesCount?: string;
  commentsCount?: string;
  isLiked?: boolean;
}

export interface StoryView {
  username: string;
  displayName: string;
  media?: MediaFile[]; // This is user media in StoryView context based on repository update
  viewerId: string;
  viewedAt: Date;
  storyId: string;
}

export interface PaginatedStories {
  stories: Story[];
  hasMore: boolean;
}

export interface PaginatedViews {
  views: StoryView[];
  hasMore: boolean;
}