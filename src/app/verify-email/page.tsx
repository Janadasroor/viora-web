'use client';
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getCurrentUser } from "@/api/users";
import { getUserIdFromToken } from "@/utils/jwtUtils";
import { getErrorMessage } from "@/utils/errorUtils";

export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, verifyEmail, resendVerificationCode } = useAuth();

    const [email, setEmail] = useState("");
    const [userId, setUserId] = useState<string | null>(null);
    const [code, setCode] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);

    useEffect(() => {
        const loadUserData = async () => {
            // Priority 1: Get from URL params (when redirected from login/register)
            const emailParam = searchParams.get("email");
            const userIdParam = searchParams.get("userId");

            if (emailParam) {
                setEmail(emailParam);
            }

            if (userIdParam) {
                setUserId(userIdParam);
            }

            // Priority 2: Try to get from getCurrentUser (with skipAutoErrorHandling)
            if (!emailParam || !userIdParam) {
                try {
                    // Skip auto error handling to prevent redirect loop
                    const currentUser = await getCurrentUser(true);
                    if (currentUser) {
                        if (!emailParam && currentUser.email) {
                            setEmail(currentUser.email);
                        }
                        if (!userIdParam) {
                            setUserId(String(currentUser.userId));
                        }
                    }
                } catch (err) {
                    console.log("Could not fetch current user, trying fallback methods");
                }
            }

            // Priority 3: Get from AuthContext user (when redirected by error handler)
            if (!emailParam && !email && user) {
                const userEmail = user.email || "";
                if (userEmail) {
                    setEmail(userEmail);
                }
                if (!userIdParam && !userId) {
                    setUserId(String(user.userId));
                }
            }

            // Priority 4: Try to get userId from JWT token
            if (!userIdParam && !userId) {
                const tokenUserId = getUserIdFromToken();
                if (tokenUserId) {
                    setUserId(String(tokenUserId));
                }
            }
        };

        loadUserData();
    }, [searchParams, user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !code) {
            setError("Please fill in all fields");
            return;
        }

        setIsLoading(true);
        setError("");
        setMessage("");

        try {
            await verifyEmail(email, code);
            // Redirect is handled in AuthContext
        } catch (err: any) {
            setError(getErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (!email) {
            setError("Email is required to resend code");
            return;
        }

        setIsResending(true);
        setError("");
        setMessage("");

        try {
            // Pass userId if available
            await resendVerificationCode(email, userId || undefined);
            setMessage("Verification code resent successfully");
        } catch (err: any) {
            setError(getErrorMessage(err));
        } finally {
            setIsResending(false);
        }
    };

    // Auto-resend logic: when either email or userId is updated and we have both, trigger resend once
    useEffect(() => {
        if (email && userId && !isLoading && !isResending && !message && !error && code === "") {
            // Use a slight timeout to ensure the UI is ready and avoid race conditions
            const timer = setTimeout(() => {
                // Check if we should auto-send (e.g., if it's a fresh landing on the page)
                // We'll use a session storage flag to ensure we only auto-send once per "visit"
                const autoSendFlag = sessionStorage.getItem(`sent_code_${email}`);
                if (!autoSendFlag) {
                    handleResendCode();
                    sessionStorage.setItem(`sent_code_${email}`, "true");
                }
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [email, userId]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4 dark:from-gray-900 dark:to-black">
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-900 shadow-2xl rounded-2xl p-8 w-full max-w-md"
            >
                <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-2">
                    Verify Your Email
                </h1>
                <p className="text-center text-gray-500 dark:text-gray-400 mb-6 text-sm">
                    Enter the code sent to your email address
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
                            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors font-mono tracking-widest text-center text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            placeholder="123456"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            disabled={isLoading}
                            maxLength={6}
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
                            "Verify Email"
                        )}
                    </button>
                </form>

                <div className="text-center mt-6">
                    <button
                        onClick={handleResendCode}
                        disabled={isResending || isLoading}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isResending ? "Resending..." : "Resend Code"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
