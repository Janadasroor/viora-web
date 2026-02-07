"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Heart, MessageCircle, UserPlus, X } from "lucide-react";
import { getNotifications, markAllNotificationsAsRead, markNotificationAsRead } from "@/api/notifications";
import { getStory } from "@/api/stories";
import type { Notification } from "@/models/Notification";
import { formatDistanceToNow } from "date-fns";
import { useSocket } from "@/context/SocketContext";
import { useStoryViewer } from "@/context/StoryViewerContext";

interface NotificationsListProps {
    isPopover?: boolean;
    onClose?: () => void;
}

export default function NotificationsList({ isPopover = false, onClose }: NotificationsListProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const { socket, isConnected } = useSocket();
    const { openStoryViewer } = useStoryViewer();

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const data = await getNotifications(1, 20);
                if (data) {
                    setNotifications(data);
                }
            } catch (error) {
                console.error("Failed to fetch notifications:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();

        // Listen for real-time notification updates via WebSocket
        if (socket && isConnected) {
            // New notification
            socket.on('notification', (data: any) => {
                // Refresh notifications
                fetchNotifications();
            });

            // Notification updated (aggregation count changed)
            socket.on('notification_updated', (data: any) => {
                // Refresh notifications to get updated count
                fetchNotifications();
            });

            return () => {
                socket.off('notification');
                socket.off('notification_updated');
            };
        }
    }, [socket, isConnected]);

    const handleMarkAllRead = async () => {
        const success = await markAllNotificationsAsRead();
        if (success) {
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        }
    };

    const router = useRouter();

    const handleNotificationClick = async (notification: Notification) => {
        // Mark as read if not already
        if (!notification.isRead) {
            await markNotificationAsRead(notification.notificationId);
            setNotifications((prev) =>
                prev.map((n) =>
                    n.notificationId === notification.notificationId ? { ...n, isRead: true } : n
                )
            );
        }

        // Navigation logic
        if (notification.targetType === 'post') {
            router.push(`/post/${notification.targetId}`);
        } else if (notification.targetType === 'reel') {
            router.push(`/reel/${notification.targetId}`);
        } else if (notification.targetType === 'story') {
            try {
                const story = await getStory(notification.targetId);
                if (story) {
                    openStoryViewer([story]);
                }
            } catch (error) {
                console.error("Failed to fetch story for notification:", error);
            }
        } else if (notification.targetType === 'user' || notification.notificationType === 'follow') {
            // For follow notifications, targetId is the user who followed (actorId)
            // But sometimes targetId might be the current user ID if it's "your profile"
            // Safer to use actorId for follow notifications
            const targetUserId = notification.notificationType === 'follow' ? notification.actorId : notification.targetId;
            router.push(`/profile/${targetUserId}`);
        } else if (notification.notificationType === 'comment' || notification.notificationType === 'like') {
            // Fallback for comments/likes if targetType wasn't explicit (though it should be)
            if (notification.targetType === 'post') {
                router.push(`/post/${notification.targetId}`);
            } else if (notification.targetType === 'reel') {
                router.push(`/reel/${notification.targetId}`);
            } else if (notification.targetType === 'story') {
                try {
                    const story = await getStory(notification.targetId);
                    if (story) {
                        openStoryViewer([story]);
                    }
                } catch (error) {
                    console.error("Failed to fetch story for notification:", error);
                }
            }
        }

        if (isPopover && onClose) {
            onClose();
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "like":
                return <Heart className="w-4 h-4 text-red-500 fill-current" />;
            case "comment":
                return <MessageCircle className="w-4 h-4 text-blue-500 fill-current" />;
            case "follow":
                return <UserPlus className="w-4 h-4 text-green-500 fill-current" />;
            default:
                return <Bell className="w-4 h-4 text-gray-500" />;
        }
    };

    return (
        <div className={`bg-white dark:bg-gray-900 ${isPopover ? "" : "h-full flex flex-col"}`}>
            {/* Header */}
            <div className={`p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center ${isPopover ? "bg-gray-50 dark:bg-gray-800" : "bg-white dark:bg-gray-900"}`}>
                <h3 className={`font-semibold text-gray-800 dark:text-white ${!isPopover ? "text-lg" : ""}`}>
                    {isPopover ? "Notifications" : "All Notifications"}
                </h3>
                <div className="flex space-x-2">
                    <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                    >
                        Mark all read
                    </button>
                    {isPopover && onClose && (
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* List */}
            <div className={`${isPopover ? "max-h-96 overflow-y-auto" : "flex-1 overflow-y-auto"}`}>
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Loading...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                        <p className="text-sm">No notifications yet</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50 dark:divide-gray-800">
                        {notifications.map((notification) => (
                            <div
                                key={notification.notificationId}
                                onClick={() => handleNotificationClick(notification)}
                                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer flex items-start space-x-3 ${!notification.isRead ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
                                    }`}
                            >
                                <div className="mt-1 flex-shrink-0 p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-100 dark:border-gray-700 relative">
                                    {getIcon(notification.notificationType)}
                                    {/* Aggregation count badge */}
                                    {notification.aggregation && notification.aggregation.count > 1 && (
                                        <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                            {notification.aggregation.count > 99 ? '99+' : notification.aggregation.count}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-800 dark:text-gray-200">
                                        {/* Show actor username if available, otherwise fallback to actor ID */}
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                            {notification.actor?.username || `User ${notification.actorId}`}
                                        </span>{" "}
                                        {notification.message}
                                    </p>
                                    {/* Show aggregation details if available */}
                                    {notification.aggregation && notification.aggregation.count > 1 && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                            {notification.aggregation.count} {notification.notificationType === 'like' ? 'likes' : 'interactions'}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-400 mt-1">
                                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                    </p>
                                </div>
                                {!notification.isRead && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
