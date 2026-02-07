export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: AuthenticatedUser
  }
}
export interface AuthenticatedUser {
  userId: string;
  username: string;
  email: string;
  accountStatus: string;
  emailVerified: boolean;
}
