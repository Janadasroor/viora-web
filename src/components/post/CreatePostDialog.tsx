"use client";
import React, { useState } from "react";
import { X, Image as ImageIcon, Video, MapPin, Hash, Globe, Lock, Users, UserCheck, Upload, Trash2, Loader2 } from "lucide-react";
import type { CreatePostRequest, CreatePostResponse } from "@/models/PostRequests";
import { uploadImages, uploadVideos } from "@/api/media";

interface CreatePostDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (request: CreatePostRequest) => Promise<CreatePostResponse | null | void>;
}

export default function CreatePostDialog({ isOpen, onClose, onSubmit }: CreatePostDialogProps) {
    const [caption, setCaption] = useState("");
    const [postType, setPostType] = useState<string>("photo");
    const [visibility, setVisibility] = useState<string>("public");
    const [location, setLocation] = useState("");
    const [hashtags, setHashtags] = useState("");
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Reset state when dialog opens/closes
    React.useEffect(() => {
        if (!isOpen) {
            setUploading(false);
            setCaption("");
            setPostType("photo");
            setVisibility("public");
            setLocation("");
            setHashtags("");
            setSelectedFiles([]);
            setIsSubmitting(false);
        }
    }, [isOpen]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const fileArray = Array.from(files);
            setSelectedFiles(prev => [...prev, ...fileArray]);
        }
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!caption.trim()) {
            alert("Please enter a caption");
            return;
        }

        setIsSubmitting(true);

        try {
            const hashtagArray = hashtags
                .split(/[\s,]+/)
                .filter(tag => tag.trim())
                .map(tag => tag.startsWith('#') ? tag.slice(1) : tag);

            const request: CreatePostRequest = {
                caption: caption.trim(),
                postType,
                visibility,
                location: location.trim() || undefined,
                hashtags: hashtagArray.length > 0 ? hashtagArray : undefined,
                status: selectedFiles.length === 0 ? 'published' : 'processing',
            };

            // Step 1: Create the post to get post ID
            const response = await onSubmit(request);

            // Step 2: Upload media files if any are selected
            if (selectedFiles.length > 0 && response) {
                const postId = (response as any)?.postId;

                if (postId) {
                    setUploading(true);

                    const uploadParams = {
                        files: selectedFiles,
                        title: caption.trim(),
                        targetId: postId.toString(),
                        targetType: "POST" as const,
                    };

                    // Upload based on post type
                    let uploadCurrentSuccess = false;
                    if (postType === "video") {
                        const uploadResult = await uploadVideos(uploadParams);
                        uploadCurrentSuccess = uploadResult.success;
                    } else {
                        const uploadResult = await uploadImages(uploadParams);
                        uploadCurrentSuccess = uploadResult.success;
                    }

                    if (!uploadCurrentSuccess) {
                        alert("Post created but failed to upload media. Please try again.");
                        setUploading(false);
                        setIsSubmitting(false);
                        return;
                    }

                    onClose();
                } else {
                    onClose();
                }
            } else {
                onClose();
            }
        } catch (error) {
            console.error("Failed to create post:", error);
            alert("Failed to create post. Please try again.");
            setIsSubmitting(false);
            setUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 bg-clip-text text-transparent">
                        Create New Post
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        disabled={isSubmitting || uploading}
                    >
                        <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    </button>
                </div>

                {/* Uploading Overlay */}
                {uploading ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-6">
                        <div className="relative">
                            <Loader2 className="w-16 h-16 text-purple-600 animate-spin" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Uploading Media...</h3>
                            <p className="text-gray-500 mt-2">Hang tight while we upload your files. Processing will continue in the background.</p>
                        </div>
                    </div>
                ) : (
                    /* Form */
                    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Caption */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Caption *
                            </label>
                            <textarea
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                placeholder="What's on your mind?"
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all"
                                rows={4}
                                disabled={isSubmitting}
                                required
                            />
                        </div>

                        {/* File Upload */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Media Files {postType !== "photo" && postType !== "video" && postType !== "carousel" && "(Optional)"}
                            </label>
                            <div className="space-y-3">
                                <label className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer hover:border-purple-500 dark:hover:border-purple-500 transition-all bg-gray-50 dark:bg-gray-800/50">
                                    <div className="flex flex-col items-center space-y-2">
                                        <Upload className="w-8 h-8 text-gray-400" />
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            Click to upload {postType === "video" ? "videos" : "images"}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {postType === "video" ? "MP4, WebM, or OGG" : "PNG, JPG, or GIF"}
                                        </span>
                                    </div>
                                    <input
                                        type="file"
                                        multiple
                                        accept={postType === "video" ? "video/*" : "image/*"}
                                        onChange={handleFileSelect}
                                        className="hidden"
                                        disabled={isSubmitting}
                                    />
                                </label>

                                {/* File Preview */}
                                {selectedFiles.length > 0 && (
                                    <div className="grid grid-cols-3 gap-3">
                                        {selectedFiles.map((file, index) => (
                                            <div key={index} className="relative group">
                                                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                                                    {file.type.startsWith("image/") ? (
                                                        <img
                                                            src={URL.createObjectURL(file)}
                                                            alt={file.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Video className="w-8 h-8 text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(index)}
                                                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    disabled={isSubmitting}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <p className="mt-1 text-xs text-gray-500 truncate">{file.name}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Post Type */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Post Type
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {["photo", "video", "carousel"].map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setPostType(type)}
                                        className={`px-4 py-3 rounded-xl font-medium capitalize transition-all ${postType === type
                                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                                            : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                            }`}
                                        disabled={isSubmitting}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Visibility */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Visibility
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { value: "public", label: "Public", icon: Globe },
                                    { value: "private", label: "Private", icon: Lock },
                                    { value: "friends", label: "Friends", icon: Users },
                                    { value: "close_friends", label: "Close Friends", icon: UserCheck },
                                ].map(({ value, label, icon: Icon }) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setVisibility(value)}
                                        className={`px-4 py-3 rounded-xl font-medium flex items-center justify-center space-x-2 transition-all ${visibility === value
                                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                                            : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                            }`}
                                        disabled={isSubmitting}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span>{label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Location (Optional)
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="Add a location"
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>

                        {/* Hashtags */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Hashtags (Optional)
                            </label>
                            <div className="relative">
                                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={hashtags}
                                    onChange={(e) => setHashtags(e.target.value)}
                                    placeholder="Add hashtags (separated by spaces or commas)"
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    disabled={isSubmitting}
                                />
                            </div>
                            {hashtags && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {hashtags
                                        .split(/[\s,]+/)
                                        .filter(tag => tag.trim())
                                        .map((tag, idx) => (
                                            <span
                                                key={idx}
                                                className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium"
                                            >
                                                #{tag.startsWith('#') ? tag.slice(1) : tag}
                                            </span>
                                        ))}
                                </div>
                            )}
                        </div>
                    </form>
                )}

                {/* Footer */}
                {!uploading && (
                    <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 hover:shadow-lg hover:shadow-purple-200 dark:hover:shadow-purple-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Creating..." : "Create Post"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
