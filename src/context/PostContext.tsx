"use client";
import { Comment } from "@/models/Comment";

import { useState, createContext, useEffect, useCallback, useContext } from "react";
import { useSocket } from "@/context/SocketContext";
import { useAuth } from "@/context/AuthContext";
import type { Post } from "../models/Post";
import { getFeedPosts, getPostsByHashtag, getSuggestedPosts, getTrendingPosts, getTrendingHashtags, type TrendingHashtag } from "@/api/feed";
import { postInteractionsApi } from "@/api/posts/interactions";
import { a } from "framer-motion/client";
import { getComments, commentPost, likePostComment, unlikePostComment, updatePostComment } from "@/api/posts/comments";
import { createPost as createPostApi, savePost as savePostApi, removeSavedPost, deletePost as deletePostApi, updatePost as updatePostApi, sharePost as sharePostApi } from "@/api/posts/index";
import { followUser as followUserApi, unfollowUser as unfollowUserApi } from "@/api/users";
import type { CreatePostRequest, CreatePostResponse } from "@/models/PostRequests";

export const PostContext = createContext({
  posts: [] as Post[],
  comments: [] as Comment[],
  commentsNextCursor: undefined as string | undefined,
  hasMoreComments: true,
  addPost: (p: Post) => { },
  refreshPosts: (posts: Post[]) => { },
  likePost: (postId: string) => { },
  savePost: (postId: string) => { },
  sharePost: (postId: string) => Promise.resolve(false),
  followUser: (userId: string) => { },
  deletePost: (postId: string) => Promise.resolve(false),
  updatePost: (postId: string, caption: string, location?: string, visibility?: string) => Promise.resolve(false),
  createPost: async (request: CreatePostRequest) => Promise.resolve(null as CreatePostResponse | null),
  fetchComments: (postId: string, limit?: number) => { },
  fetchMoreComments: (postId: string, limit?: number) => { },
  clearComments: () => { },
  sendTypingStatus: (postId: string, isTyping: boolean) => { },
  typingUsers: [] as { userId: string; username: string }[],
  addComment: async (postId: string, content: string) => { },
  updateComment: async (commentId: string, content: string) => Promise.resolve(false),
  replyComment: async (postId: string, commentId: string, content: string) => { },
  likeComment: async (commentId: string) => { },
  loading: true,
  fetchSuggestedPosts: (page?: number, limit?: number) => { },
  fetchHashtagPosts: (hashtag: string, page?: number, limit?: number, sortBy?: string) => { },
  fetchTrendingPosts: (page?: number, limit?: number, timeRange?: string) => { },
  fetchTrendingHashtags: (limit?: number, timeRange?: string) => Promise.resolve([] as TrendingHashtag[]),
  fetchFeedPosts: (page?: number, limit?: number) => { },
  hasMore: true,
  feedPage: 1,
  setFeedPage: (page: number) => { },
});



function PostProvider({ children }: any) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsNextCursor, setCommentsNextCursor] = useState<string | undefined>(undefined);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [typingUsers, setTypingUsers] = useState<{ userId: string; username: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [feedPage, setFeedPage] = useState(1);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const { socket } = useSocket();
  const { user } = useAuth();

  const sortComments = (list: Comment[]): Comment[] => {
    return [...list].sort((a, b) => {
      // 1. Pinned comments first
      const pinA = Number(a.isPinnedInt ?? 0);
      const pinB = Number(b.isPinnedInt ?? 0);
      if (pinA !== pinB) return pinB - pinA;

      // 2. Most liked next
      const likesA = BigInt(a.likesCount || "0");
      const likesB = BigInt(b.likesCount || "0");
      if (likesB !== likesA) return likesB > likesA ? 1 : -1;

      // 3. Keep chronology for equal likes (Oldest first as per backend ASC)
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  };

  useEffect(() => {
    if (!socket) return;

    const handleNewComment = (newComment: any) => {
      // 1. Ignore if it's our own comment (handled via optimistic update & API response)
      if (user && newComment.userId === user.userId) return;

      // 2. Check if this comment belongs to the post currently being viewed
      if (newComment.postId === activeCommentPostId || newComment.reelId === activeCommentPostId) {
        setComments(prev => {
          // 3. Avoid duplicates just in case
          const exists = prev.some(c => c.commentId === newComment.commentId);
          if (exists) return prev;

          // Transform broadcast data to Comment model if needed
          const transformedComment: Comment = {
            ...newComment,
            likesCount: "0",
            repliesCount: "0",
            isPinned: false,
            isPinnedInt: 0,
            isEdited: false,
            userLiked: false,
            replies: []
          };

          // If it's a reply, we should ideally handle it differently, 
          // but for simplicity let's just prepend to main list or refetch
          if (newComment.parentCommentId) {
            return prev.map(c => {
              if (c.commentId === newComment.parentCommentId) {
                const currentCount = BigInt(c.repliesCount || "0");
                return { ...c, replies: [...(c.replies || []), transformedComment], repliesCount: (currentCount + BigInt(1)).toString() };
              }
              return c;
            });
          }

          return sortComments([...prev, transformedComment]);
        });
      }
    };

    const handleLikeUpdate = (data: any) => {
      // Ignore if it's our own action (already handled optimistically)
      if (user && data.userId === user.userId) return;

      if (data.postId) {
        setPosts(prev => prev.map(p =>
          p.postId === data.postId ? { ...p, likesCount: String(data.count) } : p
        ));
      }

      if (data.reelId) {
        setPosts(prev => prev.map(p =>
          p.postId === data.reelId ? { ...p, likesCount: String(data.count) } : p
        ));
      }

      if (data.commentId) {
        setComments(prev => {
          const updated = prev.map(c => {
            if (c.commentId === data.commentId) {
              return { ...c, likesCount: String(data.count) };
            }
            if (c.replies) {
              const updatedReplies = c.replies.map(r =>
                r.commentId === data.commentId ? { ...r, likesCount: String(data.count) } : r
              );
              return { ...c, replies: updatedReplies };
            }
            return c;
          });
          return sortComments(updated);
        });
      }
    };

    const handleUserTypingComment = (data: { userId: string; targetId: string; targetType: string; isTyping: boolean }) => {
      if (data.targetType === 'post' && data.targetId === activeCommentPostId) {
        if (data.isTyping) {
          setTypingUsers(prev => {
            if (prev.find(u => u.userId === data.userId)) return prev;
            return [...prev, { userId: data.userId, username: 'Someone' }];
          });
        } else {
          setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
        }
      }
    };

    socket.on('postLiked', handleLikeUpdate);
    socket.on('newComment', handleNewComment);
    socket.on('userTypingComment', handleUserTypingComment);

    return () => {
      socket.off('postLiked', handleLikeUpdate);
      socket.off('newComment', handleNewComment);
      socket.off('userTypingComment', handleUserTypingComment);
    };
  }, [socket, activeCommentPostId, user]);

  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);

  // ... (keeping useEffects and other methods same)

  const fetchSuggestedPosts = async (page = 1, limit = 20) => {
    setLoading(true);
    const { data, hasMore: more } = await getSuggestedPosts(page, limit);
    if (page === 1) {
      setPosts(data);
    } else {
      setPosts(prev => [...prev, ...data]);
    }
    setHasMore(more);
    setLoading(false);
  };

  const fetchFeedPosts = async (pageArg?: number, limit = 10) => {
    // ... (keep fetchFeedPosts same for now as it uses getFeedPosts which is unoptimized)
    const targetPage = pageArg || feedPage;
    if (targetPage === 1) setLoading(true);
    try {
      const { data, hasMore: more } = await getFeedPosts(targetPage, limit);
      if (targetPage === 1) {
        setPosts(data);
      } else {
        // Appending posts for infinite scroll
        setPosts(prev => {
          // Avoid duplicates by checking postIds
          const existingIds = new Set(prev.map(p => p.postId));
          const newPosts = data.filter(p => !existingIds.has(p.postId));
          return [...prev, ...newPosts];
        });
      }
      setHasMore(more);
      setFeedPage(targetPage);
    } catch (error) {
      console.error("Failed to load posts", error);
    } finally {
      if (targetPage === 1) setLoading(false);
    }
  };

  const fetchHashtagPosts = async (hashtag: string, page = 1, limit = 20, sortBy?: string) => {
    setLoading(true);
    // If page is 1, reset cursor. If page > 1, use current nextCursor
    const cursor = page === 1 ? undefined : nextCursor;

    const { data, hasMore: more, nextCursor: newCursor } = await getPostsByHashtag(hashtag, page, limit, sortBy, cursor);

    if (page === 1) {
      setPosts(data);
    } else {
      setPosts(prev => [...prev, ...data]);
    }
    setHasMore(more);
    setNextCursor(newCursor);
    setLoading(false);
  };

  const fetchTrendingPosts = async (page = 1, limit = 20, timeRange?: string) => {
    setLoading(true);
    const cursor = page === 1 ? undefined : nextCursor;

    const { data, hasMore: more, nextCursor: newCursor } = await getTrendingPosts(page, limit, timeRange, cursor);
    if (page === 1) {
      setPosts(data);
    } else {
      setPosts(prev => [...prev, ...data]);
    }
    setHasMore(more);
    setNextCursor(newCursor);
    setLoading(false);
  };

  const fetchTrendingHashtags = async (limit = 10, timeRange?: string): Promise<TrendingHashtag[]> => {
    const data = await getTrendingHashtags(limit, timeRange);
    return data;
  };

  const clearComments = useCallback(() => {
    setActiveCommentPostId(null);
    setComments([]);
  }, []);

  const fetchComments = async (postId: string, limit = 20) => {
    // Leave previous post room if any
    clearComments();
    setCommentsNextCursor(undefined);
    setHasMoreComments(true);

    setActiveCommentPostId(postId);

    // Join new post room
    if (socket) {
      socket.emit('join', `post_${postId}`);
      socket.emit('join', `reel_${postId}`);
    }

    const res = await getComments(postId, "post", null, limit);
    if (res.success) {
      setComments(sortComments(res.data));
      setCommentsNextCursor(res.nextCursor);
      setHasMoreComments(!!res.nextCursor);
    }
  };

  const sendTypingStatus = (postId: string, isTyping: boolean) => {
    if (socket) {
      socket.emit('commentTyping', { targetId: postId, targetType: 'post', isTyping });
    }
  };

  const fetchMoreComments = async (postId: string, limit = 20) => {
    if (!commentsNextCursor || !hasMoreComments) return;

    const res = await getComments(postId, "post", commentsNextCursor, limit);

    if (res.success) {
      setComments(prev => {
        const existingIds = new Set(prev.map(c => c.commentId));
        const newComments = res.data.filter(c => !existingIds.has(c.commentId));
        return sortComments([...prev, ...newComments]);
      });
      setCommentsNextCursor(res.nextCursor);
      setHasMoreComments(!!res.nextCursor);
    }
  };


  const addComment = async (postId: string, content: string) => {
    // Optimistic update
    const tempId = Date.now().toString();
    const newComment: Comment = {
      commentId: tempId,
      content,
      likesCount: "0",
      repliesCount: "0",
      isPinned: false,
      isPinnedInt: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isEdited: false,
      username: user?.username || "Me",
      userId: user?.userId || "",
      displayName: user?.displayName || user?.username || "Me",
      isVerified: user?.isVerified || false,
      userLiked: false,
      userMedia: user?.media || [],
      replies: []
    };

    setComments(prev => sortComments([...prev, newComment]));

    try {
      const res = await commentPost(postId, { content });
      // The API now returns data: { success: true, commentId: '...' }
      if (res.success && res.data?.commentId) {
        setComments(prev => prev.map(c => c.commentId === tempId ? { ...c, commentId: res.data.commentId } : c));
      } else {
        // If no commentId returned, remove the optimistic comment
        console.warn('Comment created but no commentId returned');
        setComments(prev => prev.filter(c => c.commentId !== tempId));
      }
    } catch (error) {
      console.error("Failed to add comment", error);
      setComments(prev => prev.filter(c => c.commentId !== tempId));
    }
  };

  const replyComment = async (postId: string, commentId: string, content: string) => {
    try {
      const res = await commentPost(postId, { content, parentCommentId: commentId });
      // The API returns data: { success: true, commentId: '...' }
      if (res.success && res.data?.commentId) {
        const newReply: Comment = {
          commentId: res.data.commentId,
          content,
          likesCount: "0",
          repliesCount: "0",
          isPinned: false,
          isPinnedInt: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isEdited: false,
          username: user?.username || "Me",
          userId: user?.userId || "",
          displayName: user?.displayName || user?.username || "Me",
          isVerified: user?.isVerified || false,
          userLiked: false,
          userMedia: user?.media || [],
          replies: [],
          parentCommentId: commentId
        };

        setComments(prev => prev.map(c => {
          if (c.commentId === commentId) {
            const currentCount = BigInt(c.repliesCount || "0");
            return { ...c, replies: [...(c.replies || []), newReply], repliesCount: (currentCount + BigInt(1)).toString() };
          }
          return c;
        }));
      }
    } catch (error) {
      console.error("Failed to reply", error);
    }
  };

  const updateComment = async (commentId: string, content: string): Promise<boolean> => {
    // Optimistic update
    const oldComments = [...comments]; // Shallow copy appropriately? Deep copy might be needed if we mutate deeply.
    // For optimistic update, we need to find the comment (could be nested).
    // Let's just assume top level for simplicity first, or traverse.

    const updateInList = (list: Comment[]): Comment[] => {
      return list.map(c => {
        if (c.commentId === commentId) {
          return { ...c, content, isEdited: true };
        }
        if (c.replies) {
          return { ...c, replies: updateInList(c.replies) };
        }
        return c;
      });
    }

    setComments(prev => updateInList(prev));

    try {
      // The API expects string for commentId roughly, but our model uses string.
      // API definition: updatePostComment(commentId: string, ...)
      // We should parse it.
      const res = await updatePostComment(commentId, { content });
      if (res.success) {
        return true;
      } else {
        // Revert
        setComments(oldComments);
        return false;
      }
    } catch (error) {
      console.error("Failed to update comment", error);
      setComments(oldComments);
      return false;
    }
  };

  const likeComment = async (commentId: string) => {
    let wasLiked = false;

    // Functional update to ensure we use latest state
    setComments(prev => {
      // First pass: find current like status
      const checkLike = (list: Comment[]) => {
        for (const c of list) {
          if (c.commentId === commentId) {
            wasLiked = c.userLiked;
            return;
          }
          if (c.replies) checkLike(c.replies);
        }
      };
      checkLike(prev);

      // Second pass: update state
      const updateLike = (list: Comment[]): Comment[] => {
        return list.map(c => {
          if (c.commentId === commentId) {
            const newLiked = !c.userLiked;
            const currentLikes = BigInt(c.likesCount || "0");
            const newLikes = newLiked ? currentLikes + BigInt(1) : (currentLikes > BigInt(0) ? currentLikes - BigInt(1) : BigInt(0));
            return {
              ...c,
              userLiked: newLiked,
              likesCount: newLikes.toString()
            };
          }
          if (c.replies) {
            return { ...c, replies: updateLike(c.replies) };
          }
          return c;
        });
      };
      const updated = updateLike(prev);
      return sortComments(updated);
    });

    try {
      // Note: wasLiked here is the state BEFORE the setComments run above finished, 
      // but because we are in an async function, we should be careful.
      // However, for a user click, this is generally fine.
      if (wasLiked) {
        await unlikePostComment(commentId);
      } else {
        await likePostComment(commentId);
      }
    } catch (error) {
      console.error("Failed to toggle like", error);
    }
  };

  const addPost = (newPost: Post) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const refreshPosts = (newPosts: Post[]) => {
    setPosts([...newPosts]);
  };

  const likePost = async (postId: string) => {
    // Optimistic toggle
    let isCurrentlyLiked = false;
    setPosts(prev => prev.map(p => {
      if (p.postId === postId) {
        isCurrentlyLiked = p.userLiked;
        const newLiked = !isCurrentlyLiked;
        const currentLikes = BigInt(p.likesCount || "0");
        const newLikes = newLiked ? currentLikes + BigInt(1) : (currentLikes > BigInt(0) ? currentLikes - BigInt(1) : BigInt(0));
        return {
          ...p,
          userLiked: newLiked,
          likesCount: newLikes.toString()
        };
      }
      return p;
    }));

    try {
      if (isCurrentlyLiked) {
        await postInteractionsApi.unlikePost(postId);
      } else {
        await postInteractionsApi.likePost(postId);
      }
    } catch (error) {
      console.error("Failed to toggle post like", error);
      // Revert logic could be added here
    }
  };

  const savePost = async (postId: string) => {
    // Find post to check current status
    const post = posts.find(p => p.postId === postId);
    if (!post) return;

    const isSaved = post.userSaved;

    // Optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p.postId === postId ? { ...p, userSaved: !isSaved } : p
      )
    );

    try {
      if (isSaved) {
        await removeSavedPost(postId);
      } else {
        await savePostApi(postId);
      }
    } catch (error) {
      console.error("Failed to toggle save post", error);
      // Revert
      setPosts((prev) =>
        prev.map((p) =>
          p.postId === postId ? { ...p, userSaved: isSaved } : p
        )
      );
    }
  };

  const followUser = async (userId: string) => {
    const targetPost = posts.find(p => p.userId === userId);
    if (!targetPost) return;
    const wasFollowing = targetPost.isFollowing;

    // Optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p.userId === userId ? { ...p, isFollowing: !wasFollowing } : p
      )
    );

    try {
      if (wasFollowing) {
        await unfollowUserApi(userId);
      } else {
        await followUserApi(userId);
      }
    } catch (error) {
      console.error("Failed to toggle follow", error);
      // Revert
      setPosts((prev) =>
        prev.map((p) =>
          p.userId === userId ? { ...p, isFollowing: wasFollowing } : p
        )
      );
    }
  };

  const deletePost = async (postId: string): Promise<boolean> => {
    // Optimistic update - remove post immediately
    const deletedPost = posts.find(p => p.postId === postId);
    setPosts((prev) => prev.filter((p) => p.postId !== postId));

    try {
      const success = await deletePostApi(postId);
      if (!success && deletedPost) {
        // Revert if failed
        setPosts((prev) => [...prev, deletedPost]);
      }
      return success;
    } catch (error) {
      console.error("Failed to delete post", error);
      // Revert on error
      if (deletedPost) {
        setPosts((prev) => [...prev, deletedPost]);
      }
      return false;
    }
  };

  const updatePost = async (
    postId: string,
    caption: string,
    location?: string,
    visibility?: string
  ): Promise<boolean> => {
    // Optimistic update
    const oldPost = posts.find(p => p.postId === postId);
    setPosts((prev) =>
      prev.map((p) =>
        p.postId === postId
          ? { ...p, caption, location: location || p.location, visibility: visibility as any || p.visibility }
          : p
      )
    );

    try {
      const success = await updatePostApi(postId, {
        caption,
        location,
        visibility: visibility as any,
      });

      if (!success && oldPost) {
        // Revert if failed
        setPosts((prev) =>
          prev.map((p) => (p.postId === postId ? oldPost : p))
        );
      }
      return success;
    } catch (error) {
      console.error("Failed to update post", error);
      // Revert on error
      if (oldPost) {
        setPosts((prev) =>
          prev.map((p) => (p.postId === postId ? oldPost : p))
        );
      }
      return false;
    }
  };

  const createPost = async (request: CreatePostRequest): Promise<CreatePostResponse | null> => {
    try {
      const response = await createPostApi(request);
      if (response) {
        // Refresh posts to include the new post
        const { data, hasMore: more } = await getFeedPosts();
        setPosts(data);
        setHasMore(more);
        return response; // Return the response so the dialog can access the post ID
      }
      return null;
    } catch (error) {
      console.error("Failed to create post:", error);
      throw error;
    }
  };

  const sharePost = async (postId: string): Promise<boolean> => {
    try {
      const success = await sharePostApi(postId);
      if (success) {
        setPosts((prev) =>
          prev.map((p) =>
            p.postId === postId ? { ...p, sharesCount: (BigInt(p.sharesCount || "0") + BigInt(1)).toString() } : p
          )
        );
      }
      return success;
    } catch (error) {
      console.error("Failed to share post:", error);
      return false;
    }
  };

  return (
    <PostContext.Provider
      value={{ posts, addPost, refreshPosts, likePost, savePost, sharePost, followUser, deletePost, updatePost, createPost, loading, comments, commentsNextCursor, hasMoreComments, fetchComments, fetchMoreComments, clearComments, typingUsers, sendTypingStatus, addComment, updateComment, replyComment, likeComment, fetchSuggestedPosts, fetchHashtagPosts, fetchTrendingPosts, fetchTrendingHashtags, fetchFeedPosts, hasMore, feedPage, setFeedPage }}
    >
      {children}
    </PostContext.Provider>
  );
}

export default PostProvider;
