"use client";
import React from "react";
import type { Story } from "@/types/api/story.types";
import { API_URL } from "@/constants/url";
interface StoryCardProps {
    story: Story;
}

export default function StoryCard({ story }: StoryCardProps) {
    const hasMedia = story.media && story.media.length > 0;
    const mediaFile = hasMedia ? story.media[0] : null;

    return (
        <div className="relative w-full h-full flex items-center justify-center">
            {/* Background */}
            {hasMedia && mediaFile ? (
                mediaFile.mediaType === 'video' ? (
                    <video
                        src={API_URL + mediaFile.filePath}
                        className="w-full h-full object-contain"
                        autoPlay
                        loop
                        muted
                    />
                ) : (
                    <img
                        src={API_URL + mediaFile.filePath}
                        alt="Story"
                        className="w-full h-full object-contain"
                    />
                )
            ) : (
                <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ backgroundColor: story.backgroundColor || '#000' }}
                >
                    {story.content && (
                        <p className="text-white text-3xl font-bold text-center px-8 max-w-2xl">
                            {story.content}
                        </p>
                    )}
                </div>
            )}

            {/* Overlays (Text & Stickers) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Text Overlays */}
                {(() => {
                    let overlays: any[] = [];
                    if (Array.isArray(story.textOverlay)) {
                        overlays = story.textOverlay;
                    } else if (typeof story.textOverlay === 'string') {
                        try {
                            overlays = JSON.parse(story.textOverlay);
                        } catch (e) {
                            // Fallback for legacy simple text
                            if (story.textOverlay) {
                                return (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="bg-black/50 px-6 py-4 rounded-2xl max-w-[80%]">
                                            <p className="text-white text-2xl font-bold text-center break-words">
                                                {story.textOverlay}
                                            </p>
                                        </div>
                                    </div>
                                );
                            }
                        }
                    }

                    return Array.isArray(overlays) ? overlays.map((item: any) => (
                        <div
                            key={item.id}
                            className="absolute"
                            style={{
                                left: `${(item.transform?.position?.x || 0.5) * 100}%`,
                                top: `${(item.transform?.position?.y || 0.5) * 100}%`,
                                transform: 'translate(-50%, -50%)', // Center anchor point
                                color: item.font?.color || '#ffffff',
                                fontSize: `${item.font?.size || 24}px`,
                                fontWeight: item.font?.weight || 'normal',
                                fontFamily: item.font?.family || 'sans-serif',
                                backgroundColor: item.style?.backgroundColor || 'transparent',
                                textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                                padding: '4px 8px',
                                whiteSpace: 'pre-wrap',
                                maxWidth: '100%'
                            }}
                        >
                            {item.text}
                        </div>
                    )) : null;
                })()}

                {/* Stickers */}
                {(() => {
                    let stickers: any[] = [];
                    if (Array.isArray(story.stickers)) {
                        stickers = story.stickers;
                    } else if (typeof story.stickers === 'string') {
                        try {
                            stickers = JSON.parse(story.stickers);
                        } catch (e) {
                            stickers = [];
                        }
                    }

                    return Array.isArray(stickers) ? stickers.map((item: any) => (
                        <div
                            key={item.id}
                            className="absolute"
                            style={{
                                left: `${(item.transform?.position?.x || 0.5) * 100}%`,
                                top: `${(item.transform?.position?.y || 0.5) * 100}%`,
                                transform: `translate(-50%, -50%) scale(${item.transform?.scale || 1}) rotate(${item.transform?.rotation || 0}deg)`,
                                fontSize: '48px',
                                opacity: item.opacity ?? 1,
                                zIndex: item.zIndex,
                                userSelect: 'none'
                            }}
                        >
                            {item.emoji}
                        </div>
                    )) : null;
                })()}
            </div>
        </div>
    );
}
