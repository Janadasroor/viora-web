"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { getCurrentUser, updateUserProfile, type UpdateUserProfilePayload } from "@/api/users";
import type { UserProfile } from "@/models/UserProfile";

interface EditProfileProps {
    onClose: () => void;
    onSave?: () => void;
    initialData?: UserProfile;
}

export default function EditProfile({ onClose, onSave, initialData }: EditProfileProps) {
    const [loading, setLoading] = useState(!initialData);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<UserProfile | null>(initialData || null);
    const [formData, setFormData] = useState<UpdateUserProfilePayload>({
        displayName: initialData?.displayName || "",
        bio: initialData?.bio || "",
        website: initialData?.website || "",
        location: initialData?.location || "",
        isPrivate: initialData?.isPrivate || false,
        gender: initialData?.gender || "",
        birthDate: initialData?.birthDate || "",
    });

    useEffect(() => {
        if (initialData) return;

        const fetchProfile = async () => {
            try {
                const user = await getCurrentUser();
                if (user) {
                    setProfile(user);
                    setFormData({
                        displayName: user.displayName || "",
                        bio: user.bio || "",
                        website: user.website || "",
                        location: user.location || "",
                        isPrivate: user.isPrivate || false,
                        gender: user.gender || "",
                        birthDate: user.birthDate || "",
                    });
                }
            } catch (error) {
                console.error("Failed to fetch profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [initialData]);

    const handleChange = (field: keyof UpdateUserProfilePayload, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            await updateUserProfile(formData);
            onSave?.();
            onClose();
        } catch (error) {
            console.error("Failed to update profile:", error);
            alert("Failed to update profile. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="bg-white dark:bg-[#050505] rounded-2xl p-8 border border-white/10">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#050505] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-white/10">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Profile</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    {/* Display Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Display Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.displayName}
                            onChange={(e) => handleChange("displayName", e.target.value)}
                            required
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                            placeholder="Your display name"
                        />
                    </div>

                    {/* Bio */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Bio
                        </label>
                        <textarea
                            value={formData.bio}
                            onChange={(e) => handleChange("bio", e.target.value)}
                            rows={4}
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white resize-none"
                            placeholder="Tell us about yourself..."
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {formData.bio?.length || 0} / 150 characters
                        </p>
                    </div>

                    {/* Website */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Website
                        </label>
                        <input
                            type="url"
                            value={formData.website}
                            onChange={(e) => handleChange("website", e.target.value)}
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                            placeholder="https://example.com"
                        />
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Location
                        </label>
                        <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => handleChange("location", e.target.value)}
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                            placeholder="City, Country"
                        />
                    </div>

                    {/* Gender */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Gender
                        </label>
                        <select
                            value={formData.gender}
                            onChange={(e) => handleChange("gender", e.target.value)}
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                        >
                            <option value="">Prefer not to say</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    {/* Birth Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Birth Date
                        </label>
                        <input
                            type="date"
                            value={formData.birthDate}
                            onChange={(e) => handleChange("birthDate", e.target.value)}
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                        />
                    </div>

                    {/* Private Account */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">Private Account</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Only approved followers can see your posts
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleChange("isPrivate", !formData.isPrivate)}
                            className={`relative w-14 h-8 rounded-full transition-colors ${formData.isPrivate ? "bg-purple-600" : "bg-gray-300 dark:bg-gray-700"
                                }`}
                        >
                            <span
                                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${formData.isPrivate ? "translate-x-6" : ""
                                    }`}
                            />
                        </button>
                    </div>
                </form>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-800">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving || !formData.displayName}
                        className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}
