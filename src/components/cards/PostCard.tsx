"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Post } from "../../models/Post";
import {
  Heart,
  MessageCircle,
  Share2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Play,
  Volume2,
  VolumeX,
  Bookmark,
  MoreVertical,
  Edit,
  Trash2,
  AlertTriangle,
  Info,
} from "lucide-react";
import DeleteConfirmDialog from "../common/DeleteConfirmDialog";
import EditPostDialog from "../post/EditPostDialog";
import { useSocket } from "@/context/SocketContext";
import ImageComponent from "../media/ImageComponent";
import VideoComponent from "../media/VideoComponent";
import ShareDialog from "../common/ShareDialog";
import { generateShareLink } from "../../utils/linkUtils";
import ReportDialog from "../common/ReportDialog";
import AboutAccountDialog from "../common/AboutAccountDialog";
import { formatRelativeTime, formatCount } from "../../utils/formatterUtils";
import { getPostBackgroundColor } from "../../utils/postUtils";

interface PostCardProps {
  post: Post;
  currentUserId?: string;
  likePost: (postId: string) => void;
  savePost: (postId: string) => void;
  followUser: (userId: string) => void;
  deletePost: (postId: string) => Promise<boolean>;
  updatePost: (postId: string, caption: string, location?: string, visibility?: string) => Promise<boolean>;
  sharePost: (postId: string) => Promise<boolean>;
  openCommentSheet: (postId: string) => void;
}


function PostCard({ post, currentUserId, likePost, savePost, followUser, deletePost, updatePost, sharePost, openCommentSheet }: PostCardProps) {
  const router = useRouter();
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [playingVideo, setPlayingVideo] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showAboutDialog, setShowAboutDialog] = useState(false);
  // NEW: Share Dialog state
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [showHeartOverlay, setShowHeartOverlay] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { socket } = useSocket();

  useEffect(() => {
    if (socket && post.postId) {
      socket.emit('join', `post_${post.postId}`);
      return () => {
        socket.emit('leave', `post_${post.postId}`);
      };
    }
  }, [socket, post.postId]);

  const isOwnPost = currentUserId === post.userId;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  const handleDelete = async () => {
    setIsDeleting(true);
    const success = await deletePost(post.postId);
    setIsDeleting(false);
    if (success) {
      setShowDeleteDialog(false);
      setShowMenu(false);
    }
  };

  const goToNextMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!post.media) return;
    setCurrentMediaIndex((prev) => (prev + 1) % post.media.length);
  };

  const goToPrevMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!post.media) return;
    setCurrentMediaIndex((prev) =>
      (prev - 1 + post.media.length) % post.media.length
    );
  };

  const toggleVideoPlayback = () => setPlayingVideo((prev) => !prev);
  const toggleMute = () => setIsMuted((prev) => !prev);

  const rawMedia = post.media?.[currentMediaIndex];
  // Only treat as valid media if it has a valid filePath AND is not a placeholder
  const currentMedia = (rawMedia?.filePath && !rawMedia.filePath.includes('placeholder')) ? rawMedia : null;
  const hasMultipleMedia = (post.media?.filter(m => m?.filePath && !m.filePath.includes('placeholder'))?.length || 0) > 1;

  const isImage = (mimeType: string) => mimeType.startsWith("image/");
  const isVideo = (mimeType: string) => mimeType.startsWith("video/");

  const [isNotInterested, setIsNotInterested] = useState(false);
  const [isInterested, setIsInterested] = useState(false);

  const handleInterested = async () => {
    const { recordPostInterested } = await import("../../api/feed");
    const success = await recordPostInterested(post.postId);
    if (success) {
      setIsInterested(true);
      setShowMenu(false);
    }
  };

  const handleNotInterested = async () => {
    const { recordPostNotInterested } = await import("../../api/feed");
    const success = await recordPostNotInterested(post.postId);
    if (success) {
      setIsNotInterested(true);
      setShowMenu(false);
    }
  };

  const handleDoubleTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!post.userLiked) {
      likePost(post.postId);
    }
    setShowHeartOverlay(true);
    setTimeout(() => setShowHeartOverlay(false), 1000);
  };

  const handleLike = () => likePost(post.postId);

  if (isNotInterested) {
    return (
      <div className="flex flex-col gap-6 p-6 max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 text-center">
          <p className="text-gray-500 dark:text-gray-400">Thanks for the feedback! We'll show you fewer posts like this.</p>
          <button
            onClick={() => setIsNotInterested(false)}
            className="mt-2 text-sm text-blue-500 hover:underline"
          >
            Undo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-w-2xl mx-auto w-full mb-8">

      {/* Post header (Flutter style: Avatar | Name + Time | Options) */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push(`/profile/${post.userId}`)}>
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden border border-zinc-200 dark:border-zinc-700">
              {post.userMedia?.[0]?.filePath ? (
                <ImageComponent
                  path={post.userMedia[0].filePath}
                  alt={post.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-400 font-bold text-xs">
                  {post.displayName.slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="font-bold text-[14px] text-zinc-900 dark:text-white hover:underline decoration-zinc-400 underline-offset-2">
                {post.displayName}
              </span>
              <span className="text-[12px] text-zinc-500 dark:text-zinc-500">• {formatRelativeTime(post.createdAt)}</span>
              {!post.isFollowing && !isOwnPost && (
                <button
                  onClick={(e) => { e.stopPropagation(); followUser(post.userId); }}
                  className="ml-2 text-[13px] font-bold text-blue-500 hover:text-blue-600 active:scale-95 transition-all"
                >
                  Follow
                </button>
              )}
            </div>
            {post.location && (
              <span className="text-[12px] text-zinc-500 dark:text-zinc-500 -mt-0.5">
                {post.location}
              </span>
            )}
          </div>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-white hover:text-zinc-300 p-2 rounded-full transition-all"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-100 dark:border-zinc-800 z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
              {/* Menu Items (Same as before) */}
              {isOwnPost ? (
                <>
                  <button
                    onClick={() => { setShowEditDialog(true); setShowMenu(false); }}
                    className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-zinc-700 dark:text-zinc-200 text-sm font-medium"
                  >
                    <Edit className="w-4 h-4 text-zinc-400" />
                    Edit Post
                  </button>
                  <button
                    onClick={() => { setShowDeleteDialog(true); setShowMenu(false); }}
                    className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-red-600 dark:text-red-400 text-sm font-bold"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Post
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleInterested}
                    className={`w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-sm font-medium ${isInterested ? 'text-green-600 dark:text-green-400' : 'text-zinc-700 dark:text-zinc-200'}`}
                  >
                    <div className={`w-2 h-2 rounded-full ${isInterested ? 'bg-green-500 animate-pulse' : 'bg-zinc-200 dark:bg-zinc-700'}`} />
                    Show more like this
                  </button>
                  <button
                    onClick={handleNotInterested}
                    className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-zinc-700 dark:text-zinc-200 text-sm font-medium"
                  >
                    <div className="w-2 h-2 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                    Not interested
                  </button>
                  <button
                    onClick={() => { setShowReportDialog(true); setShowMenu(false); }}
                    className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-red-600 dark:text-red-400 text-sm font-medium"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Report Post
                  </button>
                  <button
                    onClick={() => { setShowAboutDialog(true); setShowMenu(false); }}
                    className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-zinc-900 dark:text-zinc-100 text-sm font-medium"
                  >
                    <Info className="w-4 h-4 text-zinc-400" />
                    About this account
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>


      {/* Post media OR Text-only Colored Box */}
      {currentMedia ? (
        // Added onDoubleClick for Like interaction
        <div
          className="relative w-full aspect-square sm:aspect-[4/5] max-h-[70vh] mx-auto bg-zinc-100 dark:bg-zinc-900 group overflow-hidden flex items-center justify-center cursor-pointer"
          onDoubleClick={handleDoubleTap}
        >
          {isImage(currentMedia.mimeType) && (
            <ImageComponent
              path={currentMedia.filePath}
              alt={currentMedia.altText || "Post image"}
              className="w-full h-full object-cover"
            />
          )}

          {isVideo(currentMedia.mimeType) && (
            <div className="relative w-full h-full">
              <VideoComponent
                path={currentMedia.filePath}
                className="w-full h-full object-cover"
                isMuted={isMuted}
                playing={playingVideo}
                onTogglePlay={toggleVideoPlayback}
                onToggleMute={toggleMute}
                poster={currentMedia.thumbnailPath}
              />
              {/* Video Controls and Overlays kept from original */}
              {!playingVideo && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[1px]">
                  {/* Play button remains centered */}
                </div>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 backdrop-blur-md p-2.5 rounded-full transition-all border border-white/10"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
              </button>
            </div>
          )}

          {/* Heart Overlay Animation */}
          {showHeartOverlay && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-in fade-in zoom-in duration-300">
              <Heart className="w-24 h-24 text-white fill-white drop-shadow-lg" />
            </div>
          )}


          {/* Pagination dots */}
          {hasMultipleMedia && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
              {post.media?.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === currentMediaIndex ? 'bg-white scale-125' : 'bg-white/40'}`}
                />
              ))}
            </div>
          )}

          {/* Media navigation arrows */}
          {hasMultipleMedia && (
            <>
              <button
                onClick={goToPrevMedia}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-md p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all border border-white/10"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={goToNextMedia}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-md p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all border border-white/10"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </>
          )}

          {/* Sensitive Content Overlay */}
          {currentMedia?.safeMode === 2 && !isRevealed && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500 bg-white/70 dark:bg-black/40 backdrop-blur-[10px]">
              <div className="relative flex flex-col items-center gap-4 max-w-[80%]">
                <Eye className="w-8 h-8 text-white" />
                <h3 className="text-white font-bold text-lg">Sensitive Content</h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsRevealed(true);
                  }}
                  className="mt-2 px-8 py-2.5 bg-white text-black dark:bg-zinc-100 dark:text-zinc-900 rounded-full font-bold text-sm"
                >
                  Show Content
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Text-only Post
        <div
          className={`relative w-full aspect-square sm:aspect-[4/5] max-h-[500px] mx-auto flex items-center justify-center p-8 text-center cursor-pointer overflow-hidden ${getPostBackgroundColor(post.postId)}`}
          onDoubleClick={handleDoubleTap}
        >
          {/* Heart Overlay Animation */}
          {showHeartOverlay && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-in fade-in zoom-in duration-300 z-50">
              <Heart className="w-24 h-24 text-white fill-white drop-shadow-lg" />
            </div>
          )}

          <div className="relative z-10 max-w-lg">
            <p className="text-white text-2xl font-bold leading-relaxed drop-shadow-sm font-serif italic">
              "{post.caption}"
            </p>
          </div>
        </div>
      )}

      {/* Action bar */}
      <div className="flex flex-col px-3 py-2">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 transition-all active:scale-90 ${post.userLiked ? "text-red-500" : "text-zinc-900 dark:text-white"}`}
            >
              <Heart className={`w-[26px] h-[26px] ${post.userLiked ? "fill-current" : ""}`} strokeWidth={post.userLiked ? 0 : 2} />
            </button>
            <button
              onClick={() => openCommentSheet(post.postId)}
              className="flex items-center gap-1.5 text-zinc-900 dark:text-white transition-colors"
            >
              <MessageCircle className="w-[26px] h-[26px]" />
              {parseInt(post.commentsCount || "0", 10) > 0 && (
                <span className="text-sm font-bold">{formatCount(post.commentsCount)}</span>
              )}
            </button>
            <button
              onClick={() => setShowShareDialog(true)}
              className="flex items-center gap-1.5 text-zinc-900 dark:text-white transition-colors"
            >
              <Share2 className="w-[26px] h-[26px]" />
            </button>
          </div>

          <button
            onClick={() => savePost(post.postId)}
            className={`transition-all active:scale-90 ${post.userSaved ? "text-zinc-900 dark:text-white" : "text-zinc-900 dark:text-white"}`}
          >
            <Bookmark className={`w-[26px] h-[26px] ${post.userSaved ? "fill-current" : ""}`} strokeWidth={post.userSaved ? 0 : 2} />
          </button>
        </div>

        {/* Likes Count Text Line */}
        <div className="text-[14px] font-bold text-zinc-900 dark:text-white mb-1">
          {formatCount(post.likesCount || "0")} likes
        </div>


        {/* Caption */}
        {post.caption && (
          <div className="mb-1">
            <div className="text-[14px] leading-[1.6] text-zinc-900 dark:text-zinc-100">
              <span className="font-bold mr-2 text-zinc-950 dark:text-white cursor-pointer" onClick={() => router.push(`/profile/${post.userId}`)}>
                {post.displayName}
              </span>
              {post.caption}
            </div>
            {/* Hashtags */}
            {post.hashtags && (
              <div className="flex flex-wrap gap-1 pt-0.5">
                {post.hashtags.split(' ').map((tag, i) => (
                  <span key={i} className="text-[13px] text-blue-500 hover:text-blue-600 cursor-pointer">
                    {tag.startsWith('#') ? tag : `#${tag}`}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* View all comments */}
        {parseInt(post.commentsCount || "0", 10) > 0 && (
          <button
            onClick={() => openCommentSheet(post.postId)}
            className="text-left text-[13px] text-zinc-500 dark:text-zinc-400 mt-1 cursor-pointer"
          >
            View all {formatCount(post.commentsCount)} comments
          </button>
        )}
      </div>

      {/* Dialogs */}
      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
        isDeleting={isDeleting}
      />

      <EditPostDialog
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        onSave={() => setShowEditDialog(false)}
        postId={post.postId}
        initialCaption={post.caption || ""}
        initialLocation={post.location || ""}
        initialVisibility={post.visibility || "public"}
      />

      <ShareDialog
        isOpen={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        link={generateShareLink('post', post.postId)}
        title="Share this post"
        onShareToFeed={() => sharePost(post.postId)}
      />

      <ReportDialog
        isOpen={showReportDialog}
        onClose={() => setShowReportDialog(false)}
        targetId={post.postId}
        targetType="post"
        reportedUserId={post.userId}
      />

      <AboutAccountDialog
        isOpen={showAboutDialog}
        onClose={() => setShowAboutDialog(false)}
        userId={post.userId}
      />
    </div>
  );
}

export default PostCard;
