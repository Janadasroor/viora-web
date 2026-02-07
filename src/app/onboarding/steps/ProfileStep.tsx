'use client';

import { useState } from "react";
import { motion } from "framer-motion";
import { User, MapPin, AlignLeft, Calendar, Loader2 } from "lucide-react";
import { updateUserProfile } from "@/api/users";

interface ProfileStepProps {
    data: any;
    onUpdate: (data: any) => void;
    onNext: () => void;
    onBack: () => void;
}

export default function ProfileStep({ data, onUpdate, onNext, onBack }: ProfileStepProps) {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            if (!data.displayName) {
                setErrors({ displayName: "Display name is required" });
                setLoading(false);
                return;
            }

            await updateUserProfile({
                displayName: data.displayName,
                bio: data.bio,
                location: data.location,
                gender: data.gender,
                birthDate: data.birthDate,
            });

            onNext();
        } catch (error: any) {
            console.error("Failed to update profile:", error);
            setErrors({ global: error.message || "Failed to update profile. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col">
            <h2 className="text-3xl font-bold mb-2">Tell us about yourself</h2>
            <p className="text-muted-foreground mb-8 text-sm">This information helps others get to know you better. You can always change this later.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold mb-2 ml-1 text-foreground/80">Display Name</label>
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                            <User size={18} />
                        </div>
                        <input
                            type="text"
                            value={data.displayName}
                            onChange={(e) => onUpdate({ displayName: e.target.value })}
                            className={`w-full bg-muted/40 border-2 rounded-2xl py-3.5 pl-12 pr-4 outline-none transition-all focus:bg-background ${errors.displayName ? 'border-destructive/50' : 'border-transparent focus:border-primary/30'
                                }`}
                            placeholder="John Doe"
                        />
                    </div>
                    {errors.displayName && <p className="text-destructive text-xs mt-2 ml-1">{errors.displayName}</p>}
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-2 ml-1 text-foreground/80">Location</label>
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                            <MapPin size={18} />
                        </div>
                        <input
                            type="text"
                            value={data.location}
                            onChange={(e) => onUpdate({ location: e.target.value })}
                            className="w-full bg-muted/40 border-2 border-transparent rounded-2xl py-3.5 pl-12 pr-4 outline-none transition-all focus:bg-background focus:border-primary/30"
                            placeholder="City, Country"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-2 ml-1 text-foreground/80">Bio</label>
                    <div className="relative group">
                        <div className="absolute left-4 top-4 text-muted-foreground group-focus-within:text-primary transition-colors">
                            <AlignLeft size={18} />
                        </div>
                        <textarea
                            value={data.bio}
                            onChange={(e) => onUpdate({ bio: e.target.value })}
                            className="w-full bg-muted/40 border-2 border-transparent rounded-2xl py-3.5 pl-12 pr-4 outline-none transition-all focus:bg-background focus:border-primary/30 min-h-[100px] resize-none"
                            placeholder="Tell the world something amazing about yourself..."
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold mb-2 ml-1 text-foreground/80">Birth Date</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                                <Calendar size={18} />
                            </div>
                            <input
                                type="date"
                                value={data.birthDate}
                                onChange={(e) => onUpdate({ birthDate: e.target.value })}
                                className="w-full bg-muted/40 border-2 border-transparent rounded-2xl py-3.5 pl-12 pr-4 outline-none transition-all focus:bg-background focus:border-primary/30"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-2 ml-1 text-foreground/80">Gender</label>
                        <select
                            value={data.gender}
                            onChange={(e) => onUpdate({ gender: e.target.value })}
                            className="w-full bg-muted/40 border-2 border-transparent rounded-2xl py-3.5 px-4 outline-none transition-all focus:bg-background focus:border-primary/30 appearance-none"
                        >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                            <option value="prefer_not_to_say">Prefer not to say</option>
                        </select>
                    </div>
                </div>

                {errors.global && <p className="text-destructive text-sm text-center">{errors.global}</p>}

                <div className="flex items-center gap-4 mt-8">
                    <button
                        type="button"
                        onClick={onBack}
                        className="px-6 py-4 rounded-2xl font-bold transition-all hover:bg-muted"
                    >
                        Back
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-6 py-4 bg-primary text-primary-foreground rounded-2xl font-bold shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : "Continue"}
                    </button>
                </div>
            </form>
        </div>
    );
}
