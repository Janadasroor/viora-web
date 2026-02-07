"use client";
import React, { useContext, useEffect, useState, useRef } from "react";
import { useSocket } from "@/context/SocketContext";
import { useRouter } from "next/navigation";
import { ReelContext } from "@/context/ReelContext";
import {
  Heart,
  MessageCircle,
  Share2,
  ArrowLeft,
  Camera,
  Music,
  MoreVertical,
  Plus,
  Check,
  Loader2,
  User
} from "lucide-react";
import ReelPlayer, { ReelPlayerRef } from "@/components/ReelPlayer";
import CommentsSection from "@/components/CommentsSection";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { followUser, unfollowUser } from "@/api/users";
import Image from "next/image";


export default function ReelsPage() {
  const router = useRouter();
  const { reels, fetchReelFeed, likeReel, incrementReelViews, comments, fetchComments, fetchMoreComments, hasMoreComments, addComment, replyComment, likeComment, typingUsers, sendTypingStatus } = useContext(ReelContext);

  const { user: currentUser } = useAuth();
  const { socket } = useSocket();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeReelId, setActiveReelId] = useState<string | null>(null);
  const [followLoading, setFollowLoading] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRefs = useRef<Map<string, ReelPlayerRef>>(new Map());


  useEffect(() => {
    fetchReelFeed();
  }, []);

  useEffect(() => {
    // Increment views immediately when a new reel is in viewport (Postgres count)
    if (reels[currentIndex]) {
      incrementReelViews(reels[currentIndex].reelId);
    }
  }, [currentIndex, reels]);

  useEffect(() => {
    if (socket && reels[currentIndex]) {
      const reelId = reels[currentIndex].reelId;
      socket.emit('join', `reel_${reelId}`);
      return () => {
        socket.emit('leave', `reel_${reelId}`);
      };
    }
  }, [socket, currentIndex, reels]);

  useEffect(() => {
    if (activeReelId) {
      fetchComments(activeReelId);
    }
  }, [activeReelId]);


  // Intersection Observer to detect current reel
  useEffect(() => {
    if (!containerRef.current) return;

    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.8, // More strict threshold for reels
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const index = parseInt(entry.target.getAttribute("data-index") || "0");
        if (entry.isIntersecting) {
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

  const handleFollowToggle = async (userId: string) => {
    if (!currentUser) return;
    setFollowLoading(userId);
    try {
      await followUser(userId);
      // Optionally update local list if we had isFollowing state per reel
      // For now, let's just assume it works or we'd need to fetch profile status
    } catch (error) {
      console.error("Failed to follow user:", error);
    } finally {
      setFollowLoading(null);
    }
  };

  if (!reels || reels.length === 0)
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        No reels yet
      </div>
    );

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Transparent Header */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full bg-black/20 backdrop-blur-md text-white border border-white/10 hover:bg-black/40 transition-all pointer-events-auto"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-white tracking-tight">Reels</h1>
        <button
          onClick={() => router.push("/create-reel")}
          className="p-2 rounded-full bg-black/20 backdrop-blur-md text-white border border-white/10 hover:bg-black/40 transition-all pointer-events-auto"
        >
          <Camera className="w-6 h-6" />
        </button>
      </div>

      <div
        ref={containerRef}
        className="flex flex-col w-full h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth scrollbar-hide"
        style={{ scrollSnapType: "y mandatory" }}
      >
        {reels.map((reel, index) => {
          const media = reel.media?.[0];
          const variants = media?.variants || [];
          const filePath = media?.filePath || "";
          const isActive = index === currentIndex;

          return (
            <div
              key={reel.reelId}
              data-reel-item
              data-index={index}
              className="snap-start snap-always w-full h-screen min-h-screen max-h-screen relative flex items-center justify-center bg-black flex-shrink-0"
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
                  autoPlay={isActive}
                  muted={true}
                  loop={true}
                  isActive={isActive}
                  onViewComplete={(watchTime, duration) => {
                    incrementReelViews(reel.reelId, watchTime, duration);
                  }}
                  className="w-full h-full"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-white/50 bg-neutral-900">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <p className="text-sm">Loading Reel...</p>
                  </div>
                </div>
              )}

              {/* Right Action Stack */}
              <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6 z-30">
                <motion.button
                  whileTap={{ scale: 0.8 }}
                  onClick={() => likeReel(reel.reelId)}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 group-hover:bg-white/20 transition-all">
                    <Heart
                      className={`w-7 h-7 transition-colors ${reel.isLiked ? "fill-red-500 text-red-500" : "text-white"
                        }`}
                    />
                  </div>
                  <span className="text-xs font-semibold text-white drop-shadow-md">
                    {reel.likesCount}
                  </span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.8 }}
                  onClick={() => setActiveReelId(reel.reelId)}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 group-hover:bg-white/20 transition-all">
                    <MessageCircle className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-white drop-shadow-md">
                    {reel.commentsCount}
                  </span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.8 }}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 group-hover:bg-white/20 transition-all">
                    <Share2 className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-white drop-shadow-md">
                    {reel.sharesCount}
                  </span>
                </motion.button>

                <button className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all text-white">
                  <MoreVertical className="w-5 h-5" />
                </button>

                {reel.audioUrl && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="w-10 h-10 rounded-full border-2 border-white/30 p-1 mt-2"
                  >
                    <div className="w-full h-full rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center">
                      <Music className="w-5 h-5 text-white" />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Bottom Info Card */}
              <div className="absolute left-4 bottom-8 right-20 z-30 pointer-events-none">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 max-w-md pointer-events-auto"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      onClick={() => router.push(`/profile/${reel.userId}`)}
                      className="relative w-10 h-10 rounded-full border-2 border-purple-500 p-0.5 cursor-pointer bg-neutral-800 flex items-center justify-center overflow-hidden"
                    >
                      {reel.profilePictureUrl ? (
                        <Image
                          src={reel.profilePictureUrl}
                          alt={reel.username}
                          width={40}
                          height={40}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-white/50" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          onClick={() => router.push(`/profile/${reel.userId}`)}
                          className="font-bold text-white text-sm hover:underline cursor-pointer truncate"
                        >
                          {reel.username}
                        </span>
                        {currentUser?.userId !== reel.userId && (
                          <button
                            onClick={() => handleFollowToggle(reel.userId)}
                            disabled={followLoading === reel.userId}
                            className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-[10px] font-bold text-white transition-all disabled:opacity-50"
                          >
                            {followLoading === reel.userId ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <div className="flex items-center gap-1">
                                <Plus className="w-3 h-3" />
                                Follow
                              </div>
                            )}
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-white/60 mt-0.5">
                        <Music className="w-3 h-3" />
                        <span className="truncate">Original audio</span>
                      </div>
                    </div>
                  </div>

                  {reel.caption && (
                    <p className="text-sm text-white/90 line-clamp-2 leading-relaxed">
                      {reel.caption}
                    </p>
                  )}
                </motion.div>
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
                onAddComment={(content) => addComment(activeReelId, content)}
                onReply={(commentId, content) => replyComment(activeReelId, commentId, content)}
                onLike={likeComment}
                onClose={() => setActiveReelId(null)}
                loadMore={() => fetchMoreComments(activeReelId)}
                hasMore={hasMoreComments}
                currentUserId={currentUser?.userId}
                onTyping={(isTyping) => sendTypingStatus(activeReelId, isTyping)}
                typingUsers={typingUsers}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
