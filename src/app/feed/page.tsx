"use client";
import React, { useState, useContext, useEffect } from "react";
import { PlusSquare, Loader2 } from "lucide-react";
import { PostContext } from "@/context/PostContext";
import { AuthContext } from "@/context/AuthContext";
import PostCard from "@/components/cards/PostCard";
import CommentSheet from "@/components/post/CommentsSheet";
import CreatePostDialog from "@/components/post/CreatePostDialog";
import CreateStoryDialog from "@/components/create/CreateStoryDialog";
import CreateReelDialog from "@/components/create/CreateReelDialog";
import CreateSelectionDialog from "@/components/create/CreateSelectionDialog";
import Dashboard from "@/components/dashboard/Dashboard";
import StoriesBar from "@/components/stories/StoriesBar";

import { FeedSkeleton } from "@/components/skeletons/PostSkeleton";

function Feed() {
  const { posts, loading, likePost, savePost, followUser, deletePost, updatePost, sharePost, createPost, fetchFeedPosts, hasMore, feedPage } = useContext(PostContext);
  const { user } = useContext(AuthContext) || {};
  const [openCommentSheet, setOpenCommentSheet] = useState(false);
  const [openSelectionDialog, setOpenSelectionDialog] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openStoryDialog, setOpenStoryDialog] = useState(false);
  const [openReelDialog, setOpenReelDialog] = useState(false);
  const [postId, setPostId] = useState("");
  const [storiesKey, setStoriesKey] = useState(0);

  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const observerTarget = React.useRef(null);

  useEffect(() => {
    if (posts.length === 0) {
      fetchFeedPosts(1);
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          if (hasMore && !loading && !isFetchingMore) {
            loadMorePosts();
          }
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    }
  }, [hasMore, loading, isFetchingMore, feedPage]);

  const loadMorePosts = async () => {
    setIsFetchingMore(true);
    const nextPage = feedPage + 1;
    await fetchFeedPosts(nextPage);
    setIsFetchingMore(false);
  };

  const handleOpenComments = (id: string) => {
    setPostId(id);
    setOpenCommentSheet(true);
  };

  const handleCreateSelection = (type: "post" | "story" | "reel") => {
    setOpenSelectionDialog(false);
    if (type === "post") {
      setOpenCreateDialog(true);
    } else if (type === "story") {
      setOpenStoryDialog(true);
    } else if (type === "reel") {
      setOpenReelDialog(true);
    }
  };

  if (loading && feedPage === 1) return <FeedSkeleton />;

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto w-full">
      {/* Stories Bar */}
      <StoriesBar key={storiesKey} />

      {/* Create Post Button */}
      <div className="mb-6 flex-shrink-0 px-1">
        <button
          onClick={() => setOpenSelectionDialog(true)}
          className="w-full bg-zinc-900 dark:bg-white text-white dark:text-black py-3 px-6 rounded-2xl font-bold hover:opacity-90 active:scale-[0.98] transition-all duration-200 flex items-center justify-center space-x-3 group shadow-xl shadow-zinc-200 dark:shadow-none"
        >
          <PlusSquare className="w-5 h-5" />
          <span className="text-[15px] tracking-tight">Create New Post</span>
        </button>
      </div>

      {/* Scrollable Post List */}
      <div className="flex-1 space-y-4 pb-8">
        {!posts || posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-6">
              <span className="text-4xl">🦩</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No posts yet</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm">
              Be the first to share something amazing with your followers!
            </p>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <div key={post.postId} className="transform transition-all duration-300 hover:translate-y-[-2px]">
                <PostCard
                  post={post}
                  key={post.postId}
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
            ))}

            {/* Observer Target */}
            <div ref={observerTarget} className="h-20 flex flex-col items-center justify-center border-t border-transparent">
              {isFetchingMore ? (
                <div className="flex items-center space-x-2 text-purple-600">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm font-medium">Loading more posts...</span>
                </div>
              ) : hasMore ? (
                <div className="text-zinc-400 text-xs italic py-4">Scroll for more</div>
              ) : posts.length > 0 ? (
                <div className="text-zinc-400 text-xs italic py-4">You've seen everything</div>
              ) : null}
            </div>
          </>
        )}

        {/* Create Selection Dialog */}
        <CreateSelectionDialog
          isOpen={openSelectionDialog}
          onClose={() => setOpenSelectionDialog(false)}
          onSelect={handleCreateSelection}
        />

        {/* Create Post Dialog */}
        <CreatePostDialog
          isOpen={openCreateDialog}
          onClose={() => setOpenCreateDialog(false)}
          onSubmit={createPost}
        />

        {/* Create Story Dialog */}
        <CreateStoryDialog
          isOpen={openStoryDialog}
          onClose={() => setOpenStoryDialog(false)}
          onSubmit={(story) => {
            console.log("Story created:", story);
            setStoriesKey(prev => prev + 1);
          }}
        />

        {/* Create Reel Dialog */}
        <CreateReelDialog
          isOpen={openReelDialog}
          onClose={() => setOpenReelDialog(false)}
          onSubmit={(reel) => {
            console.log("Reel created:", reel);
            // Optionally refresh reels
          }}
        />

        {/* Comment Dialog */}
        {openCommentSheet && (
          <CommentSheet
            postId={postId}
            onClose={() => setOpenCommentSheet(false)}
          />
        )}
      </div>
    </div>
  );
}

export default function SocialMediaApp() {
  return (
    <Dashboard>
      <Feed />
    </Dashboard>
  );
}
