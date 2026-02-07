"use client";
import React, { useState, ReactNode, useEffect } from "react";
import {
    Search,
    User,
    Bell,
    Menu,
    Zap,
} from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import NotificationsPopover from "@/components/notifications/NotificationsPopover";
import NotificationsList from "@/components/notifications/NotificationsList";
import SearchPopover from "@/components/search/SearchPopover";
import SavedPosts from "@/components/posts/SavedPosts";
import { getUnreadCount } from "@/api/notifications";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Title from "../Title";

interface DashboardProps {
    children: ReactNode;
}

export default function Dashboard({ children }: DashboardProps) {
    const [activeTab, setActiveTab] = useState("home");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        const fetchUnreadCount = async () => {
            try {
                const count = await getUnreadCount();
                setUnreadCount(count);
            } catch (error) {
                console.error("Failed to fetch unread notifications count:", error);
            }
        };

        fetchUnreadCount();
        // Poll every minute for new notifications
        const interval = setInterval(fetchUnreadCount, 60000);
        return () => clearInterval(interval);
    }, []);

    const navItems = [
        { name: "Home", id: "home", icon: Zap },
        { name: "Analytics", id: "analytics", icon: Zap },
        { name: "Reel", id: "reel", icon: Zap },
        { name: "Messages", id: "messages", icon: Zap },
        { name: "Notifications", id: "notifications", icon: Bell },
        { name: "Community", id: "community", icon: Zap },
        { name: "Saved", id: "saved", icon: Zap },
    ];

    return (
        <div className="flex flex-row h-screen overflow-hidden bg-white dark:bg-black">
            {/* Sidebar */}
            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 relative">
                <header className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-zinc-100 dark:border-zinc-900 sticky top-0 z-20 transition-all duration-200">
                    <div className="px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => setSidebarOpen(true)}
                                    className="lg:hidden p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-colors duration-200"
                                >
                                    <Menu className="w-6 h-6 text-zinc-700 dark:text-zinc-200" />
                                </button>
                                <div className="flex items-center space-x-2 lg:hidden">
                                    <img src="/icons/badge-72x72.png" alt="Viora" className="w-8 h-8 rounded-lg" />
                                    <Title title="Viora" extraClass="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600" />
                                </div>
                                <h2 className="hidden lg:block text-lg font-bold text-zinc-900 dark:text-white capitalize tracking-tight">
                                    {navItems.find((item) => item.id === activeTab)?.name || "Home"}
                                </h2>
                            </div>
                            <div className="flex items-center space-x-3 sm:space-x-4">
                                <div className="relative">
                                    <button
                                        onClick={() => {
                                            setShowNotifications(!showNotifications);
                                            setShowSearch(false);
                                        }}
                                        className={`p-2.5 rounded-xl transition-all duration-200 relative ${showNotifications ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white' : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 dark:text-zinc-400'}`}
                                    >
                                        <Bell className={`w-5 h-5 ${showNotifications ? 'fill-current' : ''}`} />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-black"></span>
                                        )}
                                    </button>
                                    {showNotifications && (
                                        <NotificationsPopover onClose={() => setShowNotifications(false)} />
                                    )}
                                </div>
                                <div className="relative">
                                    <button
                                        onClick={() => {
                                            setShowSearch(!showSearch);
                                            setShowNotifications(false);
                                        }}
                                        className={`p-2.5 rounded-xl transition-all duration-200 ${showSearch ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white' : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 dark:text-zinc-400'}`}
                                    >
                                        <Search className="w-5 h-5" />
                                    </button>
                                    {showSearch && (
                                        <SearchPopover onClose={() => setShowSearch(false)} />
                                    )}
                                </div>
                                <button
                                    onClick={() => user && router.push(`/profile/${user.userId}`)}
                                    className="hidden sm:block p-1 hover:opacity-80 transition-opacity"
                                >
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 p-[1px]">
                                        <div className="w-full h-full rounded-full bg-white dark:bg-black flex items-center justify-center overflow-hidden">
                                            {user?.media && user.media.length > 0 ? (
                                                <img
                                                    src={`http://localhost:3003/${user.media[0].thumbnailPath || user.media[0].filePath}`}
                                                    alt={user.username}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <User className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
                                            )}
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 min-h-0 overflow-y-auto scroll-smooth">
                    <div className={`h-full flex flex-col w-full mx-auto ${activeTab === "messages" ? "max-w-none" : "px-4 sm:px-6 lg:px-8 py-8 max-w-7xl"}`}>
                        {activeTab === "home" ? (
                            <div className="flex-1 flex flex-col">
                                {children}
                            </div>
                        ) : activeTab === "saved" ? (
                            <div className="flex-1 flex flex-col">
                                <SavedPosts />
                            </div>
                        ) : activeTab === "notifications" ? (
                            <div className="flex-1 flex flex-col">
                                <NotificationsList />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    {navItems.find((item) => item.id === activeTab)?.name}
                                </h3>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
