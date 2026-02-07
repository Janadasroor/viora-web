"use client";

import React, { useEffect, useState, useContext, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MoreVertical, Edit2, Trash2, X, Heart, MessageCircle, Share2 } from "lucide-react";
import { getReelById, deleteReel, updateReel } from "@/api/reels";
import { followUser, unfollowUser, getUserProfile, getCurrentUser } from "@/api/users";
import { ReelContext } from "@/context/ReelContext";
import ReelPlayer, { ReelPlayerRef } from "@/components/ReelPlayer";
import CommentsSection from "@/components/CommentsSection";
import { motion, AnimatePresence } from "framer-motion";
import type { ReelWithUser } from "@/types/api/reel.types";
import type { UserProfile } from "@/models/UserProfile";
import { use } from "react";

interface ReelPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default function ReelPage({ params }: ReelPageProps) {
    const { id } = use(params);
    const router = useRouter();

    const { likeReel, incrementReelViews, comments, fetchComments, fetchMoreComments, hasMoreComments, addComment, replyComment, likeComment, sendTypingStatus, typingUsers } = useContext(ReelContext);

    const [reel, setReel] = useState<ReelWithUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeReelId, setActiveReelId] = useState<string | null>(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [editCaption, setEditCaption] = useState("");
    const [updateLoading, setUpdateLoading] = useState(false);

    const playerRef = useRef<ReelPlayerRef | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [fetchedReel, currentUserData] = await Promise.all([
                    getReelById(id),
                    getCurrentUser()
                ]);

                if (fetchedReel) {
                    setReel(fetchedReel);
                    setCurrentUser(currentUserData);
                    incrementReelViews(fetchedReel.reelId);

                    // Check follow status
                    if (currentUserData && fetchedReel.userId !== currentUserData.userId) {
                        const profile = await getUserProfile(fetchedReel.userId);
                        if ((profile as any).isFollowing !== undefined) {
                            setIsFollowing((profile as any).isFollowing);
                        }
                    }
                } else {
                    setError("Reel not found");
                }
            } catch (err) {
                console.error("Failed to fetch reel:", err);
                setError("Failed to load reel");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    useEffect(() => {
        if (activeReelId) {
            fetchComments(activeReelId);
        }
    }, [activeReelId]);

    const handleFollowToggle = async () => {
        if (!reel) return;
        setFollowLoading(true);
        try {
            if (isFollowing) {
                await unfollowUser(reel.userId);
                setIsFollowing(false);
            } else {
                await followUser(reel.userId);
                setIsFollowing(true);
            }
        } catch (error) {
            console.error("Failed to toggle follow:", error);
        } finally {
            setFollowLoading(false);
        }
    };

    const handleDeleteReel = async () => {
        if (!reel) return;
        setDeleteLoading(true);
        try {
            const success = await deleteReel(reel.reelId);
            if (success) {
                router.back();
            } else {
                alert("Failed to delete reel");
            }
        } catch (error) {
            console.error("Error deleting reel:", error);
            alert("Failed to delete reel");
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleUpdateReel = async () => {
        if (!reel) return;
        setUpdateLoading(true);
        try {
            const updatedReel = await updateReel(reel.reelId, editCaption);
            if (updatedReel) {
                setReel(prev => prev ? { ...prev, caption: editCaption } : null);
                setEditOpen(false);
            } else {
                alert("Failed to update reel");
            }
        } catch (error) {
            console.error("Error updating reel:", error);
            alert("Failed to update reel");
        } finally {
            setUpdateLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-black">
                <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !reel) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-white">
                <p className="text-lg text-gray-400 mb-4">{error || "Reel not found"}</p>
                <button
                    onClick={() => router.back()}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                    Go Back
                </button>
            </div>
        );
    }

    const media = reel.media?.[0];
    const variants = media?.variants || [];
    const filePath = media?.filePath || "";
    const isOwnProfile = currentUser && reel.userId === currentUser.userId;

    return (
        <div className="h-screen w-full bg-black relative overflow-hidden">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-start bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
                <button
                    onClick={() => router.back()}
                    className="p-2 bg-black/20 hover:bg-black/40 backdrop-blur-sm rounded-full text-white pointer-events-auto transition-colors"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>

                {isOwnProfile && (
                    <div className="relative pointer-events-auto">
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="p-2 bg-black/20 hover:bg-black/40 backdrop-blur-sm rounded-full text-white transition-colors"
                        >
                            <MoreVertical className="w-6 h-6" />
                        </button>
                        {menuOpen && (
                            <div className="absolute top-12 right-0 bg-gray-900 rounded-lg overflow-hidden min-w-[160px] shadow-xl border border-gray-800">
                                <button
                                    onClick={() => {
                                        setEditCaption(reel.caption || "");
                                        setEditOpen(true);
                                        setMenuOpen(false);
                                    }}
                                    className="w-full px-4 py-3 text-left text-sm text-white hover:bg-gray-800 transition-colors flex items-center gap-3"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    Edit Caption
                                </button>
                                <button
                                    onClick={() => {
                                        setDeleteConfirmOpen(true);
                                        setMenuOpen(false);
                                    }}
                                    className="w-full px-4 py-3 text-left text-sm text-red-500 hover:bg-gray-800 transition-colors flex items-center gap-3"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete Reel
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Video Player */}
            <div className="absolute inset-0 flex items-center justify-center bg-black">
                {media && variants.length > 0 ? (
                    <ReelPlayer
                        ref={playerRef}
                        contentId={reel.reelId}
                        variants={variants}
                        filePath={filePath}
                        autoPlay={true}
                        muted={false}
                        loop={true}
                        isActive={true}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="text-white">No video available</div>
                )}
            </div>

            {/* Overlay Info */}
            <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black via-black/60 to-transparent text-white flex justify-between z-10 pointer-events-none">
                <div className="flex-1 pr-16">
                    <div className="flex items-center gap-3 pointer-events-auto">
                        <p
                            onClick={() => router.push(`/profile/${reel.userId}`)}
                            className="font-bold text-lg cursor-pointer hover:underline"
                        >
                            @{reel.username}
                        </p>
                        {!isOwnProfile && (
                            <button
                                onClick={handleFollowToggle}
                                disabled={followLoading}
                                className={`px-4 py-1.5 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 ${isFollowing
                                    ? "bg-gray-700/80 hover:bg-gray-600/80 text-white"
                                    : "bg-white/90 hover:bg-white text-black"
                                    }`}
                            >
                                {followLoading ? "..." : isFollowing ? "Following" : "Follow"}
                            </button>
                        )}
                    </div>
                    {reel.caption && <p className="text-sm mt-2 leading-relaxed">{reel.caption}</p>}
                    <div className="flex gap-4 mt-3 text-xs text-gray-300">
                        <span>{reel.viewsCount} views</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-7 items-center pointer-events-auto">
                    <button
                        onClick={() => likeReel(reel.reelId)}
                        className="flex flex-col items-center transition-transform hover:scale-110"
                    >
                        <Heart
                            className={`w-8 h-8 ${reel.isLiked ? "text-red-500 fill-red-500" : "text-white"}`}
                        />
                        <span className="text-sm mt-1">{reel.likesCount}</span>
                    </button>
                    <button
                        onClick={() => setActiveReelId(reel.reelId)}
                        className="flex flex-col items-center transition-transform hover:scale-110"
                    >
                        <MessageCircle className="w-8 h-8 text-white" />
                        <span className="text-sm mt-1">{reel.commentsCount}</span>
                    </button>
                    <div className="flex flex-col items-center">
                        <Share2 className="w-8 h-8 text-white" />
                        <span className="text-sm mt-1">{reel.sharesCount}</span>
                    </div>
                </div>
            </div>

            {/* Comments Sheet */}
            <AnimatePresence>
                {activeReelId && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setActiveReelId(null)}
                            className="fixed inset-0 bg-black/50 z-40"
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed bottom-0 left-0 right-0 h-[70vh] z-50"
                        >
                            <CommentsSection
                                comments={comments}
                                loading={false}
                                onAddComment={(content) => addComment(reel.reelId as string, content)}
                                onReply={(commentId, content) => replyComment(reel.reelId as string, commentId, content)}
                                onLike={likeComment}
                                onClose={() => setActiveReelId(null)}
                                loadMore={() => fetchMoreComments(reel.reelId as string)}
                                hasMore={hasMoreComments}
                                currentUserId={currentUser?.userId}
                                onTyping={(isTyping) => sendTypingStatus(reel.reelId as string, isTyping)}
                                typingUsers={typingUsers}
                            />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Delete Confirmation */}
            <AnimatePresence>
                {deleteConfirmOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
                        onClick={() => setDeleteConfirmOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            className="bg-gray-900 rounded-2xl p-6 max-w-sm w-full border border-gray-800"
                            onClick={e => e.stopPropagation()}
                        >
                            <h3 className="text-xl font-bold text-white mb-2">Delete Reel?</h3>
                            <p className="text-gray-400 mb-6">This action cannot be undone.</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteConfirmOpen(false)}
                                    className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteReel}
                                    disabled={deleteLoading}
                                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg"
                                >
                                    {deleteLoading ? "Deleting..." : "Delete"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Edit Caption Dialog */}
            <AnimatePresence>
                {editOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
                        onClick={() => setEditOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-gray-800"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between mb-4">
                                <h3 className="text-xl font-bold text-white">Edit Caption</h3>
                                <button onClick={() => setEditOpen(false)}>
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>
                            <textarea
                                value={editCaption}
                                onChange={(e) => setEditCaption(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg mb-4 resize-none"
                                rows={4}
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setEditOpen(false)}
                                    className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateReel}
                                    disabled={updateLoading}
                                    className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg"
                                >
                                    {updateLoading ? "Updating..." : "Update"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
