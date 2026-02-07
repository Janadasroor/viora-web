"use client";

import React from "react";
import { Timer, Play } from "lucide-react";

interface UsageStatsCardProps {
    activeTime: number; // in seconds
    watchTime: number;  // in seconds
    loading?: boolean;
}

export const UsageStatsCard: React.FC<UsageStatsCardProps> = ({ activeTime, watchTime, loading }) => {
    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 mb-6 shadow-sm">
            <h3 className="text-zinc-900 dark:text-zinc-100 font-bold mb-4">Daily Usage</h3>

            {loading ? (
                <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 animate-pulse w-1/3"></div>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col items-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                        <Timer className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">App Usage</span>
                        <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{formatTime(activeTime)}</span>
                    </div>

                    <div className="flex flex-col items-center p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                        <Play className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2" />
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">Watching</span>
                        <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{formatTime(watchTime)}</span>
                    </div>
                </div>
            )}
        </div>
    );
};
