'use client';

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Camera, Upload, Loader2, X, CheckCircle2 } from "lucide-react";
import { uploadImages } from "@/api/media";
import { updateUserProfilePicture } from "@/api/users";

interface PictureStepProps {
    data: any;
    onUpdate: (data: any) => void;
    onNext: () => void;
    onBack: () => void;
}

export default function PictureStep({ data, onUpdate, onNext, onBack }: PictureStepProps) {
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError("Image size should be less than 5MB");
                return;
            }
            onUpdate({ profilePicture: file });
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!data.profilePicture) {
            onNext(); // Skip if no picture selected
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // 1. Upload the image
            const uploadRes = await uploadImages({
                files: [data.profilePicture],
                targetType: 'USER'
            });

            if (!uploadRes.success || !uploadRes.data || uploadRes.data.length === 0) {
                throw new Error(uploadRes.error || "Failed to upload image");
            }

            // 2. Update user profile with the new image URL
            const imageUrls = uploadRes.data || [];
            await updateUserProfilePicture(imageUrls);

            onNext();
        } catch (err: any) {
            console.error("Upload failed:", err);
            setError(err.message || "Failed to set profile picture. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center">
            <h2 className="text-3xl font-bold mb-2 text-center">Add a profile picture</h2>
            <p className="text-muted-foreground mb-10 text-sm text-center">Show the world who you are! You can change this anytime.</p>

            <div className="relative group mb-12">
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="w-48 h-48 rounded-full border-4 border-dashed border-muted-foreground/30 flex items-center justify-center overflow-hidden bg-muted/20 relative"
                >
                    {preview ? (
                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <div className="text-center p-4">
                            <Camera size={40} className="mx-auto mb-2 text-muted-foreground/50" />
                            <span className="text-xs font-medium text-muted-foreground/60">No image selected</span>
                        </div>
                    )}

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Upload className="text-white" size={32} />
                    </button>
                </motion.div>

                {preview && (
                    <button
                        onClick={() => {
                            setPreview(null);
                            onUpdate({ profilePicture: null });
                        }}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground p-1.5 rounded-full shadow-lg hover:bg-destructive/90 transition-colors"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
            />

            {!preview && (
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="mb-8 flex items-center gap-2 text-primary font-bold hover:underline"
                >
                    <Upload size={18} />
                    Select Image
                </button>
            )}

            {error && <p className="text-destructive text-sm mb-6 text-center bg-destructive/10 py-2 px-4 rounded-xl w-full">{error}</p>}

            <div className="flex items-center gap-4 w-full">
                <button
                    onClick={onBack}
                    className="px-6 py-4 rounded-2xl font-bold transition-all hover:bg-muted"
                >
                    Back
                </button>
                <button
                    onClick={handleUpload}
                    disabled={loading}
                    className="flex-1 px-6 py-4 bg-primary text-primary-foreground rounded-2xl font-bold shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <Loader2 className="animate-spin" size={20} />
                    ) : preview ? (
                        <>Continue <CheckCircle2 size={18} /></>
                    ) : (
                        "Skip for now"
                    )}
                </button>
            </div>

            <p className="mt-6 text-xs text-muted-foreground text-center italic">
                {preview ? "Great choice! Click continue to save it." : "You can always upload a picture later from your profile settings."}
            </p>
        </div>
    );
}
