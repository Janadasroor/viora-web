"use client";

import React, { useEffect, useState, useContext } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getPostById } from "@/api/posts";
import { PostContext } from "@/context/PostContext";
import { AuthContext } from "@/context/AuthContext";
import PostCard from "@/components/cards/PostCard";
import CommentSheet from "@/components/post/CommentsSheet";
import type { Post } from "@/models/Post";
import { use } from "react";

interface PostPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default function PostPage({ params }: PostPageProps) {
    const { id } = use(params);
    const router = useRouter();

    const { likePost, savePost, followUser, deletePost, updatePost, sharePost } = useContext(PostContext);
    const user = useContext(AuthContext)?.user;

    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [openCommentSheet, setOpenCommentSheet] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                setLoading(true);
                setLoading(true);
                if (!id) {
                    setError("Invalid post ID");
                    return;
                }

                const fetchedPost = await getPostById(id);
                if (fetchedPost) {
                    setPost(fetchedPost);
                } else {
                    setError("Post not found");
                }
            } catch (err) {
                console.error("Failed to fetch post:", err);
                setError("Failed to load post");
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id]);

    const handleOpenComments = () => {
        setOpenCommentSheet(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-950">
                <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-4">
                <p className="text-lg text-gray-500 dark:text-gray-400 mb-4">{error || "Post not found"}</p>
                <button
                    onClick={() => router.back()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Go Back
                </button>
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
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Post</h1>
                </div>
            </div>

            {/* Post Content */}
            <div className="max-w-2xl mx-auto pt-4 pb-20 px-0 sm:px-4">
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

            {/* Comment Sheet */}
            {openCommentSheet && (
                <CommentSheet
                    postId={post.postId.toString()}
                    onClose={() => setOpenCommentSheet(false)}
                />
            )}
        </div>
    );
}
