"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type VideoQuality = "auto" | "high" | "low";

interface SettingsContextType {
    videoQuality: VideoQuality;
    setVideoQuality: (quality: VideoQuality) => void;
    autoplayVideos: boolean;
    setAutoplayVideos: (autoplay: boolean) => void;
    reducedMotion: boolean;
    setReducedMotion: (reduced: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [videoQuality, setVideoQualityState] = useState<VideoQuality>("auto");
    const [autoplayVideos, setAutoplayVideosState] = useState(true);
    const [reducedMotion, setReducedMotionState] = useState(false);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        // Load settings from localStorage
        const savedVideoQuality = localStorage.getItem("viora_video_quality") as VideoQuality;
        const savedAutoplay = localStorage.getItem("viora_autoplay");
        const savedReducedMotion = localStorage.getItem("viora_reduced_motion");

        if (savedVideoQuality) setVideoQualityState(savedVideoQuality);
        if (savedAutoplay !== null) setAutoplayVideosState(savedAutoplay === "true");
        if (savedReducedMotion !== null) setReducedMotionState(savedReducedMotion === "true");

        setLoaded(true);
    }, []);

    const setVideoQuality = (quality: VideoQuality) => {
        setVideoQualityState(quality);
        localStorage.setItem("viora_video_quality", quality);
    };

    const setAutoplayVideos = (autoplay: boolean) => {
        setAutoplayVideosState(autoplay);
        localStorage.setItem("viora_autoplay", String(autoplay));
    };

    const setReducedMotion = (reduced: boolean) => {
        setReducedMotionState(reduced);
        localStorage.setItem("viora_reduced_motion", String(reduced));
    };

    if (!loaded) {
        return null; // Or a loading spinner if critical
    }

    return (
        <SettingsContext.Provider
            value={{
                videoQuality,
                setVideoQuality,
                autoplayVideos,
                setAutoplayVideos,
                reducedMotion,
                setReducedMotion,
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error("useSettings must be used within a SettingsProvider");
    }
    return context;
}
