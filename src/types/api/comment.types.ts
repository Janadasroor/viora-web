export interface Comment {
  commentId: string;
  parentCommentId?: string;
  userId: string;
  content: string;
  likesCount: string;
  repliesCount: string;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  isEdited: boolean;
  username: string;
  isOnline: boolean;
  displayName: string;
  profilePictureUrl: string;
  isVerified: boolean;
  userLiked: boolean;
  replies?: Reply[];
}

export interface Reply {
  commentId: string;
  parentCommentId: string;
  updatedAt: Date;
  content: string;
  likesCount: string;
  createdAt: Date;
  username: string;
  isOnline: boolean;
  userId: string;
  displayName: string;
  profilePictureUrl: string;
  isVerified: boolean;
  userLiked?: boolean;
}

