"use client";
import React, { useState } from "react";
import { X, Video, Upload, Trash2, Globe, Lock, Users, Loader2 } from "lucide-react";
import { createReel } from "@/api/reels";
import { uploadVideos } from "@/api/media";
import type { CreateReelPayload } from "@/api/reels";

interface CreateReelDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (reel: any) => void;
}

export default function CreateReelDialog({ isOpen, onClose, onSubmit }: CreateReelDialogProps) {
    const [caption, setCaption] = useState("");
    const [visibility, setVisibility] = useState<"public" | "private" | "friends">("public");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Reset state when dialog opens/closes
    React.useEffect(() => {
        if (!isOpen) {
            setUploading(false);
            setIsSubmitting(false);
            setCaption("");
            setSelectedFile(null);
            setVisibility("public");
        }
    }, [isOpen]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith("video/")) {
                alert("Please select a video file");
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) {
            alert("Please select a video file");
            return;
        }

        setIsSubmitting(true);

        try {
            // Step 1: Create Reel to get ID
            const payload: CreateReelPayload = {
                caption,
                visibility,
                // TODO: Replace with real media ID
                mediaId: "00000000-0000-0000-0000-000000000000", // Placeholder
                status: 'processing',
            };

            const reel = await createReel(payload);

            if (!reel) {
                throw new Error("Failed to create reel record");
            }

            // Step 2: Upload Video
            setUploading(true);

            const uploadParams = {
                files: [selectedFile],
                title: caption,
                targetId: reel.reelId,
                targetType: "REEL" as const,
            };

            const uploadResult = await uploadVideos(uploadParams);

            if (!uploadResult.success) {
                console.error("Failed to upload video:", uploadResult.error);
                alert("Reel created but video upload failed. Please try again.");
                setUploading(false);
                setIsSubmitting(false);
            } else {
                onSubmit(reel);
                onClose();
            }
        } catch (error) {
            console.error("Failed to create reel:", error);
            alert("Failed to create reel. Please try again.");
            setUploading(false);
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create Reel</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800" disabled={isSubmitting || uploading}>
                        <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    </button>
                </div>

                {/* Preview Area / Overlay */}
                <div className="aspect-[9/16] bg-black relative flex items-center justify-center overflow-hidden">
                    {uploading ? (
                        <div className="flex flex-col items-center justify-center p-8 space-y-4 text-center">
                            <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
                            <h3 className="text-white font-semibold">Uploading Reel...</h3>
                            <p className="text-gray-400 text-xs text-balance">The reel will process in the background. We'll notify you when it's ready.</p>
                        </div>
                    ) : selectedFile ? (
                        <video
                            src={URL.createObjectURL(selectedFile)}
                            className="w-full h-full object-contain"
                            autoPlay
                            loop
                            muted
                        />
                    ) : (
                        <div className="text-gray-500 flex flex-col items-center">
                            <Video className="w-12 h-12 mb-2 opacity-50" />
                            <p>Select a video</p>
                        </div>
                    )}
                </div>

                {/* Controls */}
                {!uploading && (
                    <div className="p-4 space-y-4 overflow-y-auto">
                        {/* File Upload */}
                        <div className="flex justify-center">
                            <label className="cursor-pointer bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl flex items-center space-x-2 transition-colors">
                                <Upload className="w-5 h-5" />
                                <span>{selectedFile ? "Change Video" : "Upload Video"}</span>
                                <input type="file" accept="video/*" onChange={handleFileSelect} className="hidden" />
                            </label>
                        </div>

                        {/* Caption Input */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Caption
                            </label>
                            <textarea
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                placeholder="Write a caption..."
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                                rows={3}
                            />
                        </div>

                        {/* Visibility */}
                        <div className="flex space-x-2">
                            {[
                                { value: "public", label: "Public", icon: Globe },
                                { value: "friends", label: "Friends", icon: Users },
                                { value: "private", label: "Private", icon: Lock },
                            ].map(({ value, label, icon: Icon }) => (
                                <button
                                    key={value}
                                    onClick={() => setVisibility(value as any)}
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
                            disabled={isSubmitting || !selectedFile}
                            className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Creating..." : "Create Reel"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
