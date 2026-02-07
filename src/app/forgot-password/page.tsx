'use client';
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { requestPasswordReset } from "@/api/auth";

import { getErrorMessage } from "@/utils/errorUtils";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            setError("Please enter your email address");
            return;
        }

        setIsLoading(true);
        setError("");
        setMessage("");

        try {
            await requestPasswordReset(email);
            setMessage("If an account exists with this email, a reset code has been sent.");
        } catch (err: any) {
            setError(getErrorMessage(err));
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
                    Reset Password
                </h1>
                <p className="text-center text-gray-500 dark:text-gray-400 mb-6 text-sm">
                    Enter your email to receive a reset code
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
                            <div className="mt-2">
                                <Link href={`/reset-password?email=${encodeURIComponent(email)}`} className="font-medium underline">
                                    Enter Code
                                </Link>
                            </div>
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
                            "Send Reset Code"
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
