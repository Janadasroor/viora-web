"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Search, User as UserIcon, Loader2 } from "lucide-react";
import { getFollowers, getFollowing, followUser, unfollowUser } from "@/api/users";
import type { User } from "@/models/User";
import { API_URL } from "@/constants/url";

interface UserListModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    userId: string;
    type: "followers" | "following";
}

export default function UserListModal({ isOpen, onClose, title, userId, type }: UserListModalProps) {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [followLoadingMap, setFollowLoadingMap] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (isOpen) {
            fetchUsers();
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen, userId, type]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = type === "followers"
                ? await getFollowers(userId)
                : await getFollowing(userId);
            setUsers(data);
        } catch (error) {
            console.error(`Failed to fetch ${type}:`, error);
        } finally {
            setLoading(false);
        }
    };

    const handleFollowToggle = async (targetUser: User) => {
        if (followLoadingMap[targetUser.userId]) return;

        setFollowLoadingMap(prev => ({ ...prev, [targetUser.userId]: true }));
        try {
            if (targetUser.isFollowing) {
                await unfollowUser(targetUser.userId);
                setUsers(prev => prev.map(u =>
                    u.userId === targetUser.userId ? { ...u, isFollowing: false } : u
                ));
            } else {
                await followUser(targetUser.userId);
                setUsers(prev => prev.map(u =>
                    u.userId === targetUser.userId ? { ...u, isFollowing: true } : u
                ));
            }
        } catch (error) {
            console.error("Failed to toggle follow:", error);
        } finally {
            setFollowLoadingMap(prev => ({ ...prev, [targetUser.userId]: false }));
        }
    };

    const handleUserClick = (targetUserId: string) => {
        onClose();
        router.push(`/profile/${targetUserId}`);
    };

    const filteredUsers = users.filter(user =>
        (user.displayName || user.username || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.username || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="relative w-full max-w-md bg-white dark:bg-black rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto min-h-[300px]">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                        </div>
                    ) : filteredUsers.length > 0 ? (
                        <div className="flex flex-col">
                            {filteredUsers.map((user) => (
                                <div key={user.userId} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                    <div
                                        onClick={() => handleUserClick(user.userId)}
                                        className="flex items-center gap-3 cursor-pointer flex-1"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden flex-shrink-0">
                                            {user.profilePictureUrl ? (
                                                <img
                                                    src={user.profilePictureUrl.startsWith('http') ? user.profilePictureUrl : API_URL + user.profilePictureUrl}
                                                    alt={user.username || "User"}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <UserIcon className="w-6 h-6" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm text-gray-900 dark:text-white">
                                                {user.username}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {user.displayName || user.username}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Can't follow yourself */}
                                    {/* Also specific logic: You can remove followers, but here we just show follow status for now */}
                                    <button
                                        onClick={() => handleFollowToggle(user)}
                                        disabled={followLoadingMap[user.userId]}
                                        className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${user.isFollowing
                                                ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                                                : "bg-blue-500 text-white hover:bg-blue-600"
                                            }`}
                                    >
                                        {followLoadingMap[user.userId] ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : user.isFollowing ? (
                                            "Following"
                                        ) : (
                                            "Follow"
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                            <p>No users found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Background click close */}
            <div className="absolute inset-0 -z-10" onClick={onClose} />
        </div>
    );
}
