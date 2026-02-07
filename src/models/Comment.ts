import { MediaFile } from "./Post";

export interface Comment {
  commentId: string; // Support both numeric and UUID
  parentCommentId?: string | null;
  content: string;
  likesCount: string;
  repliesCount: string;
  isPinned: boolean;
  isPinnedInt?: number; // Backend compatibility for sorting
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
  username: string;
  userId: string;
  displayName: string;
  isVerified: boolean;
  userLiked: boolean;
  userMedia?: MediaFile[];
  replies: Comment[];
}

export interface CommentsResponse {
  success: boolean;
  data: Comment[];
  nextCursor?: string;
}
