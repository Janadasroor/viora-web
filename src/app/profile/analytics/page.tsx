"use client";

import React from 'react';
import CreatorDashboard from '@/components/analytics/CreatorDashboard';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function AnalyticsPage() {
    const { user } = useAuth();
    console.log("AnalyticsPage",user?.userId);
    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-pulse text-muted-foreground">Loading creator tools...</div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto pt-8 px-4">
                <Link
                    href={`/profile/${user.userId}`}
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 group"
                >
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    Back to Profile
                </Link>
            </div>

            <CreatorDashboard userId={user.userId} />
        </main>
    );
}
