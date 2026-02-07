"use client";

import React, { useEffect, useState } from "react";
import { getSavedPosts } from "@/api/posts";
import type { SavedPost } from "@/models/SavedPost";
import { Bookmark, Image as ImageIcon, Play } from "lucide-react";
import { API_URL } from "@/constants/url";

export default function SavedPosts() {
    const [posts, setPosts] = useState<SavedPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSavedPosts = async () => {
            try {
                const data = await getSavedPosts();
                setPosts(data);
            } catch (error) {
                console.error("Failed to fetch saved posts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSavedPosts();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-gray-500">
                <div className="p-4 bg-gray-100 rounded-full mb-4">
                    <Bookmark className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">No saved posts yet</h3>
                <p className="text-sm mt-1">Posts you save will appear here.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-3 gap-1 sm:gap-2 md:gap-4 p-1 sm:p-4">
            {posts.map((post) => {
                const firstMedia = post.media && post.media.length > 0 ? post.media[0] : null;

                return (
                    <div
                        key={(post as any).postId }
                        className="relative aspect-square bg-gray-200 cursor-pointer group overflow-hidden rounded-md"
                    >
                        {firstMedia ? (
                            <img
                                src={`${API_URL}${firstMedia.thumbnailPath || firstMedia.filePath}`}
                                alt={post.caption || "Saved post"}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                <ImageIcon className="w-8 h-8 text-gray-300" />
                            </div>
                        )}

                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="flex space-x-4 text-white font-semibold">
                                {/* You can add like/comment counts here if available in SavedPost */}
                            </div>
                        </div>

                        {/* Type Indicator */}
                        {post.postType === 'video' || post.postType === 'reel' ? (
                            <div className="absolute top-2 right-2">
                                <Play className="w-5 h-5 text-white drop-shadow-md fill-current" />
                            </div>
                        ) : post.postType === 'carousel' ? (
                            <div className="absolute top-2 right-2">
                                <ImageIcon className="w-5 h-5 text-white drop-shadow-md" />
                            </div>
                        ) : null}
                    </div>
                );
            })}
        </div>
    );
}
