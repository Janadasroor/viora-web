export interface User {
  userId: string;
  username?: string | null;
  email?: string | null;
  createdAt?: string | null;
  lastLoginAt?: string | null;
  displayName?: string | null;
  bio?: string | null;
  profilePictureUrl?: string | null;
  website?: string | null;
  location?: string | null;
  isPrivate: boolean;
  isOnline: boolean;
  isVerified: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing?: boolean | null;
  isBlockedByUser?: boolean | null;
  isBlockingUser?: boolean | null;
  accountStatus?: string | null;
  emailVerified: boolean;
}
