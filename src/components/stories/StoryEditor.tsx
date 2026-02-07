"use client";
import React, { useRef } from "react";
import type { TextOverlayItem, StickerItem } from "@/types/api/story.types";
import TextOverlayEditor from "./TextOverlayEditor";
import StickerEditor from "./StickerEditor";

interface StoryEditorProps {
    mediaFile?: File | null;
    mediaUrl?: string | null;
    mediaType: "photo" | "video";
    backgroundColor?: string;
    textOverlays: TextOverlayItem[];
    stickers: StickerItem[];
    onUpdateTextOverlays: (items: TextOverlayItem[]) => void;
    onUpdateStickers: (items: StickerItem[]) => void;
    readOnly?: boolean;
}

export default function StoryEditor({
    mediaFile,
    mediaUrl,
    mediaType,
    backgroundColor = "#000000",
    textOverlays,
    stickers,
    onUpdateTextOverlays,
    onUpdateStickers,
    readOnly = false
}: StoryEditorProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    // Determine media source
    const mediaSrc = mediaFile ? URL.createObjectURL(mediaFile) : mediaUrl;

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden"
            style={{ backgroundColor: !mediaSrc ? backgroundColor : undefined }}
        >
            {mediaSrc ? (
                mediaType === "video" ? (
                    <video
                        src={mediaSrc}
                        className="w-full h-full object-contain"
                        autoPlay
                        loop
                        muted
                    />
                ) : (
                    <img
                        src={mediaSrc}
                        alt="Story preview"
                        className="w-full h-full object-contain"
                    />
                )
            ) : (
                <div className="text-white/50 text-center p-6 pointer-events-none">
                    {!readOnly && textOverlays.length === 0 && stickers.length === 0 && (
                        <p className="text-lg font-medium">Add text or stickers</p>
                    )}
                </div>
            )}

            {/* Editors */}
            <TextOverlayEditor
                items={textOverlays}
                onChange={onUpdateTextOverlays}
                containerRef={containerRef}
                readOnly={readOnly}
            />
            <StickerEditor
                items={stickers}
                onChange={onUpdateStickers}
                containerRef={containerRef}
                readOnly={readOnly}
            />
        </div>
    );
}
