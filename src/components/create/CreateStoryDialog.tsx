"use client";
import React, { useState } from "react";
import { X, Palette, Globe, Lock, Users, Upload, Trash2, Loader2 } from "lucide-react";
import { createStory } from "@/api/stories";
import { uploadImages, uploadVideos } from "@/api/media";
import type { StoryData, TextOverlayItem, StickerItem } from "@/types/api/story.types";
import StoryEditor from "../stories/StoryEditor";

interface CreateStoryDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (story: any) => void;
}

export default function CreateStoryDialog({ isOpen, onClose, onSubmit }: CreateStoryDialogProps) {
    const [textOverlays, setTextOverlays] = useState<TextOverlayItem[]>([]);
    const [stickers, setStickers] = useState<StickerItem[]>([]);
    const [backgroundColor, setBackgroundColor] = useState("#000000");
    const [visibility, setVisibility] = useState<string>("public");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [storyType, setStoryType] = useState<"photo" | "video" | "text">("photo");
    const [uploading, setUploading] = useState(false);

    // Reset state when dialog opens/closes
    React.useEffect(() => {
        if (!isOpen) {
            setUploading(false);
            setIsSubmitting(false);
            setTextOverlays([]);
            setStickers([]);
            setSelectedFile(null);
            setStoryType("photo");
        }
    }, [isOpen]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setStoryType(file.type.startsWith("video/") ? "video" : "photo");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile && textOverlays.length === 0 && stickers.length === 0) {
            alert("Please add some content (media, text, or stickers)");
            return;
        }

        setIsSubmitting(true);

        try {
            // Step 1: Create Story to get ID
            const storyData: StoryData = {
                storyType: storyType,
                content: null, // Will be updated after media upload
                textOverlay: textOverlays.length > 0 ? textOverlays : undefined,
                stickers: stickers.length > 0 ? stickers : undefined,
                backgroundColor: backgroundColor,
                visibility: visibility,
                status: storyType === 'text' ? 'published' : 'processing',
            };

            const result = await createStory(storyData);

            if (!result) {
                throw new Error("Failed to create story record");
            }

            // Step 2: Upload Media if present
            if (selectedFile && result.story) {
                setUploading(true);

                const uploadParams = {
                    files: [selectedFile],
                    targetId: result.story.storyId.toString(),
                    targetType: "STORY" as const,
                };

                let uploadResult;
                if (storyType === "video") {
                    uploadResult = await uploadVideos(uploadParams);
                } else {
                    uploadResult = await uploadImages(uploadParams);
                }

                if (!uploadResult.success) {
                    console.error("Failed to upload media:", uploadResult.error);
                    alert("Story created but media upload failed. Please try again.");
                    setUploading(false);
                    setIsSubmitting(false);
                    return;
                }

                onSubmit(result.story);
                onClose();
            } else {
                // Text story or something with no media processing needed
                onSubmit(result.story);
                onClose();
            }
        } catch (error) {
            console.error("Failed to create story:", error);
            alert("Failed to create story. Please try again.");
            setUploading(false);
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const colors = ["#000000", "#1a1a1a", "#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#a855f7", "#ec4899"];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create Story</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800" disabled={isSubmitting || uploading}>
                        <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    </button>
                </div>

                {/* Preview Area / Overlay */}
                <div className="aspect-[9/16] relative overflow-hidden">
                    {uploading && (
                        <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center p-8 space-y-4 text-center">
                            <Loader2 className="w-12 h-12 text-pink-500 animate-spin" />
                            <h3 className="text-white font-semibold">Uploading Story...</h3>
                            <p className="text-gray-300 text-xs text-balance">The story will process in the background. We'll notify you when it's ready.</p>
                        </div>
                    )}
                    <StoryEditor
                        mediaFile={selectedFile}
                        mediaType={storyType === "video" ? "video" : "photo"}
                        backgroundColor={backgroundColor}
                        textOverlays={textOverlays}
                        stickers={stickers}
                        onUpdateTextOverlays={setTextOverlays}
                        onUpdateStickers={setStickers}
                    />
                </div>

                {/* Controls */}
                {!uploading && (
                    <div className="p-4 space-y-4 overflow-y-auto">
                        {/* File Upload */}
                        <div className="flex justify-center">
                            <label className="cursor-pointer bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl flex items-center space-x-2 transition-colors">
                                <Upload className="w-5 h-5" />
                                <span>{selectedFile ? "Change Media" : "Upload Media"}</span>
                                <input type="file" accept="image/*,video/*" onChange={handleFileSelect} className="hidden" />
                            </label>
                            {selectedFile && (
                                <button
                                    onClick={() => { setSelectedFile(null); setStoryType("text"); }}
                                    className="ml-2 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        {/* Background Color (only if no file) */}
                        {!selectedFile && (
                            <div>
                                <div className="flex items-center space-x-2 mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    <Palette className="w-4 h-4" />
                                    <span>Background Color</span>
                                </div>
                                <div className="flex space-x-2 overflow-x-auto pb-2">
                                    {colors.map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setBackgroundColor(color)}
                                            className={`w-8 h-8 rounded-full border-2 ${backgroundColor === color ? "border-white ring-2 ring-purple-500" : "border-transparent"}`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Visibility */}
                        <div className="flex space-x-2">
                            {[
                                { value: "public", label: "Public", icon: Globe },
                                { value: "friends", label: "Friends", icon: Users },
                                { value: "private", label: "Private", icon: Lock },
                            ].map(({ value, label, icon: Icon }) => (
                                <button
                                    key={value}
                                    onClick={() => setVisibility(value)}
                                    className={`flex-1 py-2 rounded-xl text-sm font-medium flex items-center justify-center space-x-1 ${visibility === value
                                        ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 ring-1 ring-purple-500"
                                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                                        }`}
                                >
                                    <Icon className="w-3 h-3" />
                                    <span>{label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || (!selectedFile && textOverlays.length === 0 && stickers.length === 0)}
                            className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Sharing..." : "Share to Story"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
