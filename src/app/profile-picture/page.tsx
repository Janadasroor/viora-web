"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { updateUserProfilePicture } from "@/api/users";
import { useAuth } from "@/context/AuthContext";
import { Camera, Upload, X } from "lucide-react";
import Image from "next/image";
import { uploadImages } from "@/api/media";

export default function ProfilePicturePage() {
    const router = useRouter();
    const { user, refreshUser } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            setError("Please select an image file");
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError("Image size must be less than 5MB");
            return;
        }

        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setError(null);
    };

    const handleUpload = async () => {
        if (!selectedFile || !user) return;

        setLoading(true);
        setError(null);

        try {
            // Upload image to media service
            const uploadRes = await uploadImages({
                files: [selectedFile],
                targetType: 'USER',
                targetId: user.userId.toString(),
            });

            if (!uploadRes.success || !uploadRes.data || uploadRes.data.length === 0) {
                throw new Error("Failed to upload image");
            }

            // Get the uploaded media object
            const uploadedMedia = uploadRes.data[0];

            // Update profile picture with media array
            await refreshUser?.();

            router.push("/feed");
        } catch (err: any) {
            setError(err.message || "Failed to upload profile picture");
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = () => {
        router.push("/feed");
    };

    const handleRemove = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4 dark:from-gray-900 dark:to-black">
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-900 shadow-2xl rounded-2xl p-8 w-full max-w-md"
            >
                <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-2">
                    Add Profile Picture
                </h1>
                <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
                    Upload a photo so your friends can recognize you
                </p>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 text-sm p-3 rounded-lg text-center border border-red-100 dark:border-red-800 mb-4"
                    >
                        {error}
                    </motion.div>
                )}

                <div className="space-y-5">
                    {/* Preview Area */}
                    <div className="flex justify-center">
                        <div className="relative">
                            {previewUrl ? (
                                <div className="relative">
                                    <Image
                                        src={previewUrl}
                                        alt="Profile preview"
                                        width={200}
                                        height={200}
                                        className="rounded-full object-cover w-48 h-48 border-4 border-gray-200 dark:border-gray-700"
                                    />
                                    <button
                                        onClick={handleRemove}
                                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <div className="w-48 h-48 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center border-4 border-gray-300 dark:border-gray-700">
                                    <Camera size={48} className="text-gray-400 dark:text-gray-600" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Upload Button */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                    />

                    {!selectedFile ? (
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            <Upload size={20} />
                            Choose Photo
                        </button>
                    ) : (
                        <button
                            onClick={handleUpload}
                            disabled={loading}
                            className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                "Upload Photo"
                            )}
                        </button>
                    )}

                    {/* Skip Button */}
                    <button
                        onClick={handleSkip}
                        disabled={loading}
                        className="w-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-2.5 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-700 disabled:cursor-not-allowed transition-colors"
                    >
                        Skip for Now
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
