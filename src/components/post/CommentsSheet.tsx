import { useContext, useEffect } from "react";
import { PostContext } from "@/context/PostContext";
import { useAuth } from "@/context/AuthContext";
import { createPortal } from "react-dom";
import CommentsSection from "../CommentsSection";
import { motion, AnimatePresence } from "framer-motion";

interface CommentSheetProps {
  postId: string;
  onClose: () => void;
}

export default function CommentSheet({ postId, onClose }: CommentSheetProps) {
  const { comments, fetchComments, fetchMoreComments, hasMoreComments, clearComments, addComment, replyComment, likeComment, updateComment, loading, sendTypingStatus, typingUsers } = useContext(PostContext);
  const { user } = useAuth();

  useEffect(() => {
    if (postId) {
      fetchComments(postId);
    }
    return () => {
      clearComments();
    };
  }, [postId]);

  if (!postId) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-50"
      />
      <motion.div
        key="sheet"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed bottom-0 left-0 right-0 h-[75vh] z-50"
      >
        <CommentsSection
          comments={comments}
          loading={loading}
          onAddComment={(content) => addComment(postId, content)}
          onReply={(commentId, content) => replyComment(postId, commentId, content)}
          onLike={likeComment}
          onDelete={async (commentId) => { }} // Implement if needed
          onUpdateComment={updateComment}
          currentUserId={user?.userId}
          onClose={onClose}
          loadMore={() => fetchMoreComments(postId)}
          hasMore={hasMoreComments}
          onTyping={(isTyping) => sendTypingStatus(postId, isTyping)}
          typingUsers={typingUsers}
        />
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
