'use client';

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, UserPlus, UserCheck, Loader2, Search, CheckCircle } from "lucide-react";
import { getUsers, followUser, unfollowUser } from "@/api/users";
import { User } from "@/models/User";
import ImageComponent from "@/components/media/ImageComponent";

interface FollowStepProps {
    data: any;
    onUpdate: (data: any) => void;
    onFinish: () => void;
    onBack: () => void;
}

export default function FollowStep({ data, onUpdate, onFinish, onBack }: FollowStepProps) {
    const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [following, setFollowing] = useState<Set<string>>(new Set());
    const [finishing, setFinishing] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // Fetch verified/active users as suggestions
                const users = await getUsers(1, 15, undefined, true);
                setSuggestedUsers(users.filter(u => u.userId !== data.userId));
            } catch (err) {
                console.error("Failed to fetch suggestions:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [data.userId]);

    const handleFollow = async (userId: string) => {
        try {
            if (following.has(userId)) {
                await unfollowUser(userId);
                const newFollowing = new Set(following);
                newFollowing.delete(userId);
                setFollowing(newFollowing);
                onUpdate({ followedUsers: Array.from(newFollowing) });
            } else {
                await followUser(userId);
                const newFollowing = new Set(following);
                newFollowing.add(userId);
                setFollowing(newFollowing);
                onUpdate({ followedUsers: Array.from(newFollowing) });
            }
        } catch (err) {
            console.error("Follow action failed:", err);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="animate-spin text-primary mb-4" size={40} />
                <p className="text-muted-foreground animate-pulse">Finding interesting people for you...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            <h2 className="text-3xl font-bold mb-2">Build your community</h2>
            <p className="text-muted-foreground mb-8 text-sm">Follow some interesting accounts to get started.</p>

            <div className="grid grid-cols-1 gap-4 max-h-[450px] overflow-y-auto pr-2 scrollbar-hide mb-8">
                {suggestedUsers.map((user) => (
                    <div
                        key={user.userId}
                        className="flex items-center gap-4 bg-muted/30 p-4 rounded-2xl border border-border/50 hover:bg-muted/50 transition-colors"
                    >
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-primary/10 flex-shrink-0">
                            {user.profilePictureUrl ? (
                                <ImageComponent path={user.profilePictureUrl} alt={user.username || ""} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-primary font-bold">
                                    {user.username?.[0].toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                                <h3 className="font-bold text-sm truncate">{user.displayName || user.username}</h3>
                                {user.isVerified && <CheckCircle size={14} className="text-primary fill-primary/10" />}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                        </div>
                        <button
                            onClick={() => handleFollow(user.userId)}
                            className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all ${following.has(user.userId)
                                ? 'bg-muted text-foreground hover:bg-muted-foreground/10'
                                : 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 active:scale-95'
                                }`}
                        >
                            {following.has(user.userId) ? (
                                <><UserCheck size={14} /> Following</>
                            ) : (
                                <><UserPlus size={14} /> Follow</>
                            )}
                        </button>
                    </div>
                ))}

                {suggestedUsers.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground italic">
                        No suggestions found at the moment. You can discover more people later!
                    </div>
                )}
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="px-6 py-4 rounded-2xl font-bold transition-all hover:bg-muted"
                >
                    Back
                </button>
                <button
                    onClick={onFinish}
                    disabled={finishing}
                    className="flex-1 px-6 py-4 bg-primary text-primary-foreground rounded-2xl font-bold shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
                >
                    {finishing ? <Loader2 className="animate-spin" size={20} /> : "Finish Onboarding"}
                </button>
            </div>

            <p className="text-center text-[10px] text-muted-foreground mt-6 uppercase tracking-widest font-bold">
                {following.size > 0 ? `You followed ${following.size} people` : "Almost done!"}
            </p>
        </div>
    );
}
