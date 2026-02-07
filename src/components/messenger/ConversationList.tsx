"use client";
import React, { useState } from "react";
import { Search, Plus, ArrowLeft } from "lucide-react";
import { Conversation } from "@/api/messenger";
import { formatDistanceToNow } from "date-fns";

interface ConversationListProps {
    conversations: Conversation[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    loading: boolean;
    onBack?: () => void;
}

export default function ConversationList({ conversations, selectedId, onSelect, loading, onBack }: ConversationListProps) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredConversations = conversations.filter(conv => {
        const name = conv.name || conv.members.map(m => m.displayName || m.username).join(", ");
        return name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <div className="flex flex-col h-full bg-white dark:bg-black">
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-900">
                <div className="flex items-center gap-4 mb-6">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="p-2 -ml-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl text-zinc-500 transition-all active:scale-90"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                    )}
                    <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">Messages</h2>
                    <div className="flex-1" />
                    <div className="flex items-center gap-1">
                        <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl text-zinc-500 transition-all active:scale-95">
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <div className="relative group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-purple-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search messages..."
                        className="w-full pl-11 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border-none rounded-2xl text-[13px] font-medium focus:ring-2 focus:ring-purple-500/20 dark:text-white placeholder:text-zinc-400 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {loading ? (
                    <div className="p-6 space-y-6">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="flex items-center space-x-4 animate-pulse">
                                <div className="w-14 h-14 bg-zinc-100 dark:bg-zinc-900 rounded-full" />
                                <div className="flex-1 space-y-3">
                                    <div className="h-4 bg-zinc-100 dark:bg-zinc-900 rounded w-1/3" />
                                    <div className="h-3 bg-zinc-50 dark:bg-zinc-900/50 rounded w-3/4" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredConversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                        <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-4 text-zinc-300">
                            <Search className="w-8 h-8" />
                        </div>
                        <p className="text-zinc-500 text-sm font-medium">
                            {searchQuery ? `No results for "${searchQuery}"` : "No conversations yet"}
                        </p>
                    </div>
                ) : (
                    <div className="py-2">
                        {filteredConversations.map(conv => {
                            const isSelected = selectedId === conv.conversationId;
                            return (
                                <button
                                    key={conv.conversationId}
                                    onClick={() => onSelect(conv.conversationId)}
                                    className={`w-full px-4 py-3 flex items-center gap-4 transition-all relative group ${isSelected
                                        ? "bg-zinc-50 dark:bg-zinc-900"
                                        : "hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50"
                                        }`}
                                >
                                    {isSelected && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-purple-600 rounded-r-full" />
                                    )}

                                    <div className="relative flex-shrink-0">
                                        <div className={`w-14 h-14 rounded-full p-[2px] ${isSelected ? 'bg-gradient-to-tr from-purple-500 to-pink-500' : 'bg-zinc-200 dark:bg-zinc-800'}`}>
                                            <div className="w-full h-full rounded-full border-2 border-white dark:border-black overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                                                {conv.members[0]?.avatarUrl ? (
                                                    <img src={conv.members[0].avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-lg">
                                                        {(conv.name || conv.members[0]?.displayName || conv.members[0]?.username || "?")[0].toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-black shadow-sm" />
                                    </div>

                                    <div className="flex-1 min-w-0 text-left">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <h3 className={`font-bold truncate text-[15px] ${isSelected ? 'text-zinc-900 dark:text-white' : 'text-zinc-700 dark:text-zinc-300'}`}>
                                                {conv.name || conv.members.map(m => m.displayName || m.username).join(", ")}
                                            </h3>
                                            {conv.lastMessageTime && (
                                                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter whitespace-nowrap">
                                                    {formatDistanceToNow(new Date(conv.lastMessageTime), { addSuffix: false })}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between gap-3">
                                            <p className={`text-[13px] truncate ${isSelected || conv.unreadCount ? 'text-zinc-900 dark:text-zinc-100 font-semibold' : 'text-zinc-500 font-medium'}`}>
                                                {conv.lastMessageContent || "Tap to start chatting"}
                                            </p>
                                            {conv.unreadCount ? (
                                                <span className="bg-purple-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg shadow-purple-500/30">
                                                    {conv.unreadCount}
                                                </span>
                                            ) : null}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
