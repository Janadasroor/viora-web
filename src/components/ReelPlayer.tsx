"use client";

import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { Settings, Pause } from "lucide-react";
import { motion } from "framer-motion";
import type { ReelMediaVariant } from "@/types/api/reel.types";
import { useSettings } from "@/context/SettingsContext";
import { trackWatchHeartbeat } from "@/api/analytics";

interface ReelPlayerProps {
    contentId: string;
    variants: ReelMediaVariant[];
    filePath: string;
    autoPlay?: boolean;
    muted?: boolean;
    loop?: boolean;
    onViewComplete?: (watchTime: number, duration: number) => void;
    className?: string;
    isActive?: boolean;
}

export interface ReelPlayerRef {
    play: () => void;
    pause: () => void;
    togglePlay: () => void;
}

const ReelPlayer = forwardRef<ReelPlayerRef, ReelPlayerProps>(({
    contentId,
    variants,
    filePath,
    autoPlay = true,
    muted = true,
    loop = true,
    onViewComplete,
    className = "",
    isActive = true,
}, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [showQualityMenu, setShowQualityMenu] = useState(false);
    const [selectedQuality, setSelectedQuality] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showPauseIcon, setShowPauseIcon] = useState(false);
    const [watchStartTime, setWatchStartTime] = useState<number | null>(null);
    const [accumulatedWatchTime, setAccumulatedWatchTime] = useState(0);
    const { videoQuality } = useSettings();

    const apiUrl = process.env.NEXT_MEDIA_API_URL || "http://localhost:3003";

    // Expose play/pause methods to parent
    useImperativeHandle(ref, () => ({
        play: () => {
            if (videoRef.current) {
                videoRef.current.play();
                setIsPlaying(true);
            }
        },
        pause: () => {
            if (videoRef.current) {
                videoRef.current.pause();
                setIsPlaying(false);
            }
        },
        togglePlay: () => {
            if (videoRef.current) {
                if (videoRef.current.paused) {
                    videoRef.current.play();
                    setIsPlaying(true);
                } else {
                    videoRef.current.pause();
                    setIsPlaying(false);
                }
            }
        },
    }));

    // Analytics Heartbeat
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isActive && isPlaying && contentId) {
            // Send initial heartbeat
            trackWatchHeartbeat(contentId, 5, 'web');

            interval = setInterval(() => {
                trackWatchHeartbeat(contentId, 5, 'web');
            }, 5000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, isPlaying, contentId]);

    // Sort variants by quality (descending)
    const sortedVariants = [...variants].sort((a, b) => {
        const qualityOrder: Record<string, number> = {
            "1080p": 4,
            "720p": 3,
            "480p": 2,
            "360p": 1,
        };
        return (qualityOrder[b.quality] || 0) - (qualityOrder[a.quality] || 0);
    });

    // Select best available quality on mount based on settings
    useEffect(() => {
        if (!selectedQuality && sortedVariants.length > 0) {
            let preferredQuality: string | undefined;

            if (videoQuality === "high") {
                preferredQuality = sortedVariants.find(v => v.quality === "1080p")?.quality ||
                    sortedVariants.find(v => v.quality === "720p")?.quality;
            } else if (videoQuality === "low") {
                preferredQuality = sortedVariants.find(v => v.quality === "360p")?.quality ||
                    sortedVariants.find(v => v.quality === "480p")?.quality;
            }

            if (!preferredQuality) {
                preferredQuality = sortedVariants.find((v) => v.status === "completed")?.quality || sortedVariants[0].quality;
            }

            setSelectedQuality(preferredQuality);
        }
    }, [sortedVariants, selectedQuality, videoQuality]);

    // Auto-play/pause based on isActive prop
    useEffect(() => {
        if (videoRef.current) {
            if (isActive && autoPlay) {
                videoRef.current.play().catch(() => { });
                setWatchStartTime(Date.now());
            } else {
                videoRef.current.pause();
                if (watchStartTime) {
                    const sessionTime = (Date.now() - watchStartTime) / 1000;
                    setAccumulatedWatchTime(prev => prev + sessionTime);
                    setWatchStartTime(null);
                }
            }
        }
    }, [isActive, autoPlay]);

    // Track total watch time and report on unmount or when reel changes
    useEffect(() => {
        return () => {
            if (isActive && videoRef.current) {
                const finalWatchTime = accumulatedWatchTime + (watchStartTime ? (Date.now() - watchStartTime) / 1000 : 0);
                const duration = videoRef.current.duration;
                if (finalWatchTime > 0.5) {
                    onViewComplete?.(finalWatchTime, duration);
                }
            }
        };
    }, [isActive, accumulatedWatchTime, watchStartTime, onViewComplete]);

    const handleQualityChange = (quality: string) => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
            setIsPlaying(!videoRef.current.paused);
        }
        setSelectedQuality(quality);
        setShowQualityMenu(false);
    };

    useEffect(() => {
        if (videoRef.current && currentTime > 0) {
            videoRef.current.currentTime = currentTime;
            if (isPlaying) {
                videoRef.current.play();
            }
        }
    }, [selectedQuality]);

    const handleVideoClick = () => {
        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play();
                setIsPlaying(true);
                setShowPauseIcon(false);
            } else {
                videoRef.current.pause();
                setIsPlaying(false);
                setShowPauseIcon(true);
            }
        }
    };

    const handlePlayStateChange = () => {
        if (videoRef.current) {
            setIsPlaying(!videoRef.current.paused);
        }
    };

    const currentVariant = sortedVariants.find((v) => v.quality === selectedQuality);
    const videoSrc = currentVariant
        ? `${apiUrl}/${currentVariant.filePath}`
        : `${apiUrl}/${filePath}`;

    return (
        <div className="relative w-full h-full">
            <video
                ref={videoRef}
                src={videoSrc}
                className={`w-full h-full object-cover ${className}`}
                autoPlay={autoPlay}
                muted={muted}
                loop={loop}
                playsInline
                onPlay={handlePlayStateChange}
                onPause={handlePlayStateChange}
                onClick={handleVideoClick}
            />

            {showPauseIcon && !isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-black/40 backdrop-blur-xl rounded-full p-8 border border-white/20 shadow-2xl"
                    >
                        <Pause className="w-12 h-12 fill-white text-white" />
                    </motion.div>
                </div>
            )}

            <div className="absolute top-4 right-4 z-10 text-white">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowQualityMenu(!showQualityMenu);
                    }}
                    className="bg-black/50 backdrop-blur-sm p-2 rounded-full hover:bg-black/70 transition-all underline decoration-transparent"
                >
                    <Settings className="w-5 h-5" />
                </button>

                {showQualityMenu && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="absolute top-12 right-0 bg-black/60 backdrop-blur-2xl rounded-2xl overflow-hidden min-w-[140px] shadow-2xl border border-white/10 z-50"
                    >
                        <div className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-white/40 border-b border-white/5">
                            Video Quality
                        </div>
                        <div className="py-1">
                            {sortedVariants.map((variant) => (
                                <button
                                    key={variant.variantId}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleQualityChange(variant.quality);
                                    }}
                                    className={`w-full px-4 py-2.5 text-left text-sm transition-all flex items-center justify-between group ${selectedQuality === variant.quality
                                        ? "text-white bg-white/10"
                                        : "text-white/60 hover:text-white hover:bg-white/5"
                                        }`}
                                >
                                    <div className="flex flex-col">
                                        <span className="font-semibold">{variant.quality}</span>
                                        {variant.status === "pending" && (
                                            <span className="text-[9px] text-amber-400 font-medium">Processing</span>
                                        )}
                                    </div>
                                    {selectedQuality === variant.quality && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
});

ReelPlayer.displayName = "ReelPlayer";

export default ReelPlayer;
