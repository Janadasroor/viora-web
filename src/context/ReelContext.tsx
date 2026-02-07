"use client"

import { apiIncrementReelViews, getReelsFeed, apiLikeReel, apiUnlikeReel } from "@/api/reels";
import { getComments, commentReel, likePostComment, unlikePostComment } from "@/api/posts/comments";
import type { ReelWithUser } from "@/types/api/reel.types";
import type { Comment } from "@/models/Comment";
import { createContext, useEffect, useState, useCallback } from "react";
import { useSocket } from "@/context/SocketContext";
import { useAuth } from "@/context/AuthContext";


export const ReelContext = createContext({
  reels: [] as ReelWithUser[],
  comments: [] as Comment[],
  fetchReelFeed: (page?: number, limit?: number) => { },
  likeReel: (reelId: string) => { },
  incrementReelViews: (reelId: string, watchTime?: number, duration?: number) => { },
  fetchComments: (reelId: string) => { },
  fetchMoreComments: (reelId: string) => { },
  sendTypingStatus: (reelId: string, isTyping: boolean) => { },
  typingUsers: [] as { userId: string; username: string }[],
  addComment: (reelId: string, content: string) => Promise.resolve(),
  replyComment: (reelId: string, commentId: string, content: string) => Promise.resolve(),
  likeComment: (commentId: string) => Promise.resolve(),
  commentsNextCursor: undefined as string | undefined,
  hasMoreComments: true,
});


export default function ReelProvider({ children }: any) {
  const [reels, setReels] = useState<ReelWithUser[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const { socket } = useSocket();
  const { user } = useAuth();
  const [activeCommentReelId, setActiveCommentReelId] = useState<string | null>(null);
  const [commentsNextCursor, setCommentsNextCursor] = useState<string | undefined>(undefined);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [typingUsers, setTypingUsers] = useState<{ userId: string; username: string }[]>([]);

  const sortComments = (list: Comment[]): Comment[] => {
    return [...list].sort((a, b) => {
      const likesA = BigInt(a.likesCount || "0");
      const likesB = BigInt(b.likesCount || "0");
      if (likesB !== likesA) return likesB > likesA ? 1 : -1;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  };

  useEffect(() => {
    if (!socket) return;

    const handleNewComment = (newComment: any) => {
      if (user && newComment.userId === user.userId) return;

      if (newComment.reelId === activeCommentReelId) {
        setComments(prev => {
          const exists = prev.some(c => c.commentId === newComment.commentId);
          if (exists) return prev;

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

        // Also update the reel's comment count in the list
        setReels(prev => prev.map(r =>
          r.reelId === activeCommentReelId
            ? { ...r, commentsCount: (BigInt(r.commentsCount || "0") + BigInt(1)).toString() }
            : r
        ));
      }
    };

    const handleLikeUpdate = (data: any) => {
      if (user && data.userId === user.userId) return;

      if (data.reelId) {
        setReels(prev => prev.map(r =>
          r.reelId === data.reelId ? { ...r, likesCount: String(data.count) } : r
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

    const handleUserTypingComment = (data: { userId: string; targetId: string; targetType: string; isTyping: boolean; username: string }) => {
      if (data.targetType === 'reel' && data.targetId === activeCommentReelId) {
        if (data.isTyping) {
          setTypingUsers(prev => {
            if (prev.find(u => u.userId === data.userId)) return prev;
            return [...prev, { userId: data.userId, username: data.username }];
          });
        } else {
          setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
        }
      }
    };

    socket.on('newComment', handleNewComment);
    socket.on('likeUpdate', handleLikeUpdate);
    socket.on('userTypingComment', handleUserTypingComment);

    return () => {
      socket.off('newComment', handleNewComment);
      socket.off('likeUpdate', handleLikeUpdate);
      socket.off('userTypingComment', handleUserTypingComment);
    };
  }, [socket, activeCommentReelId, user]);


  const fetchReelFeed = async (page = 1, limit = 20) => {
    setLoading(true);
    const data = await getReelsFeed(page, limit);
    setReels(data);
    setLoading(false);
  }
  const incrementReelViews = async (reelId: string, watchTime?: number, duration?: number) => {
    const data = await apiIncrementReelViews(reelId, watchTime, duration);
  }

  const fetchComments = async (reelId: string, limit = 20) => {
    setActiveCommentReelId(reelId);
    setCommentsNextCursor(undefined);
    setHasMoreComments(true);
    setTypingUsers([]); // Clear typing users when fetching new comments

    // Join new room
    if (socket) {
      socket.emit('join', `reel_${reelId}`);
    }

    const res = await getComments(reelId, "reel", null, limit);
    if (res.success) {
      setComments(sortComments(res.data));
      setCommentsNextCursor(res.nextCursor);
      setHasMoreComments(!!res.nextCursor);
    }
  };

  const fetchMoreComments = async (reelId: string, limit = 20) => {
    if (!commentsNextCursor || !hasMoreComments) return;

    const res = await getComments(reelId, "reel", commentsNextCursor, limit);
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

  const sendTypingStatus = (reelId: string, isTyping: boolean) => {
    if (socket && user) {
      socket.emit('commentTyping', { targetId: reelId, targetType: 'reel', isTyping, username: user.username });
    }
  };

  const addComment = async (reelId: string, content: string) => {
    // Optimistic
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
      username: "Me",
      userId: "", // Typically string in other models
      displayName: "Me",
      isVerified: false,
      userLiked: false,
      replies: []
    };
    setComments(prev => [newComment, ...prev]);

    try {
      const res = await commentReel(reelId, { content });
      if (res.success && res.data) {
        setComments(prev => prev.map(c => c.commentId === tempId ? { ...c, commentId: res.data.commentId } : c));
      }
    } catch (error) {
      console.error("Failed to add reel comment", error);
      setComments(prev => prev.filter(c => c.commentId !== tempId));
    }
  };

  const replyComment = async (reelId: string, commentId: string, content: string) => {
    try {
      const res = await commentReel(reelId, { content, parentCommentId: commentId });
      if (res.success) {
        fetchComments(reelId)
        return;
      }
    } catch (error) {
      console.error("Failed to reply reel comment", error);
    }
  };

  const likeComment = async (commentId: string) => {
    // Optimistic
    setComments(prev => {
      const updateLike = (list: Comment[]): Comment[] => {
        return list.map(c => {
          if (c.commentId === commentId) {
            const currentLikes = BigInt(c.likesCount || "0");
            const newLikes = !c.userLiked ? currentLikes + BigInt(1) : (currentLikes > BigInt(0) ? currentLikes - BigInt(1) : BigInt(0));
            return {
              ...c,
              userLiked: !c.userLiked,
              likesCount: newLikes.toString()
            };
          }
          if (c.replies) {
            return { ...c, replies: updateLike(c.replies) };
          }
          return c;
        });
      };
      return updateLike(prev);
    });

    try {
      // Assuming generic like endpoints work for reel comments too
      // If not, we need specific ones. But usually comment IDs are unique globally or per table.
      // Let's check if we need to check state.
      let isLiked = false;
      const findComment = (list: Comment[]) => {
        for (const c of list) {
          if (c.commentId === commentId) {
            isLiked = c.userLiked
            return;
          }
          if (c.replies) findComment(c.replies);
        }
      };
      findComment(comments);

      if (isLiked) {
        await unlikePostComment(commentId);
      } else {
        await likePostComment(commentId);
      }
    } catch (error) {
      console.error("Failed to toggle like reel comment", error);
    }
  };


  const likeReel = async (reelId: string) => {
    // Update local state optimistically
    setReels((prev) =>
      prev.map((p) =>
        p.reelId === reelId
          ? {
            ...p,
            likesCount: (() => {
              const currentLikes = BigInt(p.likesCount || "0");
              const newLikes = !p.isLiked ? currentLikes + BigInt(1) : (currentLikes > BigInt(0) ? currentLikes - BigInt(1) : BigInt(0));
              return newLikes.toString();
            })(),
            isLiked: !p.isLiked,
          }
          : p
      )
    );

    // Find the reel to determine action
    const reel = reels.find((r) => r.reelId === reelId);
    if (!reel) return;

    try {
      if (reel.isLiked) {
        // Already liked in previous state, so unlike now
        await apiUnlikeReel(reelId);
      } else {
        await apiLikeReel(reelId);
      }
    } catch (error) {
      console.error("Failed to update like:", error);
      // Optionally revert state on error
      setReels((prev) =>
        prev.map((p) =>
          p.reelId === reelId
            ? {
              ...p,
              likesCount: (() => {
                const currentLikes = BigInt(p.likesCount || "0");
                const newLikes = !p.isLiked ? currentLikes + BigInt(1) : (currentLikes > BigInt(0) ? currentLikes - BigInt(1) : BigInt(0));
                return newLikes.toString();
              })(),
              isLiked: !p.isLiked,
            }
            : p
        )
      );
    }
  };
  return (
    <ReelContext.Provider
      value={{
        reels,
        fetchReelFeed,
        likeReel,
        incrementReelViews,
        comments,
        commentsNextCursor,
        hasMoreComments,
        fetchComments,
        fetchMoreComments,
        typingUsers,
        sendTypingStatus,
        addComment,
        replyComment,
        likeComment,
      }}
    >
      {children}
    </ReelContext.Provider>
  );
}