import React, { useEffect, useState, useRef } from "react";
import { getMediaUrl } from "@/api/utils/getMediaUrl";
import { Play, Volume2, VolumeX } from "lucide-react";

interface VideoProps {
    path: string;
    className?: string;
    isMuted?: boolean;
    playing?: boolean;
    onTogglePlay?: () => void;
    onToggleMute?: () => void;
    poster?: string | null;
}

const VideoComponent: React.FC<VideoProps> = ({
    path,
    className,
    isMuted = true,
    playing = false,
    onTogglePlay,
    onToggleMute,
    poster,
}) => {
    const [url, setUrl] = useState<string | null>(null);
    const [failed, setFailed] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (!path) {
            setFailed(true);
            return;
        }

        let mounted = true;
        setFailed(false);
        setUrl(null);

        getMediaUrl(path)
            .then((result) => {
                if (!mounted) return;
                if (!result) {
                    setFailed(true);
                } else {
                    setUrl(result);
                }
            })
            .catch(() => {
                if (mounted) setFailed(true);
            });

        return () => {
            mounted = false;
        };
    }, [path]);

    // Handle play/pause effect
    useEffect(() => {
        if (!videoRef.current || !url) return;

        if (playing) {
            videoRef.current.play().catch(err => console.error("Video play failed:", err));
        } else {
            videoRef.current.pause();
        }
    }, [playing, url]);

    if (failed) {
        return (
            <div className={`flex items-center justify-center bg-gray-200 ${className}`}>
                <p className="text-gray-500 text-sm">Video failed to load</p>
            </div>
        );
    }

    if (!url) {
        return (
            <div className={`bg-gray-200 animate-pulse ${className}`} />
        );
    }

    return (
        <div className="relative w-full h-full">
            <video
                ref={videoRef}
                src={url}
                className={className}
                muted={isMuted}
                playsInline
                loop
                onClick={(e) => {
                    e.stopPropagation();
                    onTogglePlay?.();
                }}
                poster={poster ||""}
            />
            {/* Overlay Controls if using external control state (optional, but PostCard handles its own overlay) */}
        </div>
    );
};

export default VideoComponent;
