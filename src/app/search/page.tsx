"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, X, User, Hash, MapPin, Image, Grid, ArrowLeft } from "lucide-react";
import { searchUnified, searchPosts, searchUsers, searchHashtags } from "@/api/search";
import { getSuggestedPosts } from "@/api/feed";
import type { UnifiedSearch } from "@/models/SearchResponses";
import type { Post } from "@/models/Post";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL } from "@/constants/url";

type TabType = "all" | "posts" | "users" | "hashtags";

export default function SearchPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialQuery = searchParams.get("q") || "";

    const [query, setQuery] = useState(initialQuery);
    const [results, setResults] = useState<UnifiedSearch | null>(null);
    const [loading, setLoading] = useState(false);
    const [suggestedPosts, setSuggestedPosts] = useState<Post[]>([]);
    const [loadingSuggested, setLoadingSuggested] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>("all");
    const inputRef = useRef<HTMLInputElement>(null);

    // Pagination/Deep Search State
    const [deepResults, setDeepResults] = useState<{
        posts: Post[];
        users: any[];
        hashtags: any[];
    }>({ posts: [], users: [], hashtags: [] });
    const [cursors, setCursors] = useState<{
        posts: string | null | undefined;
        users: string | null | undefined;
        hashtags: string | null | undefined;
    }>({ posts: undefined, users: undefined, hashtags: undefined });
    const [hasMoreMap, setHasMoreMap] = useState<Record<string, boolean>>({
        posts: false,
        users: false,
        hashtags: false
    });
    const [loadingMore, setLoadingMore] = useState(false);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const scrollEndRef = useRef<HTMLDivElement>(null);

    // Fetch suggested posts on mount
    useEffect(() => {
        const fetchSuggestedPosts = async () => {
            setLoadingSuggested(true);
            try {
                const posts = await getSuggestedPosts(1, 30);
                setSuggestedPosts(posts.data);
            } catch (error) {
                console.error("Error fetching suggested posts:", error);
            } finally {
                setLoadingSuggested(false);
            }
        };

        fetchSuggestedPosts();
    }, []);

    // Perform search when query changes (debounced) or on mount if query exists
    useEffect(() => {
        if (!query.trim()) {
            setResults(null);
            setActiveTab("all");
            return;
        }

        const performSearch = async () => {
            setLoading(true);
            setDeepResults({ posts: [], users: [], hashtags: [] });
            setCursors({ posts: undefined, users: undefined, hashtags: undefined });
            setHasMoreMap({ posts: false, users: false, hashtags: false });

            try {
                const data = await searchUnified(query);
                setResults(data);

                // If we're on a specific tab, we should also trigger the initial deep fetch
                // OR we can just rely on the results from unified for the first few items.
                // But cursors are only in the specific endpoints.
            } catch (error) {
                console.error("Error searching:", error);
            } finally {
                setLoading(false);
            }
        };

        const debounceTimer = setTimeout(performSearch, 300);
        return () => clearTimeout(debounceTimer);
    }, [query]);

    // Handle initial deep fetch when tab changes
    useEffect(() => {
        if (!query || activeTab === "all") return;

        const initialDeepFetch = async () => {
            setLoading(true);
            try {
                let data: any;
                if (activeTab === "posts") {
                    data = await searchPosts(query, 1, 20);
                    if (data) {
                        setDeepResults(prev => ({ ...prev, posts: data.data }));
                        setCursors(prev => ({ ...prev, posts: data.nextCursor }));
                        setHasMoreMap(prev => ({ ...prev, posts: !!data.nextCursor }));
                    }
                } else if (activeTab === "users") {
                    data = await searchUsers(query, 1, 20);
                    if (data) {
                        setDeepResults(prev => ({ ...prev, users: data.data }));
                        setCursors(prev => ({ ...prev, users: data.nextCursor }));
                        setHasMoreMap(prev => ({ ...prev, users: !!data.nextCursor }));
                    }
                } else if (activeTab === "hashtags") {
                    data = await searchHashtags(query, 1, 20);
                    if (data) {
                        setDeepResults(prev => ({ ...prev, hashtags: data.data }));
                        setCursors(prev => ({ ...prev, hashtags: data.nextCursor }));
                        setHasMoreMap(prev => ({ ...prev, hashtags: !!data.nextCursor }));
                    }
                }
            } catch (error) {
                console.error("Deep search error:", error);
            } finally {
                setLoading(false);
            }
        };

        if (deepResults[activeTab as keyof typeof deepResults]?.length === 0) {
            initialDeepFetch();
        }
    }, [activeTab, query]);

    const fetchMore = async () => {
        if (loadingMore || !query || activeTab === "all") return;

        const currentCursor = cursors[activeTab as keyof typeof cursors];
        if (!currentCursor || !hasMoreMap[activeTab]) return;

        setLoadingMore(true);
        try {
            if (activeTab === "posts") {
                const data = await searchPosts(query, 1, 20, "relevance", currentCursor);
                if (data) {
                    setDeepResults(prev => ({ ...prev, posts: [...prev.posts, ...data.data] }));
                    setCursors(prev => ({ ...prev, posts: data.nextCursor }));
                    setHasMoreMap(prev => ({ ...prev, posts: !!data.nextCursor }));
                }
            } else if (activeTab === "users") {
                const data = await searchUsers(query, 1, 20, currentCursor);
                if (data) {
                    setDeepResults(prev => ({ ...prev, users: [...prev.users, ...data.data] }));
                    setCursors(prev => ({ ...prev, users: data.nextCursor }));
                    setHasMoreMap(prev => ({ ...prev, users: !!data.nextCursor }));
                }
            } else if (activeTab === "hashtags") {
                const data = await searchHashtags(query, 1, 20, currentCursor);
                if (data) {
                    setDeepResults(prev => ({ ...prev, hashtags: [...prev.hashtags, ...data.data] }));
                    setCursors(prev => ({ ...prev, hashtags: data.nextCursor }));
                    setHasMoreMap(prev => ({ ...prev, hashtags: !!data.nextCursor }));
                }
            }
        } catch (error) {
            console.error("Fetch more error:", error);
        } finally {
            setLoadingMore(false);
        }
    };

    // Infinite Scroll Observer
    useEffect(() => {
        if (observerRef.current) observerRef.current.disconnect();

        observerRef.current = new IntersectionObserver((entries) => {
            if (entries[0]?.isIntersecting && !loadingMore && hasMoreMap[activeTab]) {
                fetchMore();
            }
        }, { threshold: 0.1 });

        if (scrollEndRef.current) {
            observerRef.current.observe(scrollEndRef.current);
        }

        return () => observerRef.current?.disconnect();
    }, [activeTab, hasMoreMap, cursors, loadingMore, query]);

    // Update URL when query changes
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (query) {
            params.set("q", query);
        } else {
            params.delete("q");
        }
        router.replace(`/search?${params.toString()}`, { scroll: false });
    }, [query, router, searchParams]);

    const handleClear = () => {
        setQuery("");
        setResults(null);
        setActiveTab("all");
        inputRef.current?.focus();
    };

    const hasResults = results && results.data;
    const hasUsers = hasResults && results.data.users && results.data.users.length > 0;
    const hasHashtags = hasResults && results.data.hashtags && results.data.hashtags.length > 0;
    const hasPosts = hasResults && results.data.posts && results.data.posts.length > 0;
    const hasLocations = hasResults && results.data.locations && results.data.locations.length > 0;

    return (
        <div className="min-h-screen bg-white dark:bg-black pb-20 md:pb-0 md:pl-72">
            {/* Header / Search Bar */}
            <div className="sticky top-0 z-10 bg-white dark:bg-black border-b border-gray-100 dark:border-gray-800">
                <div className="px-4 py-4">
                    <div className="max-w-3xl mx-auto flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="md:hidden p-2 -ml-2 text-gray-600 dark:text-gray-400"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Search users, hashtags, posts..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="w-full pl-10 pr-10 py-3 bg-gray-100 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-blue-500 text-base text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                autoFocus
                            />
                            {query && (
                                <button
                                    onClick={handleClear}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs - Show only when there are search results */}
                {hasResults && (
                    <div className="border-t border-gray-100 dark:border-gray-800">
                        <div className="max-w-3xl mx-auto px-4">
                            <div className="flex gap-1 overflow-x-auto scrollbar-hide">
                                <button
                                    onClick={() => setActiveTab("all")}
                                    className={`px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${activeTab === "all"
                                        ? "border-gray-900 dark:border-white text-gray-900 dark:text-white"
                                        : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                        }`}
                                >
                                    All
                                </button>
                                {hasPosts && (
                                    <button
                                        onClick={() => setActiveTab("posts")}
                                        className={`px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${activeTab === "posts"
                                            ? "border-gray-900 dark:border-white text-gray-900 dark:text-white"
                                            : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                            }`}
                                    >
                                        Posts
                                    </button>
                                )}
                                {hasUsers && (
                                    <button
                                        onClick={() => setActiveTab("users")}
                                        className={`px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${activeTab === "users"
                                            ? "border-gray-900 dark:border-white text-gray-900 dark:text-white"
                                            : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                            }`}
                                    >
                                        Users
                                    </button>
                                )}
                                {hasHashtags && (
                                    <button
                                        onClick={() => setActiveTab("hashtags")}
                                        className={`px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${activeTab === "hashtags"
                                            ? "border-gray-900 dark:border-white text-gray-900 dark:text-white"
                                            : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                            }`}
                                    >
                                        Hashtags
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="max-w-3xl mx-auto px-4 py-6">
                {loading && !results && (
                    <div className="flex justify-center py-12">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}

                {/* Suggested Posts - Show when no query */}
                {!query && !loading && (
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                            Explore
                        </h2>
                        {loadingSuggested ? (
                            <div className="flex justify-center py-12">
                                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : suggestedPosts.length > 0 ? (
                            <div className="grid grid-cols-3 gap-1 md:gap-4">
                                {suggestedPosts.map((post) => {
                                    const firstMedia = post.media && post.media.length > 0 ? post.media[0] : null;
                                    return (
                                        <div
                                            key={post.postId}
                                            onClick={() => router.push(`/posts/${post.userId}?postId=${post.postId}`)}
                                            className="relative aspect-square bg-gray-200 dark:bg-gray-800 cursor-pointer overflow-hidden rounded-md md:rounded-xl group"
                                        >
                                            {firstMedia ? (
                                                <img
                                                    src={`${API_URL}${firstMedia.thumbnailPath || firstMedia.filePath}`}
                                                    alt={post.caption || "Post"}
                                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <Grid className="w-8 h-8" />
                                                </div>
                                            )}
                                            {/* Hover Overlay */}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white font-bold">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-lg">❤️</span>
                                                    <span>{post.likesCount}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-lg">💬</span>
                                                    <span>{post.commentsCount}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                <Grid className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                <p className="text-lg">No suggested posts available</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Search Results */}
                {results && (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-8"
                        >
                            {/* All Tab - Show everything */}
                            {activeTab === "all" && (
                                <>
                                    {/* Users Section */}
                                    {hasUsers && (
                                        <section>
                                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                                <User className="w-5 h-5" />
                                                People
                                            </h2>
                                            <div className="space-y-2">
                                                {results.data.users.map((user) => (
                                                    <div
                                                        key={user.userId}
                                                        onClick={() => router.push(`/profile/${user.userId}`)}
                                                        className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                                                    >
                                                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex-shrink-0">
                                                            {(() => {
                                                                const imgPath = user.profilePictureUrl || (user.media && user.media[0] ? (user.media[0].thumbnailPath || user.media[0].filePath) : null);
                                                                if (imgPath) {
                                                                    const src = imgPath.startsWith('http') ? imgPath : `${API_URL}${imgPath}`;
                                                                    return <img src={src} alt={user.username} className="w-full h-full object-cover" />;
                                                                }
                                                                return (
                                                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold text-xl">
                                                                        {(user.username || "U")[0].toUpperCase()}
                                                                    </div>
                                                                );
                                                            })()}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-semibold text-gray-900 dark:text-white truncate">
                                                                {user.username}
                                                            </p>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                                {user.displayName}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                    {/* Hashtags Section */}
                                    {hasHashtags && (
                                        <section>
                                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                                <Hash className="w-5 h-5" />
                                                Hashtags
                                            </h2>
                                            <div className="flex flex-wrap gap-2">
                                                {results.data.hashtags.map((hashtag) => (
                                                    <div
                                                        key={hashtag.hashtagId}
                                                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                                                    >
                                                        <Hash className="w-4 h-4" />
                                                        <span className="font-medium">{hashtag.tagName}</span>
                                                        <span className="text-xs opacity-70">({hashtag.postsCount})</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                    {/* Locations Section */}
                                    {hasLocations && (
                                        <section>
                                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                                <MapPin className="w-5 h-5" />
                                                Locations
                                            </h2>
                                            <div className="flex flex-wrap gap-2">
                                                {results.data.locations.map((location, index) => (
                                                    <div
                                                        key={`${location.location}-${index}`}
                                                        className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                                                    >
                                                        <MapPin className="w-4 h-4" />
                                                        <span className="font-medium">{location.location}</span>
                                                        <span className="text-xs opacity-70">({location.postsCount})</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                    {/* Posts Section */}
                                    {hasPosts && (
                                        <section>
                                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                                <Image className="w-5 h-5" />
                                                Posts
                                            </h2>
                                            <div className="grid grid-cols-3 gap-1 md:gap-4">
                                                {results.data.posts.map((post) => {
                                                    const firstMedia = post.media && post.media.length > 0 ? post.media[0] : null;
                                                    return (
                                                        <div
                                                            key={post.postId}
                                                            onClick={() => router.push(`/posts/${post.userId}?postId=${post.postId}`)}
                                                            className="relative aspect-square bg-gray-200 dark:bg-gray-800 cursor-pointer overflow-hidden rounded-md md:rounded-xl group"
                                                        >
                                                            {firstMedia ? (
                                                                <img
                                                                    src={`${API_URL}${firstMedia.filePath || firstMedia.thumbnailPath}`}
                                                                    alt={post.caption || "Post"}
                                                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                    <Grid className="w-8 h-8" />
                                                                </div>
                                                            )}
                                                            {/* Hover Overlay */}
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white font-bold">
                                                                <div className="flex items-center gap-1">
                                                                    <span className="text-lg">❤️</span>
                                                                    <span>{post.likesCount}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <span className="text-lg">💬</span>
                                                                    <span>{post.commentsCount}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </section>
                                    )}
                                </>
                            )}

                            {/* Posts Tab */}
                            {activeTab === "posts" && (
                                <div className="grid grid-cols-3 gap-1 md:gap-4">
                                    {(deepResults.posts || []).map((post) => {
                                        const firstMedia = post.media && post.media.length > 0 ? post.media[0] : null;
                                        return (
                                            <div
                                                key={post.postId}
                                                onClick={() => router.push(`/posts/${post.userId}?postId=${post.postId}`)}
                                                className="relative aspect-square bg-gray-200 dark:bg-gray-800 cursor-pointer overflow-hidden rounded-md md:rounded-xl group"
                                            >
                                                {firstMedia ? (
                                                    <img
                                                        src={`${API_URL}${firstMedia.filePath || firstMedia.thumbnailPath}`}
                                                        alt={post.caption || "Post"}
                                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                        <Grid className="w-8 h-8" />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white font-bold">
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-lg">❤️</span>
                                                        <span>{post.likesCount}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-lg">💬</span>
                                                        <span>{post.commentsCount}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Users Tab */}
                            {activeTab === "users" && (
                                <div className="space-y-2">
                                    {(deepResults.users || []).map((user) => (
                                        <div
                                            key={user.userId}
                                            onClick={() => router.push(`/profile/${user.userId}`)}
                                            className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                                        >
                                            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex-shrink-0">
                                                {(() => {
                                                    const imgPath = user.profilePictureUrl || (user.media && user.media[0] ? (user.media[0].thumbnailPath || user.media[0].filePath) : null);
                                                    if (imgPath) {
                                                        const src = imgPath.startsWith('http') ? imgPath : `${API_URL}${imgPath}`;
                                                        return <img src={src} alt={user.username} className="w-full h-full object-cover" />;
                                                    }
                                                    return (
                                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold text-xl">
                                                            {(user.username || "U")[0].toUpperCase()}
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-gray-900 dark:text-white truncate">
                                                    {user.username}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                    {user.displayName}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Hashtags Tab */}
                            {activeTab === "hashtags" && (
                                <div className="flex flex-wrap gap-2">
                                    {(deepResults.hashtags || []).map((hashtag) => (
                                        <div
                                            key={hashtag.hashtagId}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                                        >
                                            <Hash className="w-4 h-4" />
                                            <span className="font-medium">{hashtag.tagName}</span>
                                            <span className="text-xs opacity-70">({hashtag.postsCount})</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Loading More Indicator */}
                            {loadingMore && (
                                <div className="flex justify-center py-4">
                                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}

                            {/* Intersection Observer Trigger */}
                            <div ref={scrollEndRef} className="h-4" />

                            {/* Empty State */}
                            {activeTab === "all" ? (
                                (!hasUsers && !hasHashtags && !hasLocations && !hasPosts) && (
                                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                        <Search className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                        <p>No results found for "{query}"</p>
                                    </div>
                                )
                            ) : (
                                deepResults[activeTab as keyof typeof deepResults]?.length === 0 && !loading && (
                                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                        <Search className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                        <p>No results found in {activeTab} for "{query}"</p>
                                    </div>
                                )
                            )}
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}
