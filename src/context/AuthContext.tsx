"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
    login as apiLogin,
    register as apiRegister,
    logout as apiLogout,
    verifyCode as apiVerifyCode,
    requestVerificationCode as apiRequestVerificationCode
} from "@/api/auth";
import { getCurrentUser } from "@/api/users";
import { getUserIdFromToken } from "@/utils/jwtUtils";
import { registerErrorCallback } from "@/api/fetchClient";
import { getErrorAction, getErrorMessage } from "@/utils/authErrorHandler";
import type { AuthResponse } from "@/models/AuthResponse";
import type { UserProfile } from "@/models/UserProfile";
import type { ApiError } from "@/models/ApiError";

interface AuthContextType {
    user: UserProfile | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<AuthResponse>;
    register: (email: string, username: string, password: string) => Promise<AuthResponse>;
    logout: () => Promise<void>;
    verifyEmail: (email: string, code: string) => Promise<AuthResponse>;
    resendVerificationCode: (email: string, userId?: string) => Promise<boolean>;
    refreshSession: () => Promise<void>;
    refreshUser?: () => Promise<void>;
    clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const pathname = usePathname();

    /**
     * Handle authentication errors globally
     */
    const handleAuthError = useCallback((error: ApiError) => {
        // Get user email if available
        const userEmail = user?.email;

        // Skip redirection if already on a public page
        const publicRoutes = ['/login', '/register', '/verify-email', '/forgot-password', '/reset-password'];
        const isPublicRoute = publicRoutes.includes(pathname || '');

        const action = getErrorAction(error, pathname, userEmail);
        const message = getErrorMessage(error);

        switch (action.type) {
            case 'REDIRECT':
                if (!isPublicRoute) {
                    setError(message);
                    router.push(action.path);
                }
                break;

            case 'LOGOUT':
                setUser(null);
                if (!isPublicRoute) {
                    setError(message);
                    router.push('/login');
                }
                break;

            case 'SHOW_MESSAGE':
                setError(message);
                break;

            case 'REFRESH_TOKEN':
                // Token refresh is handled by fetchClient
                break;

            case 'NONE':
                // Do nothing
                break;
        }
    }, [router, pathname, user]);

    /**
     * Register error callback on mount
     */
    useEffect(() => {
        registerErrorCallback(handleAuthError);
    }, [handleAuthError]);

    const refreshSession = async () => {
        try {
            const profile = await getCurrentUser(true);
            if (profile) {
                setUser(profile);
                setError(null);
            } else {
                setUser(null);
            }
        } catch (error: any) {
            // Silently fail session refresh on mount - user is simply not logged in
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshSession();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            setError(null);
            const response = await apiLogin(email, password);
            if (response.success) {
                await refreshSession();
            }
            return response;
        } catch (error: any) {
            console.error("Login failed:", error);
            setError(getErrorMessage(error));
            throw error;
        }
    };

    const register = async (email: string, username: string, password: string) => {
        try {
            setError(null);
            const response = await apiRegister(email, username, password);
            if (response.success && response.data) {
                // Manually set user from registration response
                const userData = response.data.user;
                const userProfile: UserProfile = {
                    userId: userData.userId,
                    profileId: userData.userId,
                    isOnline: false,
                    username: userData.username,
                    displayName: userData.username,
                    isPrivate: false,
                    isVerified: false,
                    followersCount: '0',
                    followingCount: '0',
                    postsCount: '0',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    safeMode: 1
                };
                setUser(userProfile);
            }
            return response;
        } catch (error: any) {
            console.error("Registration failed:", error);
            setError(getErrorMessage(error));
            throw error;
        }
    };

    const verifyEmail = async (email: string, code: string) => {
        try {
            setError(null);
            const response = await apiVerifyCode(email, code);
            await refreshSession();
            router.push("/onboarding");
            return response;
        } catch (error: any) {
            console.error("Email verification failed:", error);
            setError(getErrorMessage(error));
            throw error;
        }
    };

    const resendVerificationCode = async (email: string, userId?: string) => {
        try {
            setError(null);
            let targetUserId: string | null = userId || null;

            if (!targetUserId) {
                if (user) {
                    targetUserId = user.userId;
                } else {
                    targetUserId = getUserIdFromToken();
                }
            }

            if (!targetUserId) {
                throw new Error("Unable to resend verification code. Please try registering again.");
            }

            return await apiRequestVerificationCode(email, targetUserId);
        } catch (error: any) {
            console.error("Resend verification failed:", error);
            setError(getErrorMessage(error));
            throw error;
        }
    };

    const logout = async () => {
        try {
            setError(null);
            await apiLogout();

            // Clear local storage data
            localStorage.removeItem('fcm_token');
            localStorage.removeItem('notification_prompt_dismissed');
            localStorage.removeItem('user'); // Just in case it was used elsewhere

            // Note: We keep UI preferences like viora_video_quality

            setUser(null);
            router.push("/login");
        } catch (error: any) {
            console.error("Logout failed:", error);
            // Even if logout fails, clear local state
            setUser(null);
            router.push("/login");
        }
    };

    const clearError = () => {
        setError(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                loading,
                error,
                login,
                register,
                logout,
                verifyEmail,
                resendVerificationCode,
                refreshSession,
                refreshUser: refreshSession,
                clearError,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
