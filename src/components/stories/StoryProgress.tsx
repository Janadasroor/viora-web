"use client";
import React, { useEffect, useState } from "react";

interface StoryProgressProps {
    segments: number;
    currentIndex: number;
    isPaused: boolean;
    duration?: number; // milliseconds
    onComplete: () => void;
}

export default function StoryProgress({
    segments,
    currentIndex,
    isPaused,
    duration = 5000,
    onComplete
}: StoryProgressProps) {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (isPaused) return;

        setProgress(0);
        const startTime = Date.now();

        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const newProgress = Math.min((elapsed / duration) * 100, 100);
            setProgress(newProgress);

            if (newProgress >= 100) {
                clearInterval(interval);
                onComplete();
            }
        }, 50);

        return () => clearInterval(interval);
    }, [currentIndex, isPaused, duration, onComplete]);

    return (
        <div className="flex space-x-1 w-full px-2">
            {Array.from({ length: segments }).map((_, index) => (
                <div
                    key={index}
                    className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden"
                >
                    <div
                        className="h-full bg-white rounded-full transition-all"
                        style={{
                            width: index < currentIndex
                                ? '100%'
                                : index === currentIndex
                                    ? `${progress}%`
                                    : '0%'
                        }}
                    />
                </div>
            ))}
        </div>
    );
}
