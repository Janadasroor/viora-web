import React, { useState, useRef, useEffect } from "react";
import { Heart, Send, MessageCircle, X, Loader2, MoreHorizontal, Trash2, CornerDownRight } from "lucide-react";
import { Comment } from "@/models/Comment";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL } from "@/constants/url";
import { useBigCount } from "@/hooks/useBigCount";
interface CommentsSectionProps {
    comments: Comment[];
    loading: boolean;
    onAddComment: (content: string) => Promise<void>;
    onReply: (commentId: string, content: string) => Promise<void>;
    onLike: (commentId: string) => Promise<void>;
    onUpdateComment?: (commentId: string, content: string) => Promise<boolean>;
    onDelete?: (commentId: string) => Promise<void>;
    onClose: () => void;
    loadMore?: () => void;
    hasMore?: boolean;
    title?: string;
    currentUserId?: string;
    typingUsers?: { userId: string; username: string }[];
    onTyping?: (isTyping: boolean) => void;
}

export default function CommentsSection({
    comments,
    loading,
    onAddComment,
    onReply,
    onLike,
    onDelete,
    onUpdateComment,
    onClose,
    loadMore,
    hasMore,
    title = "Comments",
    currentUserId,
    typingUsers = [],
    onTyping,
}: CommentsSectionProps) {
    const [newComment, setNewComment] = useState("");
    const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
    const [replyContent, setReplyContent] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [mentionSearch, setMentionSearch] = useState("");
    const [mentionSuggestions, setMentionSuggestions] = useState<any[]>([]);
    const [showMentions, setShowMentions] = useState(false);
    const [mentionIndex, setMentionIndex] = useState(-1);
    const commentsEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const mentionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Typing Status Logic
    const handleTyping = () => {
        if (!onTyping) return;

        onTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            onTyping(false);
        }, 3000);
    };

    // Mention Suggestions Logic
    const searchMentions = async (query: string) => {
        if (!query) {
            setMentionSuggestions([]);
            setShowMentions(false);
            return;
        }

        const users = await (await import("@/api/users")).getUsers(1, 10, query);
        setMentionSuggestions(users);
        setShowMentions(users.length > 0);
    };

    const handleInputChange = (value: string) => {
        const isReply = !!replyingTo;
        if (isReply) setReplyContent(value);
        else setNewComment(value);

        handleTyping();

        // Check for @mention
        const lastAtPos = value.lastIndexOf("@");
        if (lastAtPos !== -1 && (lastAtPos === 0 || value[lastAtPos - 1] === " ")) {
            const query = value.slice(lastAtPos + 1).split(" ")[0];
            setMentionIndex(lastAtPos);

            if (mentionTimeoutRef.current) clearTimeout(mentionTimeoutRef.current);
            mentionTimeoutRef.current = setTimeout(() => {
                searchMentions(query);
            }, 300);
        } else {
            setShowMentions(false);
        }
    };

    const insertMention = (username: string) => {
        const value = replyingTo ? replyContent : newComment;
        const before = value.slice(0, mentionIndex);
        const after = value.slice(mentionIndex).split(" ").slice(1).join(" ");
        const newValue = `${before}@${username} ${after}`;

        if (replyingTo) setReplyContent(newValue);
        else setNewComment(newValue);

        setShowMentions(false);
    };

    const handleSend = async () => {
        if (!newComment.trim()) return;
        setSubmitting(true);
        try {
            await onAddComment(newComment);
            setNewComment("");
            // Scroll to top or bottom depending on preference, usually new comments appear at top or bottom
            // For now let's assume they are added to the list and we might want to scroll to them
        } finally {
            setSubmitting(false);
        }
    };

    const handleSendReply = async () => {
        if (!replyContent.trim() || !replyingTo) return;
        setSubmitting(true);
        try {
            await onReply(replyingTo.commentId, replyContent);
            setReplyContent("");
            setReplyingTo(null);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-t-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{title}</h3>
                    <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400">
                        {comments.length}
                    </span>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
                {loading && comments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 space-y-3">
                        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                        <p className="text-sm text-gray-500">Loading comments...</p>
                    </div>
                ) : comments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-60">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                            <MessageCircle className="w-8 h-8 text-gray-400" />
                        </div>
                        <div>
                            <p className="font-medium">No comments yet</p>
                            <p className="text-sm text-gray-500">Start the conversation.</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {comments.map((comment) => (
                            <CommentItem
                                key={comment.commentId}
                                comment={comment}
                                onLike={onLike}
                                onReply={(c) => setReplyingTo(c)}
                                onDelete={onDelete}
                                onUpdateComment={onUpdateComment}
                                currentUserId={currentUserId}
                            />
                        ))}

                        {hasMore && (
                            <button
                                onClick={loadMore}
                                disabled={loading}
                                className="w-full py-3 text-sm text-purple-600 font-medium hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Load more comments"}
                            </button>
                        )}
                    </div>
                )}
                <div ref={commentsEndRef} />

                {/* Typing Indicator Display */}
                {typingUsers.length > 0 && (
                    <div className="flex items-center gap-2 px-1 py-1">
                        <div className="flex gap-1">
                            <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                            <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                            <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                        </div>
                        <span className="text-[10px] text-gray-500 font-medium">
                            {typingUsers.length === 1
                                ? `${typingUsers[0].username} is typing...`
                                : `${typingUsers.length} people are typing...`}
                        </span>
                    </div>
                )}
            </div>

            {/* Reply Indicator */}
            <AnimatePresence>
                {replyingTo && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-sm"
                    >
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <CornerDownRight className="w-4 h-4" />
                            <span>Replying to <span className="font-semibold">@{replyingTo.username}</span></span>
                        </div>
                        <button
                            onClick={() => setReplyingTo(null)}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <div className="flex items-end gap-3">
                    <div className="relative flex-1">
                        <AnimatePresence>
                            {showMentions && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute bottom-full left-0 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl mb-2 overflow-hidden z-20"
                                >
                                    <div className="max-h-48 overflow-y-auto py-2">
                                        {mentionSuggestions.map((u) => (
                                            <button
                                                key={u.userId}
                                                onClick={() => insertMention(u.username)}
                                                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold overflow-hidden">
                                                    {u.profilePictureUrl ? (
                                                        <img
                                                            src={u.profilePictureUrl.startsWith('http') ? u.profilePictureUrl : `${API_URL}${u.profilePictureUrl}`}
                                                            alt={u.username || ''}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        (u.username || "U").slice(0, 2).toUpperCase()
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold">@{u.username || "unknown"}</span>
                                                    <span className="text-xs text-gray-500">{u.displayName || u.username}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <textarea
                            value={replyingTo ? replyContent : newComment}
                            onChange={(e) => handleInputChange(e.target.value)}
                            placeholder={replyingTo ? `Reply to @${replyingTo.username}...` : "Add a comment..."}
                            className="w-full bg-gray-100 dark:bg-gray-800 border-0 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 min-h-[48px] max-h-32 resize-none"
                            rows={1}
                            style={{ scrollbarWidth: 'none' }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    replyingTo ? handleSendReply() : handleSend();
                                }
                            }}
                        />
                    </div>
                    <button
                        onClick={replyingTo ? handleSendReply : handleSend}
                        disabled={submitting || (!newComment.trim() && !replyContent.trim())}
                        className="p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg active:scale-95"
                    >
                        {submitting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5 ml-0.5" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

function CommentItem({
    comment,
    onLike,
    onReply,
    onDelete,
    onUpdateComment,
    currentUserId,
}: {
    comment: Comment;
    onLike: (id: string) => Promise<void>;
    onReply: (comment: Comment) => void;
    onDelete?: (id: string) => Promise<void>;
    onUpdateComment?: (id: string, content: string) => Promise<boolean>;
    currentUserId?: string;
}) {
    const [isLiked, setIsLiked] = useState(comment.userLiked);
    const initialLikesCount = useBigCount(comment.likesCount);
    const [likesCount, setLikesCount] = useState(initialLikesCount);

    useEffect(() => {
        setLikesCount(initialLikesCount);
    }, [initialLikesCount]);
    const [showReplies, setShowReplies] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveEdit = async () => {
        if (!editContent.trim() || !onUpdateComment) return;
        setIsSaving(true);
        try {
            const success = await onUpdateComment(comment.commentId, editContent);
            if (success) {
                setIsEditing(false);
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleLike = async () => {
        const newLiked = !isLiked;
        setIsLiked(newLiked);
        setLikesCount(prev => newLiked ? (prev as bigint) + BigInt(1) : (prev as bigint) - BigInt(1));

        try {
            await onLike(comment.commentId);
        } catch (error) {
            // Revert on error
            setIsLiked(!newLiked);
            setLikesCount(prev => !newLiked ? (prev as bigint) + BigInt(1) : (prev as bigint) - BigInt(1));
        }
    };

    return (
        <div className="flex gap-3 group">
            <div className="flex-shrink-0">
                {comment.userMedia?.[0].filePath ? (
                    <img
                        src={API_URL + comment.userMedia?.[0].filePath}
                        alt={comment.username}
                        className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                    />
                ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                        {comment.username.slice(0, 2).toUpperCase()}
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {comment.username}
                            <span className="ml-2 text-xs font-normal text-gray-500">
                                {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                        </span>

                        {isEditing ? (
                            <div className="mt-2">
                                <textarea
                                    className="w-full bg-gray-100 dark:bg-gray-800 border-0 rounded-lg p-2 text-sm focus:ring-2 focus:ring-purple-500 min-h-[60px] resize-none"
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    autoFocus
                                />
                                <div className="flex justify-end gap-2 mt-2">
                                    <button
                                        onClick={() => { setIsEditing(false); setEditContent(comment.content); }}
                                        className="text-xs px-2 py-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                                        disabled={isSaving}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveEdit}
                                        className="text-xs px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center gap-1"
                                        disabled={isSaving || !editContent.trim()}
                                    >
                                        {isSaving && <Loader2 className="w-3 h-3 animate-spin" />}
                                        Save
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-800 dark:text-gray-200 mt-0.5 whitespace-pre-wrap break-words leading-relaxed">
                                {comment.content}
                            </p>
                        )}
                    </div>
                    {!isEditing && (
                        <button
                            onClick={handleLike}
                            className="flex flex-col items-center gap-1 p-1 text-gray-500 hover:text-red-500 transition-colors"
                        >
                            <Heart className={`w-4 h-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                            {likesCount > BigInt(0) && <span className="text-[10px] font-medium">{likesCount.toString()}</span>}
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-4 mt-2">
                    <button
                        onClick={() => onReply(comment)}
                        className="text-xs font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 transition-colors"
                    >
                        Reply
                    </button>
                    {currentUserId === comment.userId && !isEditing && onUpdateComment && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="text-xs font-semibold text-gray-500 hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                            Edit
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={() => onDelete(comment.commentId)}
                            className="text-xs font-semibold text-gray-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                            Delete
                        </button>
                    )}
                </div>

                {/* Nested Replies */}
                {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-3">
                        {!showReplies ? (
                            <button
                                onClick={() => setShowReplies(true)}
                                className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"
                            >
                                <div className="w-6 h-[1px] bg-gray-300 dark:bg-gray-700"></div>
                                View {comment.replies.length} replies
                            </button>
                        ) : (
                            <div className="space-y-4 pl-4 border-l-2 border-gray-100 dark:border-gray-800">
                                {comment.replies.map(reply => (
                                    <CommentItem
                                        key={reply.commentId}
                                        comment={reply}
                                        onLike={onLike}
                                        onReply={onReply}
                                        onDelete={onDelete}
                                        onUpdateComment={onUpdateComment}
                                        currentUserId={currentUserId}
                                    />
                                ))}
                                <button
                                    onClick={() => setShowReplies(false)}
                                    className="text-xs font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 mt-2"
                                >
                                    Hide replies
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
