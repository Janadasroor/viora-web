"use client";
import React, { useState } from "react";
import {
    Home,
    TrendingUp,
    LucideVideo,
    MessageCircle,
    Bell,
    Users,
    Bookmark,
    X,
    Menu,
    Zap,
    Sun,
    Moon,
    Settings,
    Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useAuth } from "@/context/AuthContext";
import { div } from "framer-motion/client";
import Title from "../Title";

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

export default function Sidebar({
    activeTab,
    setActiveTab,
    sidebarOpen,
    setSidebarOpen,
}: SidebarProps) {
    const router = useRouter();
    const { user } = useAuth();

    const navItems = [
        { name: "Home", icon: Home, id: "home" },
        // { name: "Analytics", icon: TrendingUp, id: "analytics" },
        { name: "Reel", icon: LucideVideo, id: "reel" },
        { name: "Messages", icon: MessageCircle, id: "messages" },
        { name: "Notifications", icon: Bell, id: "notifications" },
        // { name: "Community", icon: Users, id: "community" },
        { name: "Search", icon: Search, id: "search" },
        { name: "Saved", icon: Bookmark, id: "saved" },
        { name: "Settings", icon: Settings, id: "settings" },
    ];

    const handleNavigation = (id: string) => {
        if (id === "reel") {
            router.push("/reel");
        } else if (id === "settings") {
            router.push("/settings");
        } else {
            setActiveTab(id);
            setSidebarOpen(false);
        }
        if (id === "search") {
            router.push("/search");
        }
        if (id === "notifications") {
            // router.push("/notifications");
        }
        if (id === "messages") {
            router.push("/messenger");
        }

    };

    const { theme, setTheme } = useTheme();

    return (
        <>
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white dark:bg-black border-r border-gray-100 dark:border-zinc-900 transform transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                    }`}
            >
                <div className="flex flex-col h-screen">
                    {/* Header */}
                    <div className="flex items-center justify-between h-20 px-8 flex-shrink-0">
                        <div className="flex items-center space-x-3">
                            <img src="/icons/badge-72x72.png" alt="Viora" className="w-9 h-9 rounded-xl shadow-lg dark:shadow-purple-500/20" />
                            <Title
                                extraClass={`text-2xl font-bold font-sans tracking-tight ${sidebarOpen ? "inline" : "hidden lg:inline"
                                    }`}
                                title="Viora" />

                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-colors"
                        >
                            <X className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
                        </button>
                    </div>

                    {/* Scrollable content */}
                    <div className="flex-1 flex flex-col overflow-y-auto py-6 px-4 scrollbar-hide">
                        <nav className="space-y-1 flex-1">
                            {navItems.map((item) => (
                                <div key={item.id} className="rounded-xl overflow-hidden">
                                    <button
                                        key={item.id}
                                        onClick={() => handleNavigation(item.id)}
                                        className={`flex items-center space-x-4 w-full px-4 py-3 rounded-xl transition-all duration-200 group ${activeTab === item.id
                                            ? "bg-zinc-900 dark:bg-white text-white dark:text-black font-semibold shadow-md dark:shadow-white/10"
                                            : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium"
                                            }`}
                                    >
                                        <item.icon className={`w-5 h-5 transition-transform duration-200 ${activeTab !== item.id && "group-hover:scale-110"}`} />
                                        <span
                                            className={`${sidebarOpen ? "inline" : "hidden lg:inline"
                                                }`}
                                        >
                                            {item.name}
                                        </span>
                                    </button>
                                </div>
                            ))}
                        </nav>

                        {/* Theme Toggle & User Info */}
                        <div className="mt-auto pt-6 border-t border-zinc-100 dark:border-zinc-900 space-y-4">
                            <button
                                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                className="flex items-center space-x-4 w-full px-4 py-3 rounded-xl text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                            >
                                {theme === "dark" ? (
                                    <Sun className="w-5 h-5" />
                                ) : (
                                    <Moon className="w-5 h-5" />
                                )}
                                <span className={`${sidebarOpen ? "inline" : "hidden lg:inline"} font-medium`}>
                                    {theme === "dark" ? "Light Mode" : "Dark Mode"}
                                </span>
                            </button>

                            <div
                                onClick={() => user && router.push(`/profile/${user.userId}`)}
                                className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                            >
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white dark:ring-gray-800 overflow-hidden">
                                    {user?.media && user.media.length > 0 ? (
                                        <img
                                            src={`http://localhost:3003/${user.media[0].thumbnailPath || user.media[0].filePath}`}
                                            alt={user.username}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        user?.displayName?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || "U"
                                    )}
                                </div>
                                <div
                                    className={`${sidebarOpen ? "flex" : "hidden lg:flex"
                                        } flex-col min-w-0`}
                                >
                                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                                        {user?.displayName || user?.username || "Guest"}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">@{user?.username || "guest"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </>
    );
}
