"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Users, MousePointer2, Eye, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { getProfileAnalytics, ProfileStats } from '@/api/analytics';

interface CreatorDashboardProps {
    userId: string;
}

const CreatorDashboard: React.FC<CreatorDashboardProps> = ({ userId }) => {
    const [stats, setStats] = useState<ProfileStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState(7);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            const data = await getProfileAnalytics(userId, timeRange);
            setStats(data);
            setLoading(false);
        };
        fetchStats();
    }, [userId, timeRange]);

    const calculateTotals = () => {
        if (!stats) return { visits: 0, follows: 0, clicks: 0 };
        return Object.values(stats).reduce((acc, day) => ({
            visits: acc.visits + (day.profile_visit || 0),
            follows: acc.follows + (day.follow || 0),
            clicks: acc.clicks + (day.link_click || 0)
        }), { visits: 0, follows: 0, clicks: 0 });
    };

    const totals = calculateTotals();

    // Custom SVG Line Chart Component
    const AnalyticsChart = () => {
        if (!stats) return null;

        const sortedDays = Object.keys(stats).sort();
        const dataPoints = sortedDays.map(day => stats[day].profile_visit || 0);
        const maxVal = Math.max(...dataPoints, 10);

        const width = 800;
        const height = 200;
        const padding = 20;

        const points = dataPoints.map((val, i) => {
            const x = (i / (dataPoints.length - 1)) * (width - padding * 2) + padding;
            const y = height - (val / maxVal) * (height - padding * 2) - padding;
            return `${x},${y}`;
        }).join(' ');

        return (
            <div className="relative w-full h-[250px] mt-6">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                    <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
                        <line
                            key={i}
                            x1={padding}
                            y1={height - padding - p * (height - padding * 2)}
                            x2={width - padding}
                            y2={height - padding - p * (height - padding * 2)}
                            className="stroke-border/30"
                            strokeDasharray="4 4"
                        />
                    ))}

                    {/* Area under line */}
                    <path
                        d={`M ${padding},${height - padding} ${points} L ${width - padding},${height - padding} Z`}
                        fill="url(#chartGradient)"
                        className="transition-all duration-1000"
                    />

                    {/* The Line */}
                    <motion.polyline
                        fill="none"
                        stroke="var(--primary)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={points}
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                    />

                    {/* Data dots */}
                    {dataPoints.map((val, i) => {
                        const x = (i / (dataPoints.length - 1)) * (width - padding * 2) + padding;
                        const y = height - (val / maxVal) * (height - padding * 2) - padding;
                        return (
                            <circle
                                key={i}
                                cx={x} cy={y} r="4"
                                className="fill-primary stroke-background stroke-2 cursor-pointer hover:r-6 transition-all"
                            />
                        );
                    })}
                </svg>
            </div>
        );
    };

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent"
                    >
                        Creator Insights
                    </motion.h1>
                    <p className="text-muted-foreground mt-1">Real-time performance metrics for your profile</p>
                </div>

                <div className="flex items-center gap-2 bg-muted p-1 rounded-xl">
                    {[7, 30, 90].map((d) => (
                        <button
                            key={d}
                            onClick={() => setTimeRange(d)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${timeRange === d
                                    ? 'bg-background shadow-sm text-foreground'
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {d} Days
                        </button>
                    ))}
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Stats Cards */}
                <MetricCard
                    title="Profile Views"
                    value={totals.visits}
                    icon={<Eye className="w-5 h-5" />}
                    trend="+12.5%"
                    isUp={true}
                    color="from-blue-500/10 to-blue-500/5"
                />
                <MetricCard
                    title="New Followers"
                    value={totals.follows}
                    icon={<Users className="w-5 h-5" />}
                    trend="+5.2%"
                    isUp={true}
                    color="from-purple-500/10 to-purple-500/5"
                />
                <MetricCard
                    title="Link Clicks"
                    value={totals.clicks}
                    icon={<MousePointer2 className="w-5 h-5" />}
                    trend="-2.1%"
                    isUp={false}
                    color="from-pink-500/10 to-pink-500/5"
                />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass rounded-3xl p-8 border border-border/50"
            >
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            Audience Growth
                        </h2>
                        <p className="text-sm text-muted-foreground">Daily profile visits breakdown</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-primary"></div>
                            <span className="text-xs text-muted-foreground">Visits</span>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="h-[250px] w-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <AnalyticsChart />
                )}
            </motion.div>
        </div>
    );
};

const MetricCard = ({ title, value, icon, trend, isUp, color }: any) => (
    <motion.div
        whileHover={{ y: -5 }}
        className={`glass relative overflow-hidden rounded-3xl p-6 border border-border/50 bg-gradient-to-br ${color}`}
    >
        <div className="flex justify-between items-start">
            <div className="p-3 bg-background/50 rounded-2xl shadow-sm">
                {icon}
            </div>
            <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${isUp ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                }`}>
                {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {trend}
            </div>
        </div>
        <div className="mt-4">
            <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
            <p className="text-3xl font-bold mt-1 tabular-nums">{value.toLocaleString()}</p>
        </div>
    </motion.div>
);

export default CreatorDashboard;
