"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    Send,
    Image as ImageIcon,
    Smile,
    MoreVertical,
    Phone,
    Video,
    ChevronLeft,
    Loader2,
    User,
    UserX,
    Trash2,
    Settings,
    Check,
    CheckCheck
} from "lucide-react";
import { Conversation, Message, getMessages } from "@/api/messenger";
import { useSocket } from "@/context/SocketContext";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";

interface ChatWindowProps {
    conversation: Conversation;
    onBack: () => void;
    onStartCall?: (type: 'voice' | 'video') => void;
}

export default function ChatWindow({ conversation, onBack, onStartCall }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [contextMenuMsg, setContextMenuMsg] = useState<string | null>(null);
    const [uploadingMedia, setUploadingMedia] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());
    const { socket } = useSocket();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const currentUserId = useAuth().user?.userId!;
    const router = useRouter();

    const getMessageStatus = (msg: Message) => {
        if (msg.isRead) return 'read';
        if (msg.isDelivered) return 'delivered';
        return 'sent';
    };

    const MessageStatusIcon = ({ message }: { message: Message }) => {
        const status = getMessageStatus(message);
        const isMe = Number(message.senderId) === Number(currentUserId);

        if (!isMe) return null;

        const iconClass = "w-3.5 h-3.5";

        switch (status) {
            case 'read':
                return <CheckCheck className={`${iconClass} text-purple-200`} />;
            case 'delivered':
                return <CheckCheck className={`${iconClass} text-purple-300/60`} />;
            case 'sent':
            default:
                return <Check className={`${iconClass} text-purple-300/40`} />;
        }
    };

    const markMessagesAsRead = async (messageIds: string[]) => {
        if (!socket || messageIds.length === 0) return;

        try {
            socket.emit('markMessagesAsRead', {
                messageIds,
                conversationId: conversation.conversationId
            });
        } catch (error) {
            console.error('Failed to mark messages as read:', error);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchMessages = async (cursor?: string) => {
        try {
            if (cursor) setLoadingMore(true);
            else setLoading(true);

            const data = await getMessages(conversation.conversationId, 50, cursor);
            if (cursor) {
                setMessages(prev => [...data.messages.reverse(), ...prev]);
            } else {
                setMessages(data.messages.reverse());
                setTimeout(scrollToBottom, 50);
            }
            setNextCursor(data.pagination.nextCursor);
        } catch (error) {
            console.error("Failed to fetch messages:", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchMessages();
        if (socket && conversation.conversationId) {
            socket.emit("joinRoom", { conversationId: conversation.conversationId });
        }
    }, [conversation.conversationId, socket]);

    // Close menu and emoji picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showMenu && !(event.target as Element).closest('.menu-dropdown')) {
                setShowMenu(false);
            }
            if (showEmojiPicker && !(event.target as Element).closest('.emoji-picker')) {
                setShowEmojiPicker(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showMenu, showEmojiPicker]);

    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (data: any) => {
            const payload = data.message;
            if (payload && payload.conversationId === conversation.conversationId) {
                setMessages(prev => [...prev, payload]);
                setTimeout(scrollToBottom, 50);
            }
        };

        const handleMessageDeleted = (data: any) => {
            const { messageId, forEveryone } = data;
            setMessages(prev => prev.map(msg => {
                if (msg.messageId === messageId) {
                    if (forEveryone) {
                        return { ...msg, isDeleted: true };
                    } else {
                        return { ...msg, deletedFor: [...(msg.deletedFor || []), currentUserId] };
                    }
                }
                return msg;
            }));
        };

        const handleMessageDelivered = (data: any) => {
            const { messageId, deliveredBy } = data;
            setMessages(prev => prev.map(msg => {
                if (msg.messageId === messageId) {
                    return {
                        ...msg,
                        isDelivered: true,
                        deliveredBy: { ...msg.deliveredBy, [deliveredBy]: new Date().toISOString() }
                    };
                }
                return msg;
            }));
        };

        const handleMessagesDelivered = (data: any) => {
            const { messageIds, deliveredBy } = data;
            setMessages(prev => prev.map(msg => {
                if (messageIds.includes(msg.messageId)) {
                    return {
                        ...msg,
                        isDelivered: true,
                        deliveredBy: { ...msg.deliveredBy, [deliveredBy]: new Date().toISOString() }
                    };
                }
                return msg;
            }));
        };

        const handleMessageRead = (data: any) => {
            const { messageId, userId } = data;
            setMessages(prev => prev.map(msg => {
                if (msg.messageId === messageId) {
                    return {
                        ...msg,
                        isRead: true,
                        readBy: { ...msg.readBy, [userId]: new Date().toISOString() }
                    };
                }
                return msg;
            }));
        };

        const handleMessagesRead = (data: any) => {
            const { messageIds, userId } = data;
            setMessages(prev => prev.map(msg => {
                if (messageIds.includes(msg.messageId)) {
                    return {
                        ...msg,
                        isRead: true,
                        readBy: { ...msg.readBy, [userId]: new Date().toISOString() }
                    };
                }
                return msg;
            }));
        };

        socket.on("newMessage", handleNewMessage);
        socket.on("messageDeleted", handleMessageDeleted);
        socket.on("messageDelivered", handleMessageDelivered);
        socket.on("messagesDelivered", handleMessagesDelivered);
        socket.on("messageRead", handleMessageRead);
        socket.on("messagesRead", handleMessagesRead);

        return () => {
            socket.off("newMessage", handleNewMessage);
            socket.off("messageDeleted", handleMessageDeleted);
            socket.off("messageDelivered", handleMessageDelivered);
            socket.off("messagesDelivered", handleMessagesDelivered);
            socket.off("messageRead", handleMessageRead);
            socket.off("messagesRead", handleMessagesRead);
        };
    }, [socket, conversation.conversationId, currentUserId]);

    // Intersection Observer for read receipts
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const visibleMessageIds: string[] = [];

                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const messageId = entry.target.getAttribute('data-message-id');
                        if (messageId) {
                            visibleMessageIds.push(messageId);
                        }
                    }
                });

                if (visibleMessageIds.length > 0) {
                    // Mark messages as read if they're from other users and not already read
                    const messagesToMark = messages.filter(msg =>
                        visibleMessageIds.includes(msg.messageId) &&
                        Number(msg.senderId) !== Number(currentUserId) &&
                        !msg.isRead
                    );

                    if (messagesToMark.length > 0) {
                        const messageIds = messagesToMark.map(msg => msg.messageId);
                        markMessagesAsRead(messageIds);
                    }
                }
            },
            {
                root: null,
                rootMargin: '0px',
                threshold: 0.5, // Message is considered "read" when 50% visible
            }
        );

        // Observe all message elements
        messageRefs.current.forEach((element) => {
            observer.observe(element);
        });

        return () => {
            observer.disconnect();
        };
    }, [messages, currentUserId, socket, conversation.conversationId]);

    const handleSendMessage = (content?: string, mediaUrl?: string, type: 'text' | 'image' | 'video' = 'text') => {
        if ((!content?.trim() && !mediaUrl) || !socket) return;

        const messagePayload = {
            conversationId: conversation.conversationId,
            content: content || "",
            mediaUrl: mediaUrl,
            messageType: type,
            tempId: Date.now().toString(),
        };
        socket.emit("sendMessage", messagePayload);
        setInputValue("");
    };

    const handleDeleteMessage = (messageId: string, forEveryone: boolean) => {
        if (!socket) return;
        socket.emit("deleteMessage", { messageId, conversationId: conversation.conversationId, deleteForEveryone: forEveryone });
        setContextMenuMsg(null);
    };

    const handleMenuAction = (action: string) => {
        setShowMenu(false);
        setContextMenuMsg(null);

        if (action.startsWith('viewProfile_')) {
            const userId = action.split('_')[1];
            router.push(`/profile/${userId}`);
            return;
        }

        switch (action) {
            case 'viewProfile':
                break;
            case 'blockUser':
                break;
            case 'clearChat':
                break;
            case 'settings':
                break;
        }
    };

    const handleEmojiSelect = (emoji: string) => {
        setInputValue(prev => prev + emoji);
        setShowEmojiPicker(false);
    };

    const emojis = [
        '😀', '😂', '😊', '😍', '🥰', '😘', '😉', '😎', '🤔', '😮',
        '👍', '👎', '👌', '✌️', '🤞', '👏', '🙌', '🤝', '🙏', '💪',
        '❤️', '💔', '💕', '💖', '💯', '🔥', '⭐', '✨', '💫', '🌟'
    ];

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingMedia(true);
        try {
            // In a real app, we'd upload to S3/Cloudinary here
            // TODO: Replace with real API integration
            // For now, let's simulate a URL or use a placeholder
            // We'll call an upload API if one exists
            const formData = new FormData();
            formData.append('file', file);

            // TODO: Replace with real upload logic
            // Mock upload
            const mediaUrl = URL.createObjectURL(file);
            const mediaType = file.type.startsWith('image/') ? 'image' : 'video';

            handleSendMessage("", mediaUrl, mediaType);
        } catch (error) {
            console.error("Upload failed:", error);
        } finally {
            setUploadingMedia(false);
        }
    };

    const otherMember = conversation.members.find(member => member.userId !== currentUserId) || conversation.members[0];

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-black">
            {/* Header */}
            <header className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-900 flex items-center justify-between bg-white/80 dark:bg-black/80 backdrop-blur-xl sticky top-0 z-10">
                <div className="flex items-center space-x-4">
                    <button onClick={onBack} className="md:hidden p-2 -ml-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-colors">
                        <ChevronLeft className="w-6 h-6 text-zinc-500" />
                    </button>
                    <button
                        onClick={() => router.push(`/profile/${otherMember?.userId}`)}
                        className="flex items-center space-x-3.5 group"
                    >
                        <div className="relative">
                            <div className="w-11 h-11 rounded-full p-[1.5px] bg-gradient-to-tr from-purple-500 to-pink-500">
                                <div className="w-full h-full rounded-full border-2 border-white dark:border-black overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                                    {otherMember?.avatarUrl ? (
                                        <img src={otherMember.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-lg">
                                            {(conversation.name || otherMember?.displayName || otherMember?.username || "?")[0].toUpperCase()}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-black shadow-sm" />
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-zinc-900 dark:text-white leading-tight group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                {conversation.name || otherMember?.displayName || otherMember?.username}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider">Active Now</span>
                            </div>
                        </div>
                    </button>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-3">
                    <button
                        onClick={() => onStartCall?.('voice')}
                        className="p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 rounded-xl transition-all"
                    >
                        <Phone className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => onStartCall?.('video')}
                        className="p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 rounded-xl transition-all"
                    >
                        <Video className="w-5 h-5" />
                    </button>
                    <div className="relative menu-dropdown">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 rounded-xl transition-all"
                        >
                            <MoreVertical className="w-5 h-5" />
                        </button>

                        {showMenu && (
                            <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                                <button
                                    onClick={() => handleMenuAction(`viewProfile_${otherMember.userId}`)}
                                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 flex items-center transition-colors"
                                >
                                    <User className="w-4 h-4 mr-3 text-zinc-400" />
                                    View Profile
                                </button>
                                <button
                                    onClick={() => handleMenuAction('blockUser')}
                                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 flex items-center transition-colors"
                                >
                                    <UserX className="w-4 h-4 mr-3" />
                                    Block User
                                </button>
                                <div className="border-t border-zinc-100 dark:border-zinc-800 my-1.5"></div>
                                <button
                                    onClick={() => handleMenuAction('clearChat')}
                                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 flex items-center transition-colors"
                                >
                                    <Trash2 className="w-4 h-4 mr-3" />
                                    Clear Chat
                                </button>
                                <button
                                    onClick={() => handleMenuAction('settings')}
                                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 flex items-center transition-colors"
                                >
                                    <Settings className="w-4 h-4 mr-3 text-zinc-400" />
                                    Settings
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                {loading ? (
                    <div className="flex-1 flex items-center justify-center h-full">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
                            <p className="text-zinc-500 text-sm font-medium">Securing your conversation...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {nextCursor && (
                            <div className="flex justify-center py-2">
                                <button
                                    onClick={() => fetchMessages(nextCursor)}
                                    disabled={loadingMore}
                                    className="text-xs text-purple-600 font-medium hover:underline flex items-center"
                                >
                                    {loadingMore && <Loader2 className="w-3 h-3 animate-spin mr-1" />}
                                    Load earlier messages
                                </button>
                            </div>
                        )}

                        {messages.map((msg, index) => {
                            const isMe = msg.senderId === currentUserId;
                            const prevMsg = messages[index - 1];
                            const showAvatar = !isMe && (!prevMsg || prevMsg.senderId !== msg.senderId);
                            const isDeleted = msg.isDeleted || msg.deletedFor?.includes(currentUserId);

                            if (isDeleted && !msg.isDeleted) return null; // Hidden for me

                            return (
                                <div
                                    key={msg.messageId}
                                    ref={(el) => {
                                        if (el) {
                                            messageRefs.current.set(msg.messageId, el);
                                        } else {
                                            messageRefs.current.delete(msg.messageId);
                                        }
                                    }}
                                    data-message-id={msg.messageId}
                                    className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end space-x-2 group relative`}
                                >
                                    {!isMe && (
                                        <div className="w-8 h-8 flex-shrink-0">
                                            {showAvatar && (
                                                <button
                                                    onClick={() => router.push(`/profile/${msg.senderId}`)}
                                                    className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 border border-gray-300 hover:border-purple-400 transition-colors"
                                                >
                                                    {msg.sender?.avatarUrl ? (
                                                        <img src={msg.sender.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-600 font-bold text-xs">
                                                            {(msg.sender?.username || "?")[0].toUpperCase()}
                                                        </div>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                    <div className={`max-w-[80%] sm:max-w-[70%] px-5 py-3 rounded-[24px] shadow-sm relative transition-all duration-200 ${isMe
                                        ? 'bg-purple-600 text-white rounded-br-none shadow-lg shadow-purple-500/20'
                                        : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-bl-none border border-zinc-100 dark:border-zinc-800'
                                        }`}>

                                        {msg.isDeleted ? (
                                            <p className="text-sm italic opacity-60 flex items-center gap-2">
                                                <Trash2 className="w-3.5 h-3.5" />
                                                This message was deleted
                                            </p>
                                        ) : (
                                            <>
                                                {msg.messageType === 'image' && (
                                                    <div className="mb-2 rounded-2xl overflow-hidden border border-white/10 shadow-sm">
                                                        <img src={msg.mediaUrl} alt="Media" className="max-w-full h-auto max-h-80 object-cover" />
                                                    </div>
                                                )}
                                                {msg.messageType === 'video' && (
                                                    <div className="mb-2 rounded-2xl overflow-hidden border border-white/10 bg-black shadow-sm">
                                                        <video src={msg.mediaUrl} controls className="max-w-full h-auto max-h-80" />
                                                    </div>
                                                )}
                                                {msg.messageType === 'audio' && (
                                                    <div className="mb-2 p-1 bg-white/10 dark:bg-black/20 rounded-2xl border border-white/5">
                                                        <audio src={msg.mediaUrl} controls className="max-w-full h-10 filter dark:invert" />
                                                    </div>
                                                )}
                                                {msg.messageType === 'file' && (
                                                    <a
                                                        href={msg.mediaUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="mb-2 flex items-center gap-3 p-3 bg-white/10 dark:bg-black/20 rounded-2xl border border-white/5 hover:bg-white/20 transition-colors"
                                                    >
                                                        <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                                                            <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold truncate">{msg.content || 'Download File'}</p>
                                                            <p className="text-[10px] opacity-60">Click to view/download</p>
                                                        </div>
                                                    </a>
                                                )}
                                                {msg.content && msg.messageType === 'text' && <p className="text-[15px] leading-relaxed break-words font-medium">{msg.content}</p>}
                                            </>
                                        )}

                                        <div className={`text-[10px] mt-1.5 flex items-center gap-1.5 ${isMe ? 'text-purple-200/80 justify-end' : 'text-zinc-400 justify-start'}`}>
                                            <span className="font-medium">{format(new Date(msg.createdAt), 'HH:mm')}</span>
                                            <MessageStatusIcon message={msg} />
                                        </div>

                                        {/* Context Menu Trigger */}
                                        <button
                                            onClick={() => setContextMenuMsg(contextMenuMsg === msg.messageId ? null : msg.messageId)}
                                            className={`absolute ${isMe ? '-left-8' : '-right-8'} top-1/2 -translate-y-1/2 p-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-all`}
                                        >
                                            <MoreVertical className="w-4 h-4" />
                                        </button>

                                        {/* Simple Context Menu */}
                                        {contextMenuMsg === msg.messageId && (
                                            <div className={`absolute z-20 ${isMe ? 'right-0' : 'left-0'} top-full mt-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-xl py-1 min-w-[120px]`}>
                                                {!isMe && (
                                                    <button
                                                        onClick={() => handleMenuAction(`viewProfile_${msg.senderId}`)}
                                                        className="w-full text-left px-4 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center"
                                                    >
                                                        👤 View Profile
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteMessage(msg.messageId, false)}
                                                    className="w-full text-left px-4 py-2 text-xs hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600"
                                                >
                                                    🗑️ Delete for me
                                                </button>
                                                {isMe && (
                                                    <button
                                                        onClick={() => handleDeleteMessage(msg.messageId, true)}
                                                        className="w-full text-left px-4 py-2 text-xs hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600"
                                                    >
                                                        🚫 Delete for everyone
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input Area */}
            <footer className="px-6 py-6 border-t border-zinc-100 dark:border-zinc-900 bg-white dark:bg-black">
                <div className="flex items-end space-x-3 max-w-5xl mx-auto">
                    <div className="flex-1 flex items-center space-x-2 bg-zinc-50 dark:bg-zinc-900 p-2.5 rounded-[24px] border border-zinc-100 dark:border-zinc-800 focus-within:border-purple-500/50 focus-within:ring-4 focus-within:ring-purple-500/10 transition-all">
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileChange}
                            accept="image/*,video/*"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2.5 text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors disabled:opacity-50"
                            disabled={uploadingMedia}
                        >
                            {uploadingMedia ? <Loader2 className="w-5.5 h-5.5 animate-spin" /> : <ImageIcon className="w-5.5 h-5.5" />}
                        </button>
                        <div className="relative emoji-picker">
                            <button
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                className="p-2.5 text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                            >
                                <Smile className="w-5.5 h-5.5" />
                            </button>

                            {showEmojiPicker && (
                                <div className="absolute bottom-full left-0 mb-4 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-2xl p-4 z-50 w-72 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                    <div className="grid grid-cols-7 gap-1">
                                        {emojis.map((emoji, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleEmojiSelect(emoji)}
                                                className="w-9 h-9 text-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all active:scale-90 flex items-center justify-center"
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <input
                            type="text"
                            placeholder="Message..."
                            className="flex-1 bg-transparent border-none focus:ring-0 text-[15px] py-2.5 px-2 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 font-medium"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                        />
                    </div>
                    <button
                        onClick={() => handleSendMessage(inputValue)}
                        disabled={!inputValue.trim() || uploadingMedia}
                        className={`p-4 rounded-full transition-all shadow-xl active:scale-95 flex items-center justify-center ${inputValue.trim()
                            ? 'bg-purple-600 text-white shadow-purple-500/20 hover:bg-purple-700'
                            : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-600 cursor-not-allowed shadow-none border border-zinc-100 dark:border-zinc-800'
                            }`}
                    >
                        <Send className="w-6 h-6" />
                    </button>
                </div>
            </footer>
        </div>
    );
}
