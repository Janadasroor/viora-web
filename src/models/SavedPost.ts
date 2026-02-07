import { MediaFile } from "./Post";

export interface SavedPost {
  postId: string;
  savedAt: string;
  postOwner: string;
  caption?: string | null;
  postType: string;
  visibility?: string | null;
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isArchived: number;
  commentsDisabled: number;
  likesCount: string;
  commentsCount: string;
  sharesCount: string;
  viewsCount: string;
  postCreatedAt: string;

  // Optional boolean getters for convenience
  isArchivedBool?: boolean;
  commentsDisabledBool?: boolean;

  // Media files
  media?: MediaFile[];
}
