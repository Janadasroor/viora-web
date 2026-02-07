import { MediaFile } from "./Post";

export interface StoryDto {
  storyId: string;
  userId: string;
  mediaId?: string | null;
  fileName: string;
  storyType: string;
  content?: string | null;
  backgroundColor?: string | null;
  textOverlay?: string | null; // JSON string
  stickers?: string | null;    // JSON string
  musicId?: string | null;
  visibility: string;
  viewsCount: number;
  expiresAt: string;
  createdAt: string;
  username: string;
  displayName?: string | null;
  media?: MediaFile[];
}

export interface StoryViewDto {
  username: string;
  displayName?: string | null;
  media?: MediaFile[];
  viewerId: string;
  viewedAt: string;
  storyId: string;
}
