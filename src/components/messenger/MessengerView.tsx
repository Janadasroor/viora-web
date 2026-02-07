"use client";
import React, { useState, useEffect } from "react";
import ConversationList from "@/components/messenger/ConversationList";
import ChatWindow from "@/components/messenger/ChatWindow";
import UserSearchModal from "@/components/messenger/UserSearchModal";
import VoiceCallOverlay from "@/components/messenger/VoiceCallOverlay";
import { Conversation, getConversations } from "@/api/messenger";
import { useSocket } from "@/context/SocketContext";
import { MessageCircle, Plus } from "lucide-react";

interface MessengerViewProps {
    standalone?: boolean;
    onBack?: () => void;
}

export default function MessengerView({ standalone = false, onBack }: MessengerViewProps) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [activeCall, setActiveCall] = useState<{ targetUser: any, isIncoming: boolean, offer?: any } | null>(null);
    const { socket } = useSocket();

    const fetchConversations = async () => {
        try {
            const data = await getConversations();
            setConversations(data);
        } catch (error) {
            console.error("Failed to fetch conversations:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (data: any) => {
            const payload = data.message;
            if (!payload) return;
            // Update conversations list with last message
            setConversations(prev => {
                const index = prev.findIndex(c => c.conversationId === payload.conversationId);
                if (index === -1) {
                    // If not in list, fetch again (could be new conversation)
                    fetchConversations();
                    return prev;
                }

                const updated = [...prev];
                updated[index] = {
                    ...updated[index],
                    lastMessageId: payload.messageId,
                    lastMessageTime: new Date().toISOString(),
                    lastMessageContent: payload.messageType === 'text' ? payload.content : `Sent a ${payload.messageType}`
                };
                // Move to top
                const [conv] = updated.splice(index, 1);
                return [conv, ...updated];
            });
        };

        const handleIncomingCall = (data: any) => {
            setActiveCall({
                targetUser: data.offerUser || { userId: data.userId, username: "Unknown User" },
                isIncoming: true,
                offer: data.offer
            });
        };

        socket.on("newMessage", handleNewMessage);
        socket.on("voiceCallOffered", handleIncomingCall);
        return () => {
            socket.off("newMessage", handleNewMessage);
            socket.off("voiceCallOffered", handleIncomingCall);
        };
    }, [socket]);

    const handleChatStarted = (conversationId: string) => {
        setSelectedConversationId(conversationId);
        fetchConversations(); // Refresh list to include new conversation
    };

    const handleStartCall = (targetUser: any, type: 'voice' | 'video' = 'voice') => {
        if (type === 'video') {
            // For now, show a message that video calls are coming soon
            alert('Video calls are coming soon! Using voice call for now.');
            setActiveCall({ targetUser, isIncoming: false });
        } else {
            setActiveCall({ targetUser, isIncoming: false });
        }
    };

    const activeConversation = (conversations || []).find(c => c.conversationId === selectedConversationId);

    return (
        <div className={`flex h-full bg-white dark:bg-black overflow-hidden relative ${!standalone ? 'border-t border-zinc-100 dark:border-zinc-900' : ''}`}>
            {/* Sidebar / Conversation List */}
            <div className={`w-full md:w-80 lg:w-96 border-r border-zinc-100 dark:border-zinc-800 flex-shrink-0 ${selectedConversationId ? 'hidden md:flex' : 'flex'} flex-col`}>
                <ConversationList
                    conversations={conversations}
                    selectedId={selectedConversationId}
                    onSelect={setSelectedConversationId}
                    loading={loading}
                    onBack={onBack}
                />
            </div>

            {/* Main Chat Area */}
            <div className={`flex-1 flex flex-col min-w-0 ${!selectedConversationId ? 'hidden md:flex' : 'flex'}`}>
                {selectedConversationId && activeConversation ? (
                    <ChatWindow
                        conversation={activeConversation}
                        onBack={() => setSelectedConversationId(null)}
                        onStartCall={(type) => handleStartCall(activeConversation.members[0], type)}
                    />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-zinc-50/20 dark:bg-black/20 backdrop-blur-sm">
                        <div className="relative mb-8">
                            <div className="w-24 h-24 bg-gradient-to-tr from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 rounded-full flex items-center justify-center animate-pulse">
                                <MessageCircle className="w-12 h-12 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center shadow-lg border border-zinc-100 dark:border-zinc-800">
                                <Plus className="w-4 h-4 text-purple-600" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-black text-zinc-900 dark:text-white mb-3 tracking-tight">Your Inbox</h3>
                        <p className="text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed font-medium">
                            Connect with your friends, share stories, and start meaningful conversations across Viora.
                        </p>
                        <button
                            className="mt-10 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold transition-all shadow-xl shadow-purple-500/20 active:scale-95 hover:shadow-purple-500/30"
                            onClick={() => setIsSearchOpen(true)}
                        >
                            New Conversation
                        </button>
                    </div>
                )}
            </div>

            <UserSearchModal
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                onChatStarted={handleChatStarted}
            />

            {activeCall && (
                <VoiceCallOverlay
                    targetUser={activeCall.targetUser}
                    isIncoming={activeCall.isIncoming}
                    remoteOffer={activeCall.offer}
                    onEnd={() => setActiveCall(null)}
                />
            )}
        </div>
    );
}
