
export interface User {
  userId: string;
  username: string;
  isOnline: boolean;
  email: string;
  emailVerified?: boolean;
  accountStatus?: string;
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface UserProfile {
  userId: string;
  displayName: string;
  bio?: string;
  profilePictureUrl?: string;
  website?: string;
  location?: string;
  isPrivate: boolean;
  isVerified: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  gender?: string;
  birthDate?: Date;
  updatedAt: Date;
}

export interface FollowerUser {
  userId: string;
  isOnline: boolean;
  username: string;
  email: string;
  displayName: string;
  emailVerified: boolean;
  profilePictureUrl?: string;
  isVerified: boolean;
  followedAt: Date;
}

export interface UserWithProfile extends User {
  displayName: string;
  bio?: string;
  profilePictureUrl?: string;
  website?: string;
  location?: string;
  isPrivate: boolean;
  isVerified: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing?: boolean;
  isBlockedByUser?: boolean;
  isBlockingUser?: boolean;
}

export interface ProfileUpdateData {
  displayName?: string |undefined;
  bio?: string | undefined;
  website?: string | null;
  location?: string | null;
  isPrivate?: boolean | undefined;
  gender?: string |undefined;
  birthDate?: Date | string | undefined;
}

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  verified?: string | boolean;
  status?: string;
}

export interface Follow {
  followerId: string;
  followingId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfileWithFollow extends UserProfile {
  isFollowing: boolean;
  isFollower: boolean;
}
