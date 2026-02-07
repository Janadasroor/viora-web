'use client';

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Hash, Image as ImageIcon, Check, Loader2, RefreshCw } from "lucide-react";
import { getTrendingHashtags, getTrendingPosts, recordPostInterested, TrendingHashtag } from "@/api/feed";
import { Post } from "@/models/Post";
import ImageComponent from "@/components/media/ImageComponent";

interface InterestsStepProps {
    data: any;
    onUpdate: (data: any) => void;
    onNext: () => void;
    onBack: () => void;
}

export default function InterestsStep({ data, onUpdate, onNext, onBack }: InterestsStepProps) {
    const [hashtags, setHashtags] = useState<TrendingHashtag[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [hData, pData] = await Promise.all([
                    getTrendingHashtags(20),
                    getTrendingPosts(1, 12, '24h')
                ]);
                setHashtags(hData);
                setPosts(pData.data);
            } catch (err) {
                console.error("Failed to fetch trending data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const toggleHashtag = (tag: string) => {
        const current = data.selectedInterests || [];
        if (current.includes(tag)) {
            onUpdate({ selectedInterests: current.filter((t: string) => t !== tag) });
        } else {
            onUpdate({ selectedInterests: [...current, tag] });
        }
    };

    const handleContinue = async () => {
        setSaving(true);
        try {
            // In a real app, we might save these to a specific "interests" endpoint
            // TODO: Replace with real interest recording logic
            // For now, we'll record interest in some sample posts from those categories
            // or just proceed as the plan was to "trigger mock interaction"

            // Example: record interest for the first few selected hashtags' sample posts if available
            // but for simplicity, we just proceed.

            onNext();
        } catch (err) {
            console.error("Failed to save interests:", err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="animate-spin text-primary mb-4" size={40} />
                <p className="text-muted-foreground animate-pulse">Curating interests for you...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            <h2 className="text-3xl font-bold mb-2">What inspires you?</h2>
            <p className="text-muted-foreground mb-8 text-sm">Select at least 3 topics to personalize your feed.</p>

            <div className="space-y-10 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
                {/* Hashtags Section */}
                <section>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                        <Hash size={16} /> Trending Topics
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {hashtags.map((h, index) => {
                            const isSelected = data.selectedInterests?.includes(h.hashtag);
                            return (
                                <button
                                    key={`${h.hashtag}-${index}`}
                                    onClick={() => toggleHashtag(h.hashtag)}
                                    className={`px-4 py-2 rounded-full border-2 transition-all flex items-center gap-2 ${isSelected
                                        ? 'bg-primary border-primary text-primary-foreground shadow-md scale-105'
                                        : 'bg-muted/40 border-transparent hover:border-primary/30 text-foreground'
                                        }`}
                                >
                                    <span>#{h.hashtag}</span>
                                    {isSelected && <Check size={14} />}
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* Trending Posts Section (Visual Interests) */}
                <section>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                        <ImageIcon size={16} /> Visual Inspiration
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                        {posts.map((post, index) => (
                            <motion.div
                                key={`${post.postId}-${index}`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    // Record interest immediately
                                    recordPostInterested(post.postId);
                                    // Also maybe add a hashtag from this post to interests
                                    if (post.hashtags && post.hashtags.length > 0) {
                                        const tags = post.hashtags.split(', ');
                                        const current = data.selectedInterests || [];
                                        onUpdate({ selectedInterests: Array.from(new Set([...current, ...tags.slice(0, 1)])) });
                                    }
                                }}
                                className="aspect-square rounded-xl overflow-hidden cursor-pointer relative group"
                            >
                                {post.media?.[0]?.filePath && (
                                    <ImageComponent
                                        path={post.media[0].filePath}
                                        alt="Trending"
                                        className="w-full h-full object-cover"
                                    />
                                )}
                                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <div className="bg-white/90 p-1.5 rounded-full">
                                        <Check size={16} className="text-primary" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>
            </div>

            <div className="flex items-center gap-4 mt-10">
                <button
                    onClick={onBack}
                    className="px-6 py-4 rounded-2xl font-bold transition-all hover:bg-muted"
                >
                    Back
                </button>
                <button
                    onClick={handleContinue}
                    disabled={saving || (data.selectedInterests?.length || 0) < 3}
                    className="flex-1 px-6 py-4 bg-primary text-primary-foreground rounded-2xl font-bold shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
                >
                    {saving ? <Loader2 className="animate-spin" size={20} /> : "Continue"}
                </button>
            </div>

            {(data.selectedInterests?.length || 0) < 3 && (
                <p className="text-center text-xs text-muted-foreground mt-4 italic">
                    Select {3 - (data.selectedInterests?.length || 0)} more to continue
                </p>
            )}
        </div>
    );
}
