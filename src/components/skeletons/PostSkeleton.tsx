"use client";
import React from 'react';

export function PostSkeleton() {
    return (
        <div className="flex flex-col gap-4 p-2 sm:p-4 max-w-2xl mx-auto w-full">
            <div className="bg-white dark:bg-black rounded-3xl overflow-hidden border border-zinc-100 dark:border-zinc-900 shadow-sm animate-pulse">
                {/* Header Skeleton */}
                <div className="flex items-center justify-between p-4 sm:p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                        <div className="space-y-2">
                            <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded" />
                            <div className="h-3 w-16 bg-zinc-100 dark:bg-zinc-900 rounded" />
                        </div>
                    </div>
                    <div className="w-6 h-6 bg-zinc-100 dark:bg-zinc-900 rounded" />
                </div>

                {/* Media Skeleton */}
                <div className="aspect-square w-full bg-zinc-100 dark:bg-zinc-900" />

                {/* Actions Skeleton */}
                <div className="p-4 sm:p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="w-7 h-7 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
                            <div className="w-7 h-7 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
                            <div className="w-7 h-7 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
                        </div>
                        <div className="w-7 h-7 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
                    </div>

                    {/* Caption Skeleton */}
                    <div className="space-y-2">
                        <div className="h-4 w-full bg-zinc-100 dark:bg-zinc-900 rounded" />
                        <div className="h-4 w-2/3 bg-zinc-100 dark:bg-zinc-900 rounded" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export function FeedSkeleton() {
    return (
        <div className="flex flex-col h-full max-w-2xl mx-auto w-full">
            {/* Stories Skeleton */}
            <div className="bg-white dark:bg-black border border-zinc-100 dark:border-zinc-900 rounded-3xl p-4 mb-6 overflow-x-auto scrollbar-hide shadow-sm animate-pulse">
                <div className="flex space-x-6 min-w-max px-2">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="flex flex-col items-center gap-2">
                            <div className="w-16 h-16 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                            <div className="h-2 w-12 bg-zinc-100 dark:bg-zinc-900 rounded" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Post List Skeleton */}
            <div className="flex-1 space-y-4 pb-8">
                {[1, 2, 3].map((i) => (
                    <PostSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}
