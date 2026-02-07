import type { SavedPost } from "@/models/SavedPost";

export interface LikeRequest {
  reactionType?: string; // default: "like"
}

export interface SavePostRequest {
  collectionId?: number | null;
}
