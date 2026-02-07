'use client';
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { resetPassword } from "@/api/auth";

import { getErrorMessage, getValidationErrors } from "@/utils/errorUtils";

export default function ResetPasswordPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const emailParam = searchParams.get("email");
        if (emailParam) {
            setEmail(emailParam);
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !code || !newPassword || !confirmPassword) {
            setError("Please fill in all fields");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters long");
            return;
        }

        setIsLoading(true);
        setError("");
        setMessage("");

        try {
            await resetPassword(email, code, newPassword);
            setMessage("Password reset successfully! You can now login with your new password.");
            setTimeout(() => {
                router.push("/login");
            }, 2000);
        } catch (err: any) {
            const validationErrors = getValidationErrors(err);
            if (validationErrors) {
                setFieldErrors(validationErrors);
                setError("Please correct the errors below");
            } else {
                setError(getErrorMessage(err));
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4 dark:from-gray-900 dark:to-black">
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-900 shadow-2xl rounded-2xl p-8 w-full max-w-md"
            >
                <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-2">
                    Set New Password
                </h1>
                <p className="text-center text-gray-500 dark:text-gray-400 mb-6 text-sm">
                    Enter the code sent to your email and your new password
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-60"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={!!searchParams.get("email")}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                            Verification Code
                        </label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors font-mono tracking-widest text-center bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            placeholder="123456"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            disabled={isLoading}
                            maxLength={6}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                            New Password
                        </label>
                        <input
                            type="password"
                            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            placeholder="••••••••"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            disabled={isLoading}
                        />
                        {fieldErrors.newPassword && (
                            <p className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.newPassword}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                            Confirm New Password
                        </label>
                        <input
                            type="password"
                            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 text-sm p-3 rounded-lg text-center border border-red-100 dark:border-red-800"
                        >
                            {error}
                        </motion.div>
                    )}

                    {message && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm p-3 rounded-lg text-center border border-green-100 dark:border-green-800"
                        >
                            {message}
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            "Reset Password"
                        )}
                    </button>
                </form>

                <div className="text-center mt-6">
                    <Link href="/login" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                        ← Back to Login
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
