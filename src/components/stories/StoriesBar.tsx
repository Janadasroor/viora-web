"use client";

import React, { useEffect, useState, useContext } from "react";
import { Plus, User } from "lucide-react";
import { getStories, getFollowingStories } from "@/api/stories";
import { getCurrentUser } from "@/api/users";
import type { Story } from "@/types/api/story.types";
import type { UserProfile } from "@/models/UserProfile";
import { AuthContext } from "@/context/AuthContext";
import { useStoryViewer } from "@/context/StoryViewerContext";
import { API_URL } from "@/constants/url";

export default function StoriesBar() {
    const { user } = useContext(AuthContext) || {};
    const { openStoryViewer } = useStoryViewer();
    const [myStories, setMyStories] = useState<Story[]>([]);
    const [followingStories, setFollowingStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStories = async () => {
            try {
                const [myStoriesData, followingStoriesData] = await Promise.all([
                    getStories(),
                    getFollowingStories(),
                ]);
                setMyStories(myStoriesData);
                setFollowingStories(followingStoriesData);
            } catch (error) {
                console.error("Failed to fetch stories:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchStories();
        }
    }, [user]);

    if (!user) return null;

    // Group following stories by user
    const groupedStories = followingStories.reduce((acc, story) => {
        const userId = story.userId;
        if (!acc[userId]) {
            acc[userId] = {
                user: {
                    userId: story.userId,
                    username: story.username,
                    userMedia: story.userMedia,
                },
                stories: [],
            };
        }
        acc[userId].stories.push(story);
        return acc;
    }, {} as Record<string, { user: any; stories: Story[] }>);

    const followingUsers = Object.values(groupedStories);

    return (
        <div className="bg-white dark:bg-black border border-zinc-100 dark:border-zinc-900 rounded-3xl p-4 mb-6 overflow-x-auto scrollbar-hide shadow-sm">
            <div className="flex space-x-6 min-w-max px-2">
                {/* My Story */}
                <div
                    className="flex flex-col items-center space-y-2.5 cursor-pointer group"
                    onClick={() => myStories.length > 0 && openStoryViewer([...myStories].reverse())}
                >
                    <div className="relative">
                        <div className={`w-[68px] h-[68px] rounded-full p-[2.5px] ${myStories.length > 0 ? "bg-gradient-to-tr from-yellow-400 via-orange-500 to-purple-600" : "border-2 border-zinc-100 dark:border-zinc-800"}`}>
                            <div className="w-full h-full rounded-full border-2 border-white dark:border-black overflow-hidden bg-zinc-50 dark:bg-zinc-900">
                                {user.media && user.media.length > 0 ? (
                                    <img
                                        src={`${API_URL}${user.media[0].thumbnailPath || user.media[0].filePath}`}
                                        alt={user.username}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500">
                                        <User className="w-6 h-6" />
                                    </div>
                                )}
                            </div>
                        </div>
                        {myStories.length === 0 && (
                            <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1.5 border-[3px] border-white dark:border-black shadow-lg transition-transform duration-200 group-hover:scale-110">
                                <Plus className="w-3.5 h-3.5 text-white stroke-[3px]" />
                            </div>
                        )}
                    </div>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-tight">Your Story</span>
                </div>

                {/* Following Stories */}
                {loading ? (
                    // Skeleton loading
                    [...Array(5)].map((_, i) => (
                        <div key={i} className="flex flex-col items-center space-y-2.5">
                            <div className="w-[68px] h-[68px] rounded-full bg-zinc-100 dark:bg-zinc-900 animate-pulse" />
                            <div className="w-12 h-2.5 bg-zinc-100 dark:bg-zinc-900 rounded-full animate-pulse" />
                        </div>
                    ))
                ) : (
                    followingUsers.map(({ user: storyUser, stories }) => (
                        <div
                            key={storyUser.userId}
                            className="flex flex-col items-center space-y-2.5 cursor-pointer group"
                            onClick={() => openStoryViewer([...stories].reverse())}
                        >
                            <div className="w-[68px] h-[68px] rounded-full p-[2.5px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 transition-all duration-300">
                                <div className="w-full h-full rounded-full border-[3px] border-white dark:border-black overflow-hidden transition-transform duration-200 group-hover:scale-105">
                                    {storyUser.userMedia && storyUser.userMedia.length > 0 ? (
                                        <img
                                            src={`${API_URL}${storyUser.userMedia[0].thumbnailPath || storyUser.userMedia[0].filePath}`}
                                            alt={storyUser.username}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500">
                                            <User className="w-6 h-6" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-bold truncate w-20 text-center tracking-tight group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                                {storyUser.username}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
