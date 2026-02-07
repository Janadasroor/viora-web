"use client";

import React, { useState, useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, X, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface NotificationData {
    id: string;
    targetId: string;
    targetType: string;
    message: string;
    path: string;
}

export default function MediaProcessingNotification() {
    const router = useRouter();
    const { socket, isConnected } = useSocket();
    const [notifications, setNotifications] = useState<NotificationData[]>([]);

    useEffect(() => {
        if (!socket) {
            console.warn("🔔 MediaProcessingNotification: No socket instance found.");
            return;
        }


        // Request browser notification permission
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission().then(permission => {
            });
        }

        const handleMediaReady = (data: { targetId: string; targetType: string; mediaType: string }) => {

            let path = "/";
            if (data.targetType === "POST") path = `/posts/${data.targetId}`;
            if (data.targetType === "REEL") path = `/reels/${data.targetId}`;
            if (data.targetType === "STORY") path = `/stories`; // Stories usually open a viewer

            const newNotification: NotificationData = {
                id: Math.random().toString(36).substr(2, 9),
                targetId: data.targetId,
                targetType: data.targetType,
                message: `Your ${data.targetType.toLowerCase()} is ready to view!`,
                path
            };

            setNotifications(prev => [...prev, newNotification]);

            // Browser Notification API
            if ("Notification" in window && Notification.permission === "granted") {
                const systemNotification = new Notification("Processing Complete", {
                    body: newNotification.message,
                    icon: "/icons/notification-icon.png", // Fallback if icon doesn't exist
                    tag: data.targetId, // Prevent duplicate notifications for same target
                });

                systemNotification.onclick = (e) => {
                    e.preventDefault();
                    window.focus();
                    router.push(path);
                    removeNotification(newNotification.id);
                    systemNotification.close();
                };
            }

            // Auto-remove after 8 seconds (slightly longer for user to react)
            setTimeout(() => {
                removeNotification(newNotification.id);
            }, 8000);
        };

        socket.on('media_ready', handleMediaReady);

        // Debug: Listen for all events if needed
        socket.onAny((eventName, ...args) => {
            if (eventName === 'media_ready') return; // Already handled
            console.debug(`🔔 Socket Event: ${eventName}`, args);
        });

        return () => {
            socket.off('media_ready', handleMediaReady);
        };
    }, [socket, isConnected]);

    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    if (notifications.length === 0) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
            <AnimatePresence>
                {notifications.map((notification) => (
                    <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.95 }}
                        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl p-4 min-w-[320px] flex items-center gap-4 group hover:border-purple-500/50 transition-colors"
                    >
                        <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full flex-shrink-0">
                            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-500" />
                        </div>

                        <div className="flex-1 overflow-hidden">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">Processing Complete</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{notification.message}</p>
                            <Link
                                href={notification.path}
                                className="text-[10px] font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 mt-1"
                                onClick={() => removeNotification(notification.id)}
                            >
                                VIEW NOW <ExternalLink className="w-2 h-2" />
                            </Link>
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => removeNotification(notification.id)}
                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
