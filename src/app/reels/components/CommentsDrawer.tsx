"use client";

import React, { useEffect, useState, useRef } from "react";
import { Drawer } from "vaul";
import { X, Send, Heart, Reply } from "lucide-react";
import { Input } from "@/components/ui/input";

interface CommentsDrawerProps {
  reelId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CommentsDrawer: React.FC<CommentsDrawerProps> = ({
  reelId,
  isOpen,
  onOpenChange,
}) => {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<any>(null); // { id, name }
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/reels/${reelId}/comments`);
        const data = await res.json();
        if (data.success) {
          setComments(data.comments);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (isOpen) {
      fetchComments();
    } else {
      // reset states on close
      setReplyingTo(null);
      setNewComment("");
    }
  }, [isOpen, reelId]);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setPosting(true);
    try {
      const payload = {
        content: newComment,
        parentId: replyingTo?.id || undefined,
      };

      const res = await fetch(`/api/reels/${reelId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        const appended = { ...data.comment, user: { name: "You" } };
        // If it's a reply, push it. Otherwise, prepend it.
        setComments((prev) => [...prev, appended]);
        setNewComment("");
        setReplyingTo(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPosting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      const res = await fetch(`/api/reels/comments/${commentId}/like`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setComments((prev) =>
          prev.map((c) => {
            if (c.id === commentId) {
              return {
                ...c,
                likesCount: (c.likesCount || 0) + (data.liked ? 1 : -1),
              };
            }
            return c;
          }),
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const initiateReply = (comment: any) => {
    // If replying to a reply, attach to the root parent
    const parentId = comment.parentId || comment.id;
    setReplyingTo({ id: parentId, name: comment.user?.name || "User" });
    if (inputRef.current) inputRef.current.focus();
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  const parentComments = comments.filter((c) => !c.parentId);

  const CommentItem = ({
    comment,
    isReply = false,
  }: {
    comment: any;
    isReply?: boolean;
  }) => {
    return (
      <div className={`flex gap-3 ${isReply ? "mt-3" : "mb-4"}`}>
        <div
          className={`rounded-full bg-card text-card-foreground overflow-hidden shrink-0 ${isReply ? "w-6 h-6" : "w-8 h-8"}`}
        >
          {comment.user?.avatarId && (
            <img
              src={`/api/images/${comment.user.avatarId}`}
              className="w-full h-full object-cover"
              alt=""
            />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-sm">
              {comment.user?.name || "User"}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className="text-sm text-gray-800 mt-1">{comment.content}</p>

          <div className="flex items-center gap-4 mt-1">
            <button
              onClick={() => initiateReply(comment)}
              className="text-xs font-semibold text-gray-500 flex items-center gap-1 hover:text-gray-700"
            >
              <Reply className="w-3 h-3" /> Reply
            </button>
          </div>
        </div>

        <button
          onClick={() => handleLikeComment(comment.id)}
          className="flex flex-col items-center gap-1 group px-2 pt-1"
        >
          <Heart className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition" />
          <span className="text-xs text-gray-500">
            {comment.likesCount || 0}
          </span>
        </button>
      </div>
    );
  };

  return (
    <Drawer.Root open={isOpen} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Drawer.Content className="bg-card text-card-foreground flex flex-col rounded-t-[20px] h-[75vh] mt-24 fixed bottom-0 left-0 right-0 sm:max-w-[400px] sm:mx-auto z-50">
          <div className="p-4 bg-primary-foreground text-primary rounded-t-[20px] flex-1 flex flex-col">
            <div className="mx-auto w-12 h-1.5 shrink-0 rounded-full bg-gray-300 mb-4" />

            <div className="flex items-center justify-between mb-4 pb-2 border-b">
              <h2 className="text-lg font-bold">Comments</h2>
              <button
                onClick={() => onOpenChange(false)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pb-4">
              {loading ? (
                <div className="flex justify-center p-4 text-gray-500 text-sm">
                  Loading comments...
                </div>
              ) : comments.length === 0 ? (
                <div className="flex justify-center p-4 text-gray-500 text-sm">
                  No comments yet. Be the first!
                </div>
              ) : (
                parentComments.map((parent) => {
                  const replies = comments.filter(
                    (c) => c.parentId === parent.id,
                  );
                  return (
                    <div key={parent.id} className="relative">
                      <CommentItem comment={parent} />

                      {/* Replies Block */}
                      {replies.length > 0 && (
                        <div className="ml-11 relative">
                          <div className="absolute left-[-16px] top-0 bottom-6 w-[2px] bg-card text-card-foreground rounded-full"></div>
                          {replies.map((reply) => (
                            <CommentItem
                              key={reply.id}
                              comment={reply}
                              isReply
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Replying Status */}
            {replyingTo && (
              <div className="bg-card px-4 py-2 text-sm text-foreground flex justify-between items-center border-t border-gray-200">
                <span>
                  Replying to{" "}
                  <span className="font-semibold text-gray-900">
                    {replyingTo.name}
                  </span>
                </span>
                <button
                  onClick={cancelReply}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Input area */}
            <div className="pt-3 border-t flex items-end gap-2 px-1">
              <div className="flex-1 flex items-center">
                <Input
                  ref={inputRef}
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  onKeyDown={(e) => e.key === "Enter" && handlePost(e as any)}
                />
              </div>
              <button
                onClick={handlePost}
                disabled={posting || !newComment.trim()}
                className="p-3 bg-indigo-600 text-white rounded-full disabled:opacity-50 transition"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
