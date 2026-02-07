import type { MediaFile } from "./Post";

export interface UserProfile {
  profileId: string;
  userId: string;
  isOnline: boolean;
  username?: string;
  email?: string;
  displayName?: string;
  bio?: string;
  media?: MediaFile[];
  website?: string;
  location?: string;
  birthDate?: string;
  gender?: string;
  isPrivate: boolean;
  safeMode: number;
  isVerified: boolean;
  followersCount: string;
  followingCount: string;
  postsCount: string;
  createdAt: string;
  updatedAt: string;
  isFollowing?: boolean;
  isFollower?: boolean;
}
