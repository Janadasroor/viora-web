"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X, User, Hash, MapPin, Image } from "lucide-react";
import { searchUnified } from "@/api/search";
import type { UnifiedSearch } from "@/models/SearchResponses";
import { useRouter } from "next/navigation";

interface SearchPopoverProps {
  onClose: () => void;
}

export default function SearchPopover({ onClose }: SearchPopoverProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UnifiedSearch | null>(null);
  const [loading, setLoading] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  useEffect(() => {
    const fetchResults = async () => {
      if (query.length < 2) {
        setResults(null);
        return;
      }

      setLoading(true);
      try {
        const data = await searchUnified(query);
        setResults(data);
      } catch (error) {
        console.error("Error fetching search results:", error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const data = await searchUnified(query);
      setResults(data);
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={popoverRef}
      className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden z-50 origin-top-right transform transition-all duration-200 ease-out"
    >
      <div className="p-4 border-b border-gray-100 dark:border-gray-800">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setResults(null);
            }}
            className="w-full pl-10 pr-10 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults(null);
                inputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {/* Loading State */}
        {loading && (
          <div className="p-8 text-center">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Searching...</p>
          </div>
        )}

        {/* Search Results */}
        {results && results.data && !loading && (
          <div className="py-2 space-y-4">
            {/* Users */}
            {results.data.users && results.data.users.length > 0 && (
              <div>
                <h4 className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Users
                </h4>
                {results.data.users.map((user) => (
                  <div
                    key={user.userId}
                    className="px-4 py-2 flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                    onClick={() => {
                      router.push(`/profile/${user.userId}`);
                      onClose();
                    }}
                  >
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      {user.media && user.media.length > 0 ? (
                        <img
                          src={`http://localhost:3003/${user.media[0].thumbnailPath || user.media[0].filePath}`}
                          alt={user.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold">
                          {user.username[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{user.username}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.displayName}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Hashtags */}
            {results.data.hashtags && results.data.hashtags.length > 0 && (
              <div>
                <h4 className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Hashtags
                </h4>
                {results.data.hashtags.map((hashtag) => (
                  <div
                    key={hashtag.hashtagId}
                    className="px-4 py-2 flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                  >
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                      <Hash className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">#{hashtag.tagName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{hashtag.postsCount} posts</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Locations */}
            {results.data.locations && results.data.locations.length > 0 && (
              <div>
                <h4 className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Locations
                </h4>
                {results.data.locations.map((location, index) => (
                  <div
                    key={`${location.location}-${index}`}
                    className="px-4 py-2 flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                  >
                    <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-full">
                      <MapPin className="w-4 h-4 text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{location.location}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{location.postsCount} posts</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Posts */}
            {results.data.posts && results.data.posts.length > 0 && (
              <div>
                <h4 className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Posts
                </h4>
                <div className="grid grid-cols-3 gap-1 px-4 pb-2">
                  {results.data.posts.map((post) => {
                    const firstMedia = post.media && post.media.length > 0 ? post.media[0] : null;
                    return (
                      <div
                        key={post.postId}
                        className="relative aspect-square bg-gray-200 dark:bg-gray-700 cursor-pointer overflow-hidden rounded-md"
                        onClick={() => {
                          // Navigate to post
                          router.push(`/post/${post.postId}`);
                          onClose();
                        }}
                      >
                        {firstMedia ? (
                          <img
                            src={`http://localhost:3003/${firstMedia.filePath}`}
                            alt={post.caption || "Post"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                            <Image className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty State */}
            {(!results.data.users || results.data.users.length === 0) &&
              (!results.data.hashtags || results.data.hashtags.length === 0) &&
              (!results.data.locations || results.data.locations.length === 0) &&
              (!results.data.posts || results.data.posts.length === 0) && (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <Search className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                  <p className="text-sm">No results found for "{query}"</p>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
}
