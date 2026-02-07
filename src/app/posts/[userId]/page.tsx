"use client";

import React, { useEffect, useRef, useState, useContext } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getPosts } from "@/api/posts";
import { getCurrentUser, getUserProfile } from "@/api/users";
import { PostContext } from "@/context/PostContext";
import { AuthContext } from "@/context/AuthContext";
import PostCard from "@/components/cards/PostCard";
import CommentSheet from "@/components/post/CommentsSheet";
import type { Post } from "@/models/Post";
import type { UserProfile } from "@/models/UserProfile";
import { use } from "react";

interface PostsPageProps {
    params: Promise<{
        userId: string;
    }>;
}

export default function PostsPage({ params }: PostsPageProps) {
    const { userId } = use(params);
    const router = useRouter();
    const searchParams = useSearchParams();
    const targetPostId = searchParams.get("postId");

    const { likePost, savePost, followUser, deletePost, updatePost, sharePost } = useContext(PostContext);
    const user = useContext(AuthContext)?.user;

    const [posts, setPosts] = useState<Post[]>([]);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [openCommentSheet, setOpenCommentSheet] = useState(false);
    const [activePostId, setActivePostId] = useState("");

    const postRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                const [userPosts, profile] = await Promise.all([
                    getPosts(1, 100, userId),
                    getUserProfile(userId),
                ]);
                setPosts(userPosts);
                setUserProfile(profile);
            } catch (error) {
                console.error("Failed to fetch posts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId]);

    useEffect(() => {
        if (!loading && targetPostId && postRefs.current[targetPostId]) {
            // Small delay to ensure DOM is fully rendered
            setTimeout(() => {
                postRefs.current[targetPostId]?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
            }, 100);
        }
    }, [loading, targetPostId]);

    const handleOpenComments = (postId: string) => {
        setActivePostId(postId);
        setOpenCommentSheet(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                            {userProfile?.displayName || userProfile?.username}'s Posts
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {posts.length} {posts.length === 1 ? "post" : "posts"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Posts Feed */}
            <div className="max-w-2xl mx-auto">
                {posts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
                        <p className="text-lg">No posts yet</p>
                    </div>
                ) : (
                    posts.map((post) => (
                        <div
                            key={post.postId}
                            ref={(el) => {
                                postRefs.current[post.postId] = el;
                            }}
                            id={`post-${post.postId}`}
                            className="mb-4"
                        >
                            <PostCard
                                post={post}
                                currentUserId={user?.userId}
                                likePost={likePost}
                                savePost={savePost}
                                followUser={followUser}
                                deletePost={deletePost}
                                updatePost={updatePost}
                                sharePost={sharePost}
                                openCommentSheet={handleOpenComments}
                            />
                        </div>
                    ))
                )}
            </div>

            {/* Comment Sheet */}
            {openCommentSheet && (
                <CommentSheet
                    postId={activePostId}
                    onClose={() => setOpenCommentSheet(false)}
                />
            )}
        </div>
    );
}
