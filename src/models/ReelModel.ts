// Reel.ts
export interface Reel {
  reelId: string;           // original serial name
  userId: string;
  username: string;
  profilePictureUrl?: string | null;
  caption?: string | null;
  mediaUrl: string;
  audioUrl?: string | null;
  likesCount: string;
  commentsCount: string;
  sharesCount: string;
  viewsCount: string;
  trendingScore: string;
  isLiked: Boolean;           // server returns 0 or 1

  createdAt: string;
  updatedAt: string;

}

// ReelComment.ts
export interface ReelComment {
  commentId: string;        // original serial name
  reelId: string;
  userId: string;
  username: string;
  profilePictureUrl?: string | null;
  parentCommentId?: string | null;
  commentText: string;
  createdAt: string;
  updatedAt: string;
}

