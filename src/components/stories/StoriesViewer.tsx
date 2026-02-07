"use client";
import React, { useState, useEffect, useCallback, useContext } from "react";
import { X, ChevronLeft, ChevronRight, MoreVertical, Trash2, Edit2, Eye, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Story, TextOverlayItem, StickerItem } from "@/types/api/story.types";
import { deleteStory, updateStory, likeStory, unlikeStory } from "@/api/stories";
import { AuthContext } from "@/context/AuthContext";
import StoryProgress from "./StoryProgress";
import StoryCard from "./StoryCard";
import StoryEditor from "./StoryEditor";
import { API_URL } from "@/constants/url";
import { useBigCount, toBigInt } from "@/hooks/useBigCount";
interface StoriesViewerProps {
    isOpen: boolean;
    onClose: () => void;
    stories: Story[];
    initialIndex?: number;
}

export default function StoriesViewer({
    isOpen,
    onClose,
    stories,
    initialIndex = 0
}: StoriesViewerProps) {
    const { user: currentUser } = useContext(AuthContext) || {};
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [isPaused, setIsPaused] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [editTextOverlays, setEditTextOverlays] = useState<TextOverlayItem[]>([]);
    const [editStickers, setEditStickers] = useState<StickerItem[]>([]);
    const [editVisibility, setEditVisibility] = useState("public");
    const [loading, setLoading] = useState(false);
    const [localStories, setLocalStories] = useState<Story[]>(stories);

    useEffect(() => {
        setLocalStories(stories);
    }, [stories]);

    const currentStory = localStories[currentIndex];
    const currentLikesBigInt = useBigCount(currentStory?.likesCount);

    const goToNext = useCallback(() => {
        if (currentIndex < localStories.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            onClose();
        }
    }, [currentIndex, localStories.length, onClose]);

    const goToPrevious = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    }, [currentIndex]);

    const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const third = rect.width / 3;

        if (x < third) {
            goToPrevious();
        } else if (x > third * 2) {
            goToNext();
        }
    }, [goToPrevious, goToNext]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') goToPrevious();
            if (e.key === 'ArrowRight') goToNext();
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen, goToPrevious, goToNext, onClose]);

    useEffect(() => {
        setCurrentIndex(initialIndex);
    }, [initialIndex, isOpen]);

    if (!isOpen || !currentStory) return null;

    const timeAgo = (date: Date) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        return `${hours}h ago`;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black flex items-center justify-center"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    {/* Story Content */}
                    <div
                        className="relative w-full h-full max-w-lg cursor-pointer"
                        onClick={handleClick}
                    >
                        {/* Progress Bars */}
                        <div className="absolute top-4 left-0 right-0 z-20">
                            <StoryProgress
                                segments={localStories.length}
                                currentIndex={currentIndex}
                                isPaused={isPaused || menuOpen || deleteConfirmOpen || editOpen}
                                duration={5000}
                                onComplete={goToNext}
                            />
                        </div>

                        {/* User Info */}
                        <div className="absolute top-8 left-0 right-0 z-20 px-4 mt-4">
                            <div className="flex items-center space-x-3">
                                {/* Avatar */}
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-0.5">
                                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                                        {currentStory.userMedia && currentStory.userMedia.length > 0 ? (
                                            <img
                                                src={API_URL + currentStory.userMedia[0].filePath}
                                                alt={currentStory.username}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-white text-sm font-bold">
                                                {currentStory.username?.[0]?.toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Username and Time */}
                                <div className="flex-1">
                                    <p className="text-white font-semibold text-sm">
                                        {currentStory.displayName || currentStory.username}
                                    </p>
                                    <p className="text-white/70 text-xs">
                                        {timeAgo(currentStory.createdAt)}
                                    </p>
                                </div>

                                {/* Menu Button (Owner Only) */}
                                {currentUser && currentStory.userId === currentUser.userId && (
                                    <div className="relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setMenuOpen(!menuOpen);
                                                setIsPaused(!menuOpen);
                                            }}
                                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                        >
                                            <MoreVertical className="w-6 h-6 text-white" />
                                        </button>

                                        {menuOpen && (
                                            <div className="absolute top-10 right-0 bg-gray-900 rounded-lg overflow-hidden min-w-[160px] shadow-xl border border-gray-800 z-50">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();

                                                        // Safely handle textOverlay which might be string (legacy) or array
                                                        let initialOverlays: TextOverlayItem[] = [];
                                                        if (Array.isArray(currentStory.textOverlay)) {
                                                            initialOverlays = currentStory.textOverlay;
                                                        } else if (typeof currentStory.textOverlay === 'string') {
                                                            try {
                                                                const parsed = JSON.parse(currentStory.textOverlay);
                                                                initialOverlays = Array.isArray(parsed) ? parsed : [];
                                                            } catch (e) {
                                                                console.warn("Failed to parse textOverlay", e);
                                                                initialOverlays = [];
                                                            }
                                                        }

                                                        // Safely handle stickers
                                                        let initialStickers: StickerItem[] = [];
                                                        if (Array.isArray(currentStory.stickers)) {
                                                            initialStickers = currentStory.stickers;
                                                        } else if (typeof currentStory.stickers === 'string') {
                                                            try {
                                                                const parsed = JSON.parse(currentStory.stickers);
                                                                initialStickers = Array.isArray(parsed) ? parsed : [];
                                                            } catch (e) {
                                                                console.warn("Failed to parse stickers", e);
                                                                initialStickers = [];
                                                            }
                                                        }

                                                        setEditTextOverlays(initialOverlays);
                                                        setEditStickers(initialStickers);
                                                        setEditVisibility(currentStory.visibility || "public");
                                                        setEditOpen(true);
                                                        setMenuOpen(false);
                                                    }}
                                                    className="w-full px-4 py-3 text-left text-sm text-white hover:bg-gray-800 transition-colors flex items-center gap-3"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                    Edit Story
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDeleteConfirmOpen(true);
                                                        setMenuOpen(false);
                                                    }}
                                                    className="w-full px-4 py-3 text-left text-sm text-red-500 hover:bg-gray-800 transition-colors flex items-center gap-3"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Delete Story
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Close Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onClose();
                                    }}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <X className="w-6 h-6 text-white" />
                                </button>
                            </div>
                        </div>

                        {/* Story Card */}
                        <div className="w-full h-full">
                            <StoryCard story={currentStory} />
                        </div>

                        {/* Interaction Overlay */}
                        <div className="absolute bottom-4 right-4 z-30 flex flex-col items-center gap-4">
                            {/* Like Button */}
                            <button
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    if (!currentUser) return;

                                    const isLiked = currentStory.isLiked;
                                    const newIsLiked = !isLiked;
                                    const currentLikes = toBigInt(currentStory.likesCount);
                                    const newLikesCount = currentLikes + BigInt(newIsLiked ? 1 : -1);

                                    // Optimistic update
                                    setLocalStories(prev => prev.map(s =>
                                        s.storyId === currentStory.storyId
                                            ? { ...s, isLiked: newIsLiked, likesCount: newLikesCount.toString() }
                                            : s
                                    ));

                                    try {
                                        if (newIsLiked) {
                                            await likeStory(currentStory.storyId);
                                        } else {
                                            await unlikeStory(currentStory.storyId);
                                        }
                                    } catch (error) {
                                        console.error("Failed to toggle like", error);
                                        // Revert on error
                                        setLocalStories(prev => prev.map(s =>
                                            s.storyId === currentStory.storyId
                                                ? { ...s, isLiked: isLiked, likesCount: currentStory.likesCount }
                                                : s
                                        ));
                                    }
                                }}
                                className="group flex flex-col items-center gap-1"
                            >
                                <div className={`p-3 rounded-full backdrop-blur-md transition-all ${currentStory.isLiked
                                    ? "bg-red-500/20 text-red-500"
                                    : "bg-black/20 text-white hover:bg-black/40"
                                    }`}>
                                    <Heart
                                        className={`w-6 h-6 transition-transform ${currentStory.isLiked ? "fill-current scale-110" : "group-hover:scale-110"
                                            }`}
                                    />
                                </div>
                                {currentLikesBigInt > BigInt(0) && (
                                    <span className="text-white text-xs font-medium drop-shadow-md">
                                        {currentLikesBigInt.toString()}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Navigation Hints (Desktop) */}
                        <div className="hidden md:flex absolute inset-y-0 left-0 right-0 pointer-events-none">
                            {currentIndex > 0 && (
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-auto">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            goToPrevious();
                                        }}
                                        className="p-2 bg-black/30 hover:bg-black/50 rounded-full transition-colors"
                                    >
                                        <ChevronLeft className="w-6 h-6 text-white" />
                                    </button>
                                </div>
                            )}
                            {currentIndex < localStories.length - 1 && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-auto">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            goToNext();
                                        }}
                                        className="p-2 bg-black/30 hover:bg-black/50 rounded-full transition-colors"
                                    >
                                        <ChevronRight className="w-6 h-6 text-white" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Delete Confirmation Dialog */}
                    {deleteConfirmOpen && (
                        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/70" onClick={(e) => e.stopPropagation()}>
                            <div className="bg-gray-900 rounded-2xl p-6 max-w-sm mx-4 border border-gray-800 w-full">
                                <h3 className="text-xl font-bold text-white mb-2">Delete Story?</h3>
                                <p className="text-gray-400 mb-6">
                                    Are you sure you want to delete this story? This action cannot be undone.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setDeleteConfirmOpen(false);
                                            setIsPaused(false);
                                        }}
                                        disabled={loading}
                                        className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={async () => {
                                            setLoading(true);
                                            try {
                                                const success = await deleteStory(currentStory.storyId);
                                                if (success) {
                                                    const newStories = localStories.filter(s => s.storyId !== currentStory.storyId);
                                                    if (newStories.length === 0) {
                                                        onClose();
                                                    } else {
                                                        setLocalStories(newStories);
                                                        if (currentIndex >= newStories.length) {
                                                            setCurrentIndex(newStories.length - 1);
                                                        }
                                                    }
                                                    setDeleteConfirmOpen(false);
                                                }
                                            } catch (error) {
                                                console.error("Failed to delete story", error);
                                            } finally {
                                                setLoading(false);
                                                setIsPaused(false);
                                            }
                                        }}
                                        disabled={loading}
                                        className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                                    >
                                        {loading ? "Deleting..." : "Delete"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Full Screen Edit Interface */}
                    {editOpen && (
                        <div className="absolute inset-0 z-[60] bg-black flex flex-col" onClick={(e) => e.stopPropagation()}>
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-sm z-50">
                                <button
                                    onClick={() => {
                                        setEditOpen(false);
                                        setIsPaused(false);
                                    }}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <X className="w-6 h-6 text-white" />
                                </button>
                                <h3 className="text-lg font-bold text-white">Edit Story</h3>
                                <button
                                    onClick={async () => {
                                        setLoading(true);
                                        try {
                                            const updatedStory = await updateStory(currentStory.storyId, {
                                                textOverlay: editTextOverlays,
                                                stickers: editStickers,
                                                visibility: editVisibility
                                            });
                                            if (updatedStory) {
                                                setLocalStories(prev => prev.map(s =>
                                                    s.storyId === currentStory.storyId ? updatedStory : s
                                                ));
                                                setEditOpen(false);
                                            }
                                        } catch (error) {
                                            console.error("Failed to update story", error);
                                        } finally {
                                            setLoading(false);
                                            setIsPaused(false);
                                        }
                                    }}
                                    disabled={loading}
                                    className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-semibold transition-colors disabled:opacity-50"
                                >
                                    {loading ? "Saving..." : "Save"}
                                </button>
                            </div>

                            {/* Editor Area */}
                            <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-gray-900">
                                <div className="relative aspect-[9/16] h-full max-h-[80vh] w-auto bg-black rounded-lg overflow-hidden shadow-2xl">
                                    <StoryEditor
                                        mediaUrl={API_URL + (currentStory.media?.[0]?.filePath || currentStory.fileName)}
                                        mediaType={currentStory.storyType === 'video' ? 'video' : 'photo'}
                                        textOverlays={editTextOverlays}
                                        stickers={editStickers}
                                        onUpdateTextOverlays={setEditTextOverlays}
                                        onUpdateStickers={setEditStickers}
                                        backgroundColor={currentStory.backgroundColor || '#000000'}
                                    />
                                </div>
                            </div>

                            {/* Bottom Controls */}
                            <div className="p-4 bg-black/50 backdrop-blur-sm z-50">
                                <div className="flex items-center justify-center gap-4 max-w-md mx-auto">
                                    <select
                                        value={editVisibility}
                                        onChange={(e) => setEditVisibility(e.target.value)}
                                        className="bg-gray-800 text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="public">Public</option>
                                        <option value="friends">Friends Only</option>
                                        <option value="private">Private</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
