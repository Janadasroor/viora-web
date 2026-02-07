"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2, Heart, MessageCircle, Share2, UserPlus, Clock } from "lucide-react";
import { getActivityLog } from "@/api/users";
import { getUsageStats } from "@/api/analytics";
import { UsageStatsCard } from "@/components/profile/UsageStatsCard";
import { motion } from "framer-motion";

interface ActivityItemProps {
    activity: any;
    onClick: () => void;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity, onClick }) => {
    const getIcon = () => {
        switch (activity.actionType) {
            case "like": return <Heart className="w-4 h-4 text-rose-500" fill="currentColor" />;
            case "comment": return <MessageCircle className="w-4 h-4 text-blue-500" />;
            case "share": return <Share2 className="w-4 h-4 text-green-500" />;
            case "follow": return <UserPlus className="w-4 h-4 text-purple-500" />;
            default: return <Clock className="w-4 h-4 text-zinc-500" />;
        }
    };

    const getMessage = () => {
        const target = activity.targetType === 'post' ? 'post' :
            activity.targetType === 'reel' ? 'reel' :
                activity.targetType === 'user' ? 'user' : 'content';

        switch (activity.actionType) {
            case "like": return `You liked a ${target}`;
            case "comment": return `You commented on a ${target}`;
            case "share": return `You shared a ${target}`;
            case "follow": return `You followed a ${target}`;
            default: return `Interaction with a ${target}`;
        }
    };

    return (
        <div
            onClick={onClick}
            className="flex items-center gap-4 p-4 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800"
        >
            <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                {getIcon()}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                    {getMessage()}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {new Date(activity.createdAt).toLocaleString()}
                </p>
            </div>
        </div>
    );
};

export default function ActivityLogPage() {
    const router = useRouter();
    const [activities, setActivities] = useState<any[]>([]);
    const [usage, setUsage] = useState({ activeTime: 0, watchTime: 0 });
    const [loading, setLoading] = useState(true);
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [activityLog, usageStats] = await Promise.all([
                    getActivityLog(1, 40),
                    getUsageStats()
                ]);
                setActivities(activityLog);
                setUsage(usageStats);
            } catch (error) {
                console.error("Failed to fetch activity log data:", error);
            } finally {
                setLoading(false);
                setLoadingStats(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100">
            <div className="max-w-2xl mx-auto p-4 md:p-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-2xl font-bold">Activity Log</h1>
                </div>

                {/* Usage Stats Card */}
                <UsageStatsCard
                    activeTime={usage.activeTime}
                    watchTime={usage.watchTime}
                    loading={loadingStats}
                />

                <div className="space-y-2">
                    <h2 className="text-lg font-semibold mb-4 px-2">Recent Interactions</h2>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                            <p className="text-zinc-500 animate-pulse">Loading your history...</p>
                        </div>
                    ) : activities.length === 0 ? (
                        <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                            <Clock className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
                            <p className="text-zinc-500">No activity found yet.</p>
                            <button
                                onClick={() => router.push('/')}
                                className="mt-4 text-blue-500 font-medium hover:underline"
                            >
                                Start exploring
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                {activities.map((activity, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                    >
                                        <ActivityItem
                                            activity={activity}
                                            onClick={() => {
                                                if (activity.targetType === 'user') {
                                                    router.push(`/profile/${activity.targetId}`);
                                                } else {
                                                    router.push(`/post/${activity.targetId}`);
                                                }
                                            }}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
