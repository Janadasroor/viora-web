"use client";

import React, { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";

interface PushNotificationPromptProps {
    onEnable: () => Promise<boolean>;
    onDismiss: () => void;
}

export default function PushNotificationPrompt({ onEnable, onDismiss }: PushNotificationPromptProps) {
    const [loading, setLoading] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        // Check if user has previously dismissed the prompt
        const wasDismissed = localStorage.getItem('notification_prompt_dismissed');
        if (wasDismissed) {
            setDismissed(true);
        }
    }, []);

    const handleEnable = async () => {
        setLoading(true);
        const success = await onEnable();
        setLoading(false);

        if (success) {
            setDismissed(true);
        }
    };

    const handleDismiss = () => {
        localStorage.setItem('notification_prompt_dismissed', 'true');
        setDismissed(true);
        onDismiss();
    };

    if (dismissed) return null;

    return (
        <div className="fixed bottom-4 right-4 max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6 z-50 animate-slide-up">
            {/* Close button */}
            <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
                <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>

            {/* Icon */}
            <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                    <Bell className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Enable Notifications
                    </h3>
                </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Stay updated with likes, comments, and new followers. Get notified even when you're not using the app.
            </p>

            {/* Actions */}
            <div className="flex gap-3">
                <button
                    onClick={handleDismiss}
                    className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg font-medium transition-colors"
                >
                    Not Now
                </button>
                <button
                    onClick={handleEnable}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                    {loading ? "Enabling..." : "Enable"}
                </button>
            </div>
        </div>
    );
}
