"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

/**
 * Error notification component
 * Displays authentication errors from AuthContext
 */
export default function ErrorNotification() {
    const { error, clearError } = useAuth();

    useEffect(() => {
        if (error) {
            // Auto-clear error after 5 seconds
            const timer = setTimeout(() => {
                clearError();
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [error, clearError]);

    if (!error) return null;

    return (
        <div className="fixed top-4 right-4 z-50 max-w-md animate-slide-in">
            <div className="bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-start gap-3">
                <svg
                    className="w-6 h-6 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
                <div className="flex-1">
                    <p className="font-medium">{error}</p>
                </div>
                <button
                    onClick={clearError}
                    className="text-white hover:text-gray-200 transition-colors"
                    aria-label="Close"
                >
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            </div>
        </div>
    );
}
