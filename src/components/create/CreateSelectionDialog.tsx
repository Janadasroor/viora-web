"use client";
import React from "react";
import { X, Image, Camera, Video } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CreateSelectionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (type: "post" | "story" | "reel") => void;
}

export default function CreateSelectionDialog({
    isOpen,
    onClose,
    onSelect,
}: CreateSelectionDialogProps) {
    if (!isOpen) return null;

    const options = [
        {
            id: "post",
            label: "Create Post",
            icon: Image,
            color: "bg-blue-500",
            description: "Share photos and videos to your feed",
        },
        {
            id: "story",
            label: "Create Story",
            icon: Camera,
            color: "bg-pink-500",
            description: "Share moments that disappear after 24h",
        },
        {
            id: "reel",
            label: "Create Reel",
            icon: Video,
            color: "bg-purple-500",
            description: "Create short, entertaining videos",
        },
    ] as const;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        {/* Dialog */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800"
                        >
                            {/* Header */}
                            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New</h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            {/* Options */}
                            <div className="p-4 space-y-3">
                                {options.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => onSelect(option.id)}
                                        className="w-full flex items-center p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all group border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                                    >
                                        <div className={`w-12 h-12 ${option.color} rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                                            <option.icon className="w-6 h-6" />
                                        </div>
                                        <div className="ml-4 text-left">
                                            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                                                {option.label}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {option.description}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
