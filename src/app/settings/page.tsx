"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSettings } from "@/context/SettingsContext";
import { useTheme } from "next-themes";
import {
    Settings, Monitor, Sun, Moon, Video, Zap, Accessibility,
    User, Info, LogOut, Shield, Loader2, Lock, Bell, Eye,
    HelpCircle, CreditCard, ChevronRight, Check, X, Clock
} from "lucide-react";
import EditProfile from "@/components/profile/EditProfile";
import { logout } from "@/api/auth";
import { getCurrentUser, updateUserProfile } from "@/api/users";
import { motion, AnimatePresence } from "framer-motion";

type Section = "account" | "privacy" | "security" | "notifications" | "media" | "appearance" | "help" | "ads" | "about";

export default function SettingsPage() {
    const router = useRouter();
    const { videoQuality, setVideoQuality, autoplayVideos, setAutoplayVideos, reducedMotion, setReducedMotion } = useSettings();
    const { theme, setTheme } = useTheme();

    const [activeSection, setActiveSection] = useState<Section>("account");
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const [safeMode, setSafeMode] = useState<number>(1);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [updatingSafeMode, setUpdatingSafeMode] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const user = await getCurrentUser();
                if (user && user.safeMode !== undefined) {
                    setSafeMode(user.safeMode);
                }
            } catch (error) {
                console.error("Failed to fetch profile for settings:", error);
            } finally {
                setLoadingProfile(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSafeModeChange = async (mode: number) => {
        if (updatingSafeMode) return;
        setUpdatingSafeMode(true);
        try {
            await updateUserProfile({ safeMode: mode });
            setSafeMode(mode);
        } catch (error) {
            console.error("Failed to update safe mode:", error);
        } finally {
            setUpdatingSafeMode(false);
        }
    };

    const handleLogout = async () => {
        if (loggingOut) return;
        if (!window.confirm("Are you sure you want to logout?")) return;

        setLoggingOut(true);
        try {
            await logout();
            router.push("/login");
        } catch (error) {
            console.error("Failed to logout:", error);
        } finally {
            setLoggingOut(false);
        }
    };

    const sidebarItems = [
        { id: "account", label: "Account", icon: User },
        { id: "privacy", label: "Privacy", icon: Eye },
        { id: "security", label: "Security", icon: Lock },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "media", label: "Media", icon: Video },
        { id: "appearance", label: "Appearance", icon: Zap },
        { id: "ads", label: "Ads", icon: CreditCard },
        { id: "help", label: "Help", icon: HelpCircle },
        { id: "about", label: "About", icon: Info },
    ];

    const renderContent = () => {
        switch (activeSection) {
            case "account":
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">Account Settings</h2>
                        <div className="bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4">
                            <button
                                onClick={() => setShowEditProfile(true)}
                                className="w-full flex items-center justify-between p-4 rounded-xl transition-all bg-white/5 hover:bg-white/10 group border border-transparent hover:border-purple-500/20"
                            >
                                <div className="flex items-center gap-3">
                                    <User className="w-5 h-5 text-purple-400" />
                                    <span className="font-medium text-gray-200">Edit Profile</span>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-500 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={() => router.push("/reset-password")}
                                className="w-full flex items-center justify-between p-4 rounded-xl transition-all bg-white/5 hover:bg-white/10 group border border-transparent hover:border-purple-500/20"
                            >
                                <div className="flex items-center gap-3">
                                    <Lock className="w-5 h-5 text-blue-400" />
                                    <span className="font-medium text-gray-200">Change Password</span>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-500 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={() => router.push("/settings/activity")}
                                className="w-full flex items-center justify-between p-4 rounded-xl transition-all bg-white/5 hover:bg-white/10 group border border-transparent hover:border-purple-500/20"
                            >
                                <div className="flex items-center gap-3">
                                    <Clock className="w-5 h-5 text-emerald-400" />
                                    <span className="font-medium text-gray-200">Your Activity</span>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-500 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <div className="pt-4 border-t border-white/10">
                                <button
                                    onClick={handleLogout}
                                    disabled={loggingOut}
                                    className="w-full flex items-center gap-3 p-4 rounded-xl transition-all bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span className="font-bold">{loggingOut ? "Logging out..." : "Logout"}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case "privacy":
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500">Privacy & Safety</h2>
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-8">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Sensitive Content Control</h3>
                                {loadingProfile ? (
                                    <div className="flex justify-center py-8"><Loader2 className="animate-spin text-purple-500" /></div>
                                ) : (
                                    <div className="grid gap-3">
                                        {[
                                            { value: 0, label: "Strict", desc: "Highest filtering of mature content" },
                                            { value: 1, label: "Standard", desc: "Default balance for a safe experience" },
                                            { value: 2, label: "Relaxed", desc: "Show all content without filters" }
                                        ].map((opt) => (
                                            <button
                                                key={opt.value}
                                                onClick={() => handleSafeModeChange(opt.value)}
                                                className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${safeMode === opt.value
                                                    ? "bg-purple-500/20 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.15)]"
                                                    : "bg-white/5 border-transparent hover:bg-white/10"
                                                    }`}
                                            >
                                                <div className="text-left">
                                                    <p className="font-bold text-white">{opt.label}</p>
                                                    <p className="text-xs text-gray-400">{opt.desc}</p>
                                                </div>
                                                {safeMode === opt.value && <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center shadow-lg"><Check className="w-4 h-4 text-white" /></div>}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="pt-6 border-t border-white/10">
                                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                                    <div>
                                        <p className="font-bold text-white text-sm">Private Account</p>
                                        <p className="text-xs text-gray-400">Only people you approve can see your posts</p>
                                    </div>
                                    <div className="relative w-12 h-6 bg-white/10 rounded-full cursor-not-allowed opacity-50">
                                        <div className="absolute left-1 top-1 w-4 h-4 bg-gray-500 rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case "media":
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500">Media Quality</h2>
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-8">
                            <div className="space-y-4">
                                <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Video Quality</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(["auto", "high", "low"] as const).map((q) => (
                                        <button
                                            key={q}
                                            onClick={() => setVideoQuality(q)}
                                            className={`py-3 rounded-xl font-bold text-sm transition-all ${videoQuality === q
                                                ? "bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/20"
                                                : "bg-white/5 text-gray-400 hover:bg-white/10"
                                                }`}
                                        >
                                            {q.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 group transition-colors hover:bg-white/10">
                                <div className="flex items-center gap-3">
                                    <Zap className={`w-5 h-5 ${autoplayVideos ? "text-orange-400" : "text-gray-500"}`} />
                                    <div>
                                        <p className="font-bold text-white text-sm">Autoplay Videos</p>
                                        <p className="text-xs text-gray-400">Data usage may increase</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setAutoplayVideos(!autoplayVideos)}
                                    className={`relative w-12 h-6 rounded-full transition-all duration-300 ${autoplayVideos ? "bg-orange-500" : "bg-white/10"}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${autoplayVideos ? "left-7" : "left-1"}`}></div>
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case "appearance":
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">Appearance</h2>
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-8">
                            <div className="space-y-4">
                                <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Theme Mode</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { val: "light", icon: Sun, color: "text-amber-400" },
                                        { val: "dark", icon: Moon, color: "text-indigo-400" },
                                        { val: "system", icon: Monitor, color: "text-emerald-400" }
                                    ].map((t) => (
                                        <button
                                            key={t.val}
                                            onClick={() => setTheme(t.val)}
                                            className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${theme === t.val
                                                ? "bg-indigo-500/10 border-indigo-500 shadow-[0_0_25px_rgba(99,102,241,0.15)]"
                                                : "bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10"
                                                }`}
                                        >
                                            <t.icon className={`w-6 h-6 ${t.color}`} />
                                            <span className="text-xs font-bold capitalize">{t.val}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                                <div className="flex items-center gap-3">
                                    <Accessibility className="w-5 h-5 text-indigo-400" />
                                    <div>
                                        <p className="font-bold text-white text-sm">Reduced Motion</p>
                                        <p className="text-xs text-gray-400">Simplify UI animations</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setReducedMotion(!reducedMotion)}
                                    className={`relative w-12 h-6 rounded-full transition-all duration-300 ${reducedMotion ? "bg-indigo-500" : "bg-white/10"}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${reducedMotion ? "left-7" : "left-1"}`}></div>
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case "security":
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-rose-500">Security Center</h2>
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4">
                            {[
                                { icon: Shield, title: "Two-Factor Authentication", desc: "Add extra security to your account" },
                                { icon: Lock, title: "Login Activity", desc: "Check where you're currently logged in" },
                                { icon: Monitor, title: "Security Checkup", desc: "Review your recent security events" }
                            ].map((item, idx) => (
                                <button key={idx} className="w-full flex items-center justify-between p-4 rounded-xl transition-all bg-white/5 hover:bg-white/10 border border-transparent hover:border-red-500/20">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                                            <item.icon className="w-5 h-5 text-red-400" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-bold text-white">{item.title}</p>
                                            <p className="text-xs text-gray-500">{item.desc}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-600" />
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case "notifications":
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-amber-500">Notifications</h2>
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4">
                            {[
                                { id: "push", label: "Push Notifications", desc: "Get real-time alerts on your device" },
                                { id: "email", label: "Email Notifications", desc: "Updates sent to your primary email" },
                                { id: "sm", label: "Sms Notifications", desc: "Text alerts for critical updates" }
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-white/5 transition-colors hover:bg-white/10">
                                    <div>
                                        <p className="font-bold text-white text-sm">{item.label}</p>
                                        <p className="text-xs text-gray-400">{item.desc}</p>
                                    </div>
                                    <div className="relative w-12 h-6 bg-amber-500/20 border border-amber-500/30 rounded-full cursor-pointer overflow-hidden">
                                        <div className="absolute left-1 top-1 w-4 h-4 bg-amber-500 rounded-full shadow-lg"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case "ads":
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-500">Ads Preferences</h2>
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4 text-center py-12">
                            <CreditCard className="w-12 h-12 text-pink-400 mx-auto mb-4 opacity-50" />
                            <h3 className="text-xl font-bold text-white">No active ad management</h3>
                            <p className="text-sm text-gray-500 max-w-xs mx-auto">Viora is currently ad-free. Your data is not used for personalized advertising at this time.</p>
                        </div>
                    </div>
                );
            case "help":
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-emerald-500">Help & Support</h2>
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { icon: HelpCircle, title: "Help Center", desc: "Guides and FAQ" },
                                { icon: Bell, title: "Support Requests", desc: "View your status" },
                                { icon: Shield, title: "Privacy & Security Help", desc: "Protect your data" },
                                { icon: Info, title: "Report a Problem", desc: "Found a bug?" }
                            ].map((item, idx) => (
                                <button key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-transparent hover:border-teal-500/20">
                                    <div className="p-3 bg-teal-500/10 rounded-xl">
                                        <item.icon className="w-5 h-5 text-teal-400" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-sm text-white">{item.title}</p>
                                        <p className="text-xs text-gray-500">{item.desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case "about":
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-white">About Viora</h2>
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center space-y-6">
                            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-3xl mx-auto flex items-center justify-center shadow-2xl">
                                <Settings className="w-10 h-10 text-white animate-spin-slow" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white italic tracking-tighter">VIORA <span className="text-purple-500">PRO</span></h3>
                                <p className="text-xs text-gray-500 font-mono mt-1">v1.2.4-stable-2024</p>
                            </div>
                            <div className="pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
                                <button className="p-3 text-xs font-bold text-gray-400 hover:text-white transition-colors">Privacy Policy</button>
                                <button className="p-3 text-xs font-bold text-gray-400 hover:text-white transition-colors">Terms of Service</button>
                            </div>
                            <p className="text-[10px] text-gray-600 uppercase tracking-[0.2em]">Designed with ❤️ by Deepmind Team</p>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-gray-200 selection:bg-purple-500/30">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row min-h-screen">
                {/* Sidebar */}
                <aside className="w-full md:w-80 border-r border-white/5 p-4 md:p-8 space-y-8 bg-[#080808]/50 backdrop-blur-3xl sticky top-0 h-auto md:h-screen">
                    <div className="flex items-center gap-3 px-4">
                        <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(147,51,234,0.3)]">
                            <Settings className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-2xl font-black tracking-tighter text-white">SETTINGS</h1>
                    </div>

                    <nav className="space-y-1">
                        {sidebarItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveSection(item.id as Section)}
                                className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-300 group ${activeSection === item.id
                                    ? "bg-white/10 text-white shadow-xl ring-1 ring-white/10"
                                    : "text-gray-500 hover:bg-white/5 hover:text-gray-300"
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 transition-transform duration-300 ${activeSection === item.id ? "scale-110" : "group-hover:translate-x-1"}`} />
                                <span className={`text-sm font-semibold tracking-wide ${activeSection === item.id ? "translate-x-0" : "-translate-x-1 group-hover:translate-x-0 transition-transform"}`}>
                                    {item.label}
                                </span>
                                {activeSection === item.id && (
                                    <motion.div layoutId="active" className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                                )}
                            </button>
                        ))}
                    </nav>

                    <div className="hidden md:block pt-8 px-4">
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 text-center">
                            <Shield className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Your Account is Secure</p>
                            <p className="text-[9px] text-gray-500 mt-1">Verified protected by Viora Guard</p>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6 md:p-12 lg:p-20 overflow-y-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeSection}
                            initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            exit={{ opacity: 0, y: -10, filter: "blur(10px)" }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="max-w-2xl mx-auto"
                        >
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {showEditProfile && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-2xl bg-[#0f0f0f] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl relative"
                        >
                            <button
                                onClick={() => setShowEditProfile(false)}
                                className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors z-10"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <div className="max-h-[85vh] overflow-y-auto p-4 md:p-8">
                                <EditProfile
                                    onClose={() => setShowEditProfile(false)}
                                    onSave={() => setShowEditProfile(false)}
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 12s linear infinite;
                }
                ::-webkit-scrollbar {
                    width: 6px;
                }
                ::-webkit-scrollbar-track {
                    background: transparent;
                }
                ::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
            `}</style>
        </div>
    );
}
