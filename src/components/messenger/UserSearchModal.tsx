"use client";
import React, { useState, useEffect } from "react";
import { Search, X, User } from "lucide-react";
import { startPrivateChat } from "@/api/messenger";
import { apiUrl, jsonFetchOptions } from "@/api/config"; // Reusing constants if possible or defining local
import { searchUsers } from "@/api/search";
import { API_URL } from "@/constants/url";
import { SearchedUser } from "@/models/SearchResponses";
import { useAuth } from "@/context/AuthContext";

export default function UserSearchModal({ isOpen, onClose, onChatStarted }: {
    isOpen: boolean,
    onClose: () => void,
    onChatStarted: (conversationId: string) => void
}) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchedUser[]>([]);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    useEffect(() => {
        const fetchUsers = async () => {
            if (query.length < 2) {
                setResults([]);
                return;
            }
            setLoading(true);
            try {
                const data = await searchUsers(query);
                if (data?.data) {
                    setResults(data.data);
                }
            } catch (error) {
                console.error("Search failed:", error);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(fetchUsers, 300);
        return () => clearTimeout(timer);
    }, [query]);

    const handleStartChat = async (toUsername: string) => {
        try {
            // Need fromUsername. Ideally we have session info. 
            // For now, let's assume the API handles it with userId from token.
            // Wait, startPrivateChat needs fromUsername and toUsername in body.
            // Actually, MessengerController.ts line 31 uses fromUsername and toUsername.
            // I should get current user info.

            // Let's check how to get current user. 
            // Many apps store it in localStorage or a context.

            if (!user) {
                alert("User session not found");
                return;
            }
            const conversationId = await startPrivateChat(user.username!, toUsername);
            console.log("Conversation ID:", conversationId);
            if (conversationId) {
                onChatStarted(conversationId);
                onClose();
            }
        } catch (error) {
            console.error("Failed to start chat:", error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">New Conversation</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by username or name..."
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-gray-900 dark:text-white transition-all"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                <div className="max-h-[300px] overflow-y-auto">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Searching...</div>
                    ) : results.length > 0 ? (
                        <div className="p-2">
                            {results.map((user) => (
                                <button
                                    key={user.userId}
                                    onClick={() => handleStartChat(user.username)}
                                    className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors text-left"
                                >
                                    <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center overflow-hidden">
                                        {(() => {
                                            const imgPath = user.media?.[0]?.filePath || (user as any).profilePictureUrl;
                                            if (imgPath) {
                                                const src = imgPath.startsWith('http') ? imgPath : `${API_URL}${imgPath}`;
                                                return <img src={src} alt={user.username} className="w-full h-full object-cover" />;
                                            }
                                            return <User className="w-6 h-6 text-purple-600 dark:text-purple-400" />;
                                        })()}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900 dark:text-white">
                                            {user.displayName || user.username}
                                        </div>
                                        <div className="text-sm text-gray-500">@{user.username}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : query.length >= 2 ? (
                        <div className="p-8 text-center text-gray-500">No users found for "{query}"</div>
                    ) : (
                        <div className="p-8 text-center text-gray-400 text-sm">
                            Enter at least 2 characters to search
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
