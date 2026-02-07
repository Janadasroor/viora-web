"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { completeProfile, type CompleteProfilePayload } from "@/api/users";
import { useAuth } from "@/context/AuthContext";

interface FieldError {
    field: string;
    message: string;
}

export default function CompleteProfilePage() {
    const router = useRouter();
    const { user, refreshUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState<CompleteProfilePayload>({
        displayName: "",
        gender: undefined,
        birthDate: undefined,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setFieldErrors({});
        setLoading(true);

        try {
            const dataToSend = {
                ...formData,
                birthDate: formData.birthDate
                    ? new Date(formData.birthDate).toISOString()
                    : undefined,
            };
            await completeProfile(dataToSend);
            await refreshUser?.(); // Refresh user data
            router.push("/profile-picture"); // Navigate to optional profile picture upload
        } catch (err: any) {
            console.log("Error caught:", err);

            // Handle validation errors with field details
            if (err.code === 'VALIDATION_ERROR' && err.details && Array.isArray(err.details)) {
                const errors: Record<string, string> = {};
                err.details.forEach((detail: FieldError) => {
                    errors[detail.field] = detail.message;
                });
                setFieldErrors(errors);
                setError(err.message || "Please fix the errors below");
            } else {
                setError(err.message || "Failed to complete profile");
            }
        } finally {
            setLoading(false);
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
                    Complete Your Profile
                </h1>
                <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
                    Tell us a bit about yourself to get started
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

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Display Name */}
                    <div>
                        <label htmlFor="displayName" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="displayName"
                            required
                            value={formData.displayName}
                            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                            className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${fieldErrors.displayName ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-700'
                                }`}
                            placeholder="Enter your full name"
                            disabled={loading}
                        />
                        {fieldErrors.displayName && (
                            <p className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.displayName}</p>
                        )}
                    </div>

                    {/* Gender */}
                    <div>
                        <label htmlFor="gender" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                            Gender (Optional)
                        </label>
                        <select
                            id="gender"
                            value={formData.gender || ""}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    gender: e.target.value as any || undefined,
                                })
                            }
                            className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${fieldErrors.gender ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-700'
                                }`}
                            disabled={loading}
                        >
                            <option value="">Prefer not to say</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                            <option value="prefer_not_to_say">Prefer not to say</option>
                        </select>
                        {fieldErrors.gender && (
                            <p className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.gender}</p>
                        )}
                    </div>

                    {/* Birth Date */}
                    <div>
                        <label htmlFor="birthDate" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                            Birth Date (Optional)
                        </label>
                        <input
                            type="date"
                            id="birthDate"
                            value={formData.birthDate || ""}
                            onChange={(e) => setFormData({ ...formData, birthDate: e.target.value || undefined })}
                            className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${fieldErrors.birthDate ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-700'
                                }`}
                            disabled={loading}
                        />
                        {fieldErrors.birthDate && (
                            <p className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.birthDate}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !formData.displayName}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            "Continue"
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
