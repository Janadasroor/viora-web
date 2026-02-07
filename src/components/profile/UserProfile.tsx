"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Settings, Grid, Bookmark, User as UserIcon, MapPin, Link as LinkIcon, Calendar, Camera, Loader2, Film, ArrowLeft, Share2, BarChart2, Check, X, Plus } from "lucide-react";
import { getCurrentUser, getUserProfile, followUser, unfollowUser } from "@/api/users";
import { createPost, getPosts } from "@/api/posts";
import { getUserReels } from "@/api/reels";
import { uploadImages } from "@/api/media";
import { motion, AnimatePresence } from "framer-motion";
import EditProfile from "@/components/profile/EditProfile";
import type { UserProfile as UserProfileType } from "@/models/UserProfile";
import type { Post } from "@/models/Post";
import type { ReelWithUser } from "@/types/api/reel.types";
import { format } from "date-fns";
import { API_URL } from "@/constants/url";
import UserListModal from "@/components/profile/UserListModal";
import CreateSelectionDialog from "@/components/create/CreateSelectionDialog";
import CreateReelDialog from "../create/CreateReelDialog";
import CreateStoryDialog from "../create/CreateStoryDialog";
import CreatePostDialog from "../post/CreatePostDialog";
interface UserProfileProps {
    userId?: string; // If provided, show that user's profile; otherwise show current user
    onBack?: () => void; // Optional callback to handle back navigation
}

export default function UserProfile({ userId, onBack }: UserProfileProps) {
    const router = useRouter();
    const [user, setUser] = useState<UserProfileType | null>(null);
    const [currentUser, setCurrentUser] = useState<UserProfileType | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [reels, setReels] = useState<ReelWithUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"posts" | "reels" | "saved" | "tagged" | "mentions">("posts");
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [activeUserList, setActiveUserList] = useState<"followers" | "following" | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [openSelectionDialog, setOpenSelectionDialog] = useState(false);
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [openStoryDialog, setOpenStoryDialog] = useState(false);
    const [openReelDialog, setOpenReelDialog] = useState(false);
    const [storiesKey, setStoriesKey] = useState(0);

    const handleCreateSelection = (type: "post" | "story" | "reel") => {
        setOpenSelectionDialog(false);
        if (type === "post") {
            setOpenCreateDialog(true);
        } else if (type === "story") {
            setOpenStoryDialog(true);
        } else if (type === "reel") {
            setOpenReelDialog(true);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const currentUserData = await getCurrentUser();
                setCurrentUser(currentUserData);

                let profileData: UserProfileType | null = null;
                if (userId && userId !== currentUserData?.userId) {
                    profileData = await getUserProfile(userId);
                } else if (currentUserData) {
                    profileData = await getUserProfile(currentUserData.userId);
                }

                if (profileData) {
                    setUser(profileData);
                    if (userId && (profileData as any).isFollowing !== undefined) {
                        setIsFollowing((profileData as any).isFollowing);
                    }
                    const userPosts = await getPosts(1, 24, profileData.userId);
                    setPosts(userPosts);
                    const userReels = await getUserReels(profileData.userId, 1, 12);
                    setReels(userReels);
                }
            } catch (error) {
                console.error("Failed to fetch profile data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId]);

    const handleFollowToggle = async () => {
        if (!user || !currentUser) return;
        setFollowLoading(true);
        try {
            if (isFollowing) {
                await unfollowUser(user.userId);
                setIsFollowing(false);
            } else {
                await followUser(user.userId);
                setIsFollowing(true);
            }
        } catch (error) {
            console.error("Failed to toggle follow:", error);
        } finally {
            setFollowLoading(false);
        }
    };

    const handleFileSelect = () => fileInputRef.current?.click();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;
        setIsUploading(true);
        try {
            const uploadRes = await uploadImages({
                files: [file],
                targetType: 'USER',
                targetId: user.userId.toString(),
            });
            if (uploadRes.success) {
                setTimeout(async () => {
                    const updatedUser = await getCurrentUser();
                    if (updatedUser) {
                        setUser(updatedUser);
                        if (currentUser && currentUser.userId === user.userId) setCurrentUser(updatedUser);
                    }
                }, 2000);
            }
        } catch (error) {
            console.error("Failed to update profile picture:", error);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const isOwnProfile = !userId || (currentUser && user && currentUser.userId === user.userId);


    if (loading) return (
        <div className="flex items-center justify-center h-screen bg-[#050505]">
            <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
        </div>
    );

    if (!user) return (
        <div className="flex flex-col items-center justify-center h-screen bg-[#050505] text-gray-500">
            <UserIcon className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-xl font-bold">User Not Found</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-black text-white pb-20">
            {/* Top Bar */}
            <div className="flex items-center justify-between px-4 py-3 sticky top-0 bg-black z-50 border-b border-zinc-900">
                <div className="font-bold text-lg">{user.username}</div>
                <div className="flex items-center gap-4">
                    <button onClick={() => setOpenCreateDialog(true)}>
                        <Plus className="w-6 h-6" />
                    </button>
                    <button onClick={() => router.push('/settings')}>
                        <Settings className="w-6 h-6" />
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 pt-4">
                {/* Header: Avatar + Stats */}
                <div className="flex items-center mb-6">
                    {/* Avatar */}
                    <div className="relative shrink-0 mr-8">
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-orange-600 to-red-600">
                            <div className="w-full h-full rounded-full border-[3px] border-black overflow-hidden bg-zinc-900 relative">
                                {user.media && user.media.length > 0 ? (
                                    <img
                                        src={API_URL + (user.media[0].thumbnailPath || user.media[0].filePath)}
                                        className="w-full h-full object-cover"
                                        alt={user.username}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                                        <UserIcon className="w-8 h-8 opacity-50" />
                                    </div>
                                )}
                                {isOwnProfile && (
                                    <div onClick={handleFileSelect} className="absolute inset-0 bg-black/30 flex items-center justify-center cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
                                        <Camera className="w-6 h-6 text-white" />
                                    </div>
                                )}
                            </div>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                        {user.isVerified && (
                            <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full border-2 border-black p-0.5">
                                <Check className="w-3 h-3 text-white" />
                            </div>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="flex-1 flex justify-around items-center">
                        {[
                            { label: "Posts", val: user.postsCount || posts.length },
                            { label: "Followers", val: user.followersCount || "0", action: () => setActiveUserList("followers") },
                            { label: "Following", val: user.followingCount || "0", action: () => setActiveUserList("following") }
                        ].map((s, i) => (
                            <button key={i} onClick={s.action} className="flex flex-col items-center">
                                <span className="text-lg font-bold">{s.val}</span>
                                <span className="text-sm text-zinc-400">{s.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Bio Section */}
                <div className="mb-6">
                    <div className="font-bold text-sm mb-1">{user.displayName || user.username}</div>
                    {user.bio && (
                        <div className="text-sm whitespace-pre-wrap mb-1">{user.bio}</div>
                    )}
                    {user.website && (
                        <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline flex items-center gap-1">
                            <LinkIcon className="w-3 h-3" />
                            {user.website.replace(/^https?:\/\//, '')}
                        </a>
                    )}
                    {user.location && (
                        <div className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {user.location}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mb-8">
                    {isOwnProfile ? (
                        <>
                            <button
                                onClick={() => setShowEditProfile(true)}
                                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-1.5 rounded-lg text-sm transition-colors"
                            >
                                Edit profile
                            </button>
                            <button
                                onClick={() => { }}
                                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-1.5 rounded-lg text-sm transition-colors"
                            >
                                Share profile
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={handleFollowToggle}
                                disabled={followLoading}
                                className={`flex-1 font-semibold py-1.5 rounded-lg text-sm transition-colors ${isFollowing
                                        ? "bg-zinc-800 text-white hover:bg-zinc-700"
                                        : "bg-blue-500 text-white hover:bg-blue-600"
                                    }`}
                            >
                                {isFollowing ? "Following" : "Follow"}
                            </button>
                            <button className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-1.5 rounded-lg text-sm transition-colors">
                                Message
                            </button>
                        </>
                    )}
                </div>

                {/* Highlights (Optional - simplified) */}
                {isOwnProfile && (
                    <div className="flex gap-4 mb-6 overflow-x-auto no-scrollbar">
                        <div onClick={() => setOpenStoryDialog(true)} className="flex flex-col items-center gap-1 cursor-pointer min-w-[60px]">
                            <div className="w-[60px] h-[60px] rounded-full border border-zinc-700 flex items-center justify-center">
                                <Plus className="w-6 h-6" />
                            </div>
                            <span className="text-xs">New</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="border-t border-zinc-800">
                <div className="flex">
                    {[
                        { id: "posts", icon: Grid },
                        { id: "reels", icon: Film },
                        { id: "tagged", icon: UserIcon } // Assuming UserIcon for tagged/person-pin
                    ].map(t => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id as any)}
                            className={`flex-1 py-3 flex justify-center items-center border-b-[1px] ${activeTab === t.id ? "border-white text-white" : "border-transparent text-zinc-500"
                                }`}
                        >
                            <t.icon className={`w-6 h-6 ${activeTab === t.id ? "text-white" : "text-zinc-500"}`} />
                        </button>
                    ))}
                </div>

                {/* Grid Content */}
                <div className="grid grid-cols-3 gap-0.5 mt-0.5">
                    {activeTab === "posts" && posts.map(post => (
                        <div
                            key={post.postId}
                            onClick={() => router.push(`/posts/${user.userId}?postId=${post.postId}`)}
                            className="aspect-square relative group bg-zinc-900 cursor-pointer"
                        >
                            {post.media && post.media[0] && (
                                <img
                                    src={API_URL + (post.media[0].thumbnailPath || post.media[0].filePath)}
                                    className="w-full h-full object-cover"
                                    alt="Post"
                                />
                            )}
                            {post.media && post.media.length > 1 && (
                                <div className="absolute top-2 right-2">
                                    <Grid className="w-4 h-4 text-white drop-shadow-md" fill="currentColor" />
                                </div>
                            )}
                            {post.postType === 'video' && (
                                <div className="absolute top-2 right-2">
                                    <Film className="w-4 h-4 text-white drop-shadow-md" />
                                </div>
                            )}
                        </div>
                    ))}

                    {activeTab === "reels" && reels.map(reel => (
                        <div
                            key={reel.reelId}
                            onClick={() => router.push(`/reel/${reel.reelId}`)}
                            className="aspect-[9/16] relative bg-zinc-900 cursor-pointer"
                        >
                            {reel.media && reel.media[0] && (
                                <video src={API_URL + reel.media[0].filePath} className="w-full h-full object-cover" muted />
                            )}
                            <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-xs font-bold drop-shadow-md">
                                <Film className="w-3 h-3" />
                                <span>{reel.viewsCount}</span>
                            </div>
                        </div>
                    ))}

                    {(activeTab === "tagged" || activeTab === "saved") && (
                        <div className="col-span-3 py-20 flex flex-col items-center justify-center text-zinc-500 gap-4">
                            <div className="p-4 rounded-full border-2 border-zinc-800">
                                <UserIcon className="w-8 h-8" />
                            </div>
                            <div className="text-xl font-bold text-white">Photos of you</div>
                            <div className="text-sm">When people tag you in photos, they'll appear here.</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals & Dialogs */}
            {showEditProfile && (
                <EditProfile
                    onClose={() => setShowEditProfile(false)}
                    initialData={user}
                    onSave={async () => {
                        try {
                            const updatedUser = await getCurrentUser();
                            if (updatedUser) {
                                setUser(updatedUser);
                                if (currentUser && currentUser.userId === updatedUser.userId) {
                                    setCurrentUser(updatedUser);
                                }
                            }
                        } catch (error) {
                            console.error("Failed to refresh user data:", error);
                        }
                    }}
                />
            )}

            {activeUserList && user && (
                <UserListModal isOpen={!!activeUserList} onClose={() => setActiveUserList(null)} title={activeUserList === "followers" ? "Followers" : "Following"} userId={user.userId} type={activeUserList} />
            )}

            <CreateSelectionDialog
                isOpen={openSelectionDialog}
                onClose={() => setOpenSelectionDialog(false)}
                onSelect={handleCreateSelection}
            />

            <CreatePostDialog
                isOpen={openCreateDialog}
                onClose={() => setOpenCreateDialog(false)}
                onSubmit={createPost}
            />

            <CreateStoryDialog
                isOpen={openStoryDialog}
                onClose={() => setOpenStoryDialog(false)}
                onSubmit={(story) => {
                    setStoriesKey(prev => prev + 1);
                }}
            />

            <CreateReelDialog
                isOpen={openReelDialog}
                onClose={() => setOpenReelDialog(false)}
                onSubmit={() => { }}
            />
            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}
