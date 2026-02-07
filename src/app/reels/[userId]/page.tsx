"use client";

import React, { useEffect, useRef, useState, useContext } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, UserPlus, UserCheck, Trash2, MoreVertical, Edit2, X } from "lucide-react";
import { getUserReels, deleteReel, updateReel } from "@/api/reels";
import { getCurrentUser, getUserProfile, followUser, unfollowUser } from "@/api/users";
import { ReelContext } from "@/context/ReelContext";
import ReelPlayer, { ReelPlayerRef } from "@/components/ReelPlayer";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import CommentsSection from "@/components/CommentsSection";
import { motion, AnimatePresence } from "framer-motion";
import type { ReelWithUser } from "@/types/api/reel.types";
import type { UserProfile } from "@/models/UserProfile";
import { use } from "react";

interface ReelsPageProps {
    params: Promise<{
        userId: string;
    }>;
}

export default function UserReelsPage({ params }: ReelsPageProps) {
    const { userId } = use(params);
    const router = useRouter();
    const searchParams = useSearchParams();
    const targetReelId = searchParams.get("reelId");

    const { likeReel, incrementReelViews, comments, fetchComments, fetchMoreComments, hasMoreComments, addComment, replyComment, likeComment, sendTypingStatus, typingUsers } = useContext(ReelContext);

    const [reels, setReels] = useState<ReelWithUser[]>([]);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [activeReelId, setActiveReelId] = useState<string | null>(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [deleteConfirmReelId, setDeleteConfirmReelId] = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [menuOpenReelId, setMenuOpenReelId] = useState<string | null>(null);
    const [editReelId, setEditReelId] = useState<string | null>(null);
    const [editCaption, setEditCaption] = useState("");
    const [updateLoading, setUpdateLoading] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const playerRefs = useRef<Map<string, ReelPlayerRef>>(new Map());
    const reelRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                if (isNaN(parseInt(userId))) {
                    return;
                }
                const [userReels, profile, currentUserData] = await Promise.all([
                    getUserReels(userId, 1, 100),
                    getUserProfile(userId),
                    getCurrentUser(),
                ]);
                setReels(userReels);
                setUserProfile(profile);
                setCurrentUser(currentUserData);

                // Check if following
                if ((profile as any).isFollowing !== undefined) {
                    setIsFollowing((profile as any).isFollowing);
                }

                // Find the index of the target reel if specified
                if (targetReelId) {
                    const targetIndex = userReels.findIndex(r => r.reelId === targetReelId);
                    if (targetIndex !== -1) {
                        setCurrentIndex(targetIndex);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch reels:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId, targetReelId]);

    // Scroll to target reel after loading
    useEffect(() => {
        if (!loading && targetReelId && reelRefs.current[targetReelId]) {
            setTimeout(() => {
                reelRefs.current[targetReelId]?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }, 100);
        }
    }, [loading, targetReelId]);

    useEffect(() => {
        if (activeReelId) {
            fetchComments(activeReelId);
        }
    }, [activeReelId]);

    // Increment views when a new reel is in viewport
    useEffect(() => {
        if (reels[currentIndex]) {
            incrementReelViews(reels[currentIndex].reelId);
        }
    }, [currentIndex, reels]);

    // Intersection Observer for scroll detection
    useEffect(() => {
        if (!containerRef.current) return;

        const options = {
            root: null,
            rootMargin: "0px",
            threshold: 0.5,
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                const index = parseInt(entry.target.getAttribute("data-index") || "0");

                if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                    setCurrentIndex(index);
                }
            });
        }, options);

        const reelElements = containerRef.current.querySelectorAll("[data-reel-item]");
        reelElements.forEach((element) => observer.observe(element));

        return () => {
            reelElements.forEach((element) => observer.unobserve(element));
        };
    }, [reels]);

    const handleFollowToggle = async () => {
        if (!userProfile || !currentUser) return;

        setFollowLoading(true);
        try {
            if (isFollowing) {
                await unfollowUser(userId);
                setIsFollowing(false);
            } else {
                await followUser(userId);
                setIsFollowing(true);
            }
        } catch (error) {
            console.error("Failed to toggle follow:", error);
        } finally {
            setFollowLoading(false);
        }
    };

    const isOwnProfile = currentUser && userProfile && currentUser.userId === userProfile.userId;

    const handleDeleteReel = async (reelId: string) => {
        setDeleteLoading(true);
        try {
            const success = await deleteReel(reelId);
            if (success) {
                // Remove the reel from the list
                setReels(prev => prev.filter(r => r.reelId !== reelId));
                setDeleteConfirmReelId(null);
                setMenuOpenReelId(null);

                // If no reels left, redirect back
                if (reels.length <= 1) {
                    router.back();
                }
            } else {
                alert("Failed to delete reel. Please try again.");
            }
        } catch (error) {
            console.error("Error deleting reel:", error);
            alert("Failed to delete reel. Please try again.");
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleEditReel = (reel: ReelWithUser) => {
        setEditReelId(reel.reelId);
        setEditCaption(reel.caption || "");
        setMenuOpenReelId(null);
    };

    const handleUpdateReel = async () => {
        if (!editReelId) return;

        setUpdateLoading(true);
        try {
            const updatedReel = await updateReel(editReelId, editCaption);
            if (updatedReel) {
                // Update the reel in the list
                setReels(prev => prev.map(r =>
                    r.reelId === editReelId ? { ...r, caption: editCaption } : r
                ));
                setEditReelId(null);
                setEditCaption("");
            } else {
                alert("Failed to update reel. Please try again.");
            }
        } catch (error) {
            console.error("Error updating reel:", error);
            alert("Failed to update reel. Please try again.");
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

    if (reels.length === 0) {
        return (
            <div className="min-h-screen bg-black">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-gray-900 border-b border-gray-800">
                    <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-300" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-white">
                                {userProfile?.displayName || userProfile?.username}'s Reels
                            </h1>
                            <p className="text-sm text-gray-400">0 reels</p>
                        </div>
                    </div>
                </div>

                {/* Empty State */}
                <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] text-gray-400">
                    <p className="text-lg">No reels yet</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-300" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-white">
                            {userProfile?.displayName || userProfile?.username}'s Reels
                        </h1>
                        <p className="text-sm text-gray-400">
                            {reels.length} {reels.length === 1 ? "reel" : "reels"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Reels Feed */}
            <div
                ref={containerRef}
                className="flex flex-col w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth"
                style={{ scrollSnapType: "y mandatory", height: "calc(100vh - 80px)" }}
            >
                {reels.map((reel, index) => {
                    const media = reel.media?.[0];
                    const variants = media?.variants || [];
                    const filePath = media?.filePath || "";
                    const isActive = index === currentIndex;

                    return (
                        <div
                            key={reel.reelId}
                            ref={(el) => {
                                reelRefs.current[reel.reelId] = el;
                            }}
                            data-reel-item
                            data-index={index}
                            id={`reel-${reel.reelId}`}
                            className="snap-start snap-always w-full min-h-full max-h-full relative flex items-end justify-start bg-black flex-shrink-0"
                            style={{ scrollSnapAlign: "start", scrollSnapStop: "always", height: "calc(100vh - 80px)" }}
                        >
                            {/* Video Player */}
                            {media && variants.length > 0 ? (
                                <ReelPlayer
                                    ref={(ref: ReelPlayerRef | null) => {
                                        if (ref) {
                                            playerRefs.current.set(reel.reelId, ref);
                                        }
                                    }}
                                    contentId={reel.reelId}
                                    variants={variants}
                                    filePath={filePath}
                                    autoPlay={true}
                                    muted={true}
                                    loop={true}
                                    isActive={isActive}
                                    className="absolute inset-0"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-white">
                                    <p>No video available</p>
                                </div>
                            )}

                            {/* Gradient overlay */}
                            <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black via-black/60 to-transparent text-white flex justify-between z-10 pointer-events-none">
                                {/* Caption */}
                                <div className="flex-1 pr-16">
                                    <div className="flex items-center gap-3">
                                        <p
                                            onClick={() => router.push(`/profile/${reel.userId}`)}
                                            className="font-bold text-lg cursor-pointer hover:underline pointer-events-auto"
                                        >
                                            @{reel.username}
                                        </p>
                                        {!isOwnProfile && (
                                            <button
                                                onClick={handleFollowToggle}
                                                disabled={followLoading}
                                                className={`pointer-events-auto px-4 py-1.5 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 ${isFollowing
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

                                {/* More Menu for Owner */}
                                {isOwnProfile && (
                                    <div className="absolute top-4 right-4 pointer-events-auto">
                                        <button
                                            onClick={() => setMenuOpenReelId(menuOpenReelId === reel.reelId ? null : reel.reelId)}
                                            className="p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                                        >
                                            <MoreVertical className="w-6 h-6 text-white" />
                                        </button>

                                        {/* Menu Dropdown */}
                                        {menuOpenReelId === reel.reelId && (
                                            <div className="absolute top-12 right-0 bg-gray-900 rounded-lg overflow-hidden min-w-[160px] shadow-xl border border-gray-800">
                                                <button
                                                    onClick={() => handleEditReel(reel)}
                                                    className="w-full px-4 py-3 text-left text-sm text-white hover:bg-gray-800 transition-colors flex items-center gap-3"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                    Edit Caption
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setDeleteConfirmReelId(reel.reelId);
                                                        setMenuOpenReelId(null);
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

                                {/* Actions */}
                                <div className="flex flex-col space-y-7 items-center pointer-events-auto">
                                    <button
                                        onClick={() => likeReel(reel.reelId)}
                                        className="flex flex-col items-center transition-transform hover:scale-110"
                                    >
                                        <Heart
                                            className={`w-8 h-8 ${reel.isLiked ? "text-red-500 fill-red-500" : "text-white"
                                                }`}
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
                        </div>
                    );
                })}
            </div>

            {/* Comments Bottom Sheet */}
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
                                onAddComment={(content) => addComment(activeReelId!, content)}
                                onReply={(commentId, content) => replyComment(activeReelId!, commentId, content)}
                                onLike={likeComment}
                                onClose={() => setActiveReelId(null)}
                                loadMore={() => fetchMoreComments(activeReelId!)}
                                hasMore={hasMoreComments}
                                currentUserId={currentUser?.userId}
                                onTyping={(isTyping) => sendTypingStatus(activeReelId!, isTyping)}
                                typingUsers={typingUsers}
                                title="Reel Comments"
                            />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Dialog */}
            <AnimatePresence>
                {deleteConfirmReelId && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setDeleteConfirmReelId(null)}
                            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-gray-900 rounded-2xl p-6 max-w-sm mx-4 border border-gray-800"
                            >
                                <h3 className="text-xl font-bold text-white mb-2">Delete Reel?</h3>
                                <p className="text-gray-400 mb-6">
                                    Are you sure you want to delete this reel? This action cannot be undone.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setDeleteConfirmReelId(null)}
                                        disabled={deleteLoading}
                                        className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => handleDeleteReel(deleteConfirmReelId)}
                                        disabled={deleteLoading}
                                        className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                                    >
                                        {deleteLoading ? "Deleting..." : "Delete"}
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Edit Caption Dialog */}
            <AnimatePresence>
                {editReelId && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setEditReelId(null)}
                            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-gray-900 rounded-2xl p-6 max-w-md w-full mx-4 border border-gray-800"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold text-white">Edit Caption</h3>
                                    <button
                                        onClick={() => setEditReelId(null)}
                                        className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
                                    >
                                        <X className="w-5 h-5 text-gray-400" />
                                    </button>
                                </div>
                                <textarea
                                    value={editCaption}
                                    onChange={(e) => setEditCaption(e.target.value)}
                                    placeholder="Write a caption..."
                                    className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
                                    rows={4}
                                    maxLength={500}
                                />
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm text-gray-400">{editCaption.length}/500</span>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setEditReelId(null)}
                                        disabled={updateLoading}
                                        className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUpdateReel}
                                        disabled={updateLoading}
                                        className="flex-1 px-4 py-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                                    >
                                        {updateLoading ? "Updating..." : "Update"}
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
