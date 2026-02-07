"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import type { Story } from "@/types/api/story.types";
import StoriesViewer from "@/components/stories/StoriesViewer";

interface StoryViewerContextType {
    openStoryViewer: (stories: Story[], initialIndex?: number) => void;
    closeStoryViewer: () => void;
    isOpen: boolean;
}

const StoryViewerContext = createContext<StoryViewerContextType | undefined>(undefined);

export function StoryViewerProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [stories, setStories] = useState<Story[]>([]);
    const [initialIndex, setInitialIndex] = useState(0);

    const openStoryViewer = (newStories: Story[], index: number = 0) => {
        setStories(newStories);
        setInitialIndex(index);
        setIsOpen(true);
    };

    const closeStoryViewer = () => {
        setIsOpen(false);
        // Optional: clear stories after animation
        setTimeout(() => {
            setStories([]);
            setInitialIndex(0);
        }, 300);
    };

    return (
        <StoryViewerContext.Provider value={{ openStoryViewer, closeStoryViewer, isOpen }}>
            {children}
            <StoriesViewer
                isOpen={isOpen}
                onClose={closeStoryViewer}
                stories={stories}
                initialIndex={initialIndex}
            />
        </StoryViewerContext.Provider>
    );
}

export function useStoryViewer() {
    const context = useContext(StoryViewerContext);
    if (context === undefined) {
        throw new Error("useStoryViewer must be used within a StoryViewerProvider");
    }
    return context;
}
