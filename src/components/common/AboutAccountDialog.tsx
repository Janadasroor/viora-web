"use client";
import React, { useEffect, useState } from 'react';
import { User, Calendar, ShieldCheck, MapPin, X, Info } from 'lucide-react';
import { apiUrl } from '@/api/config';
import { fetchWithAuth } from '@/api/fetchClient';
import ImageComponent from '../media/ImageComponent';

interface AboutAccountDialogProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
}

interface AccountInfo {
    username: string;
    displayName: string;
    createdAt: string;
    location?: string;
    isVerified: boolean;
    media: any[];
}

export default function AboutAccountDialog({ isOpen, onClose, userId }: AboutAccountDialogProps) {
    const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen && userId) {
            fetchAccountInfo();
        }
    }, [isOpen, userId]);

    const fetchAccountInfo = async () => {
        setIsLoading(true);
        try {
            const res = await fetchWithAuth(`${apiUrl}/users/${userId}/profile`);
            const data = await res.json();
            if (data.success && data.data) {
                setAccountInfo(data.data);
            }
        } catch (error) {
            console.error("Error fetching account info:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-zinc-100 dark:border-zinc-800 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                        <Info className="w-5 h-5 text-zinc-400" />
                        About this account
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8">
                    {isLoading ? (
                        <div className="space-y-6 animate-pulse">
                            <div className="flex flex-col items-center">
                                <div className="w-20 h-20 bg-zinc-200 dark:bg-zinc-800 rounded-full mb-4" />
                                <div className="h-6 w-32 bg-zinc-200 dark:bg-zinc-800 rounded mb-2" />
                                <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded" />
                            </div>
                            <div className="space-y-4 pt-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-12 bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl" />
                                ))}
                            </div>
                        </div>
                    ) : accountInfo ? (
                        <div className="space-y-8">
                            {/* Profile Part */}
                            <div className="flex flex-col items-center text-center">
                                <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-amber-500 to-fuchsia-600 mb-4">
                                    <div className="w-full h-full rounded-full border-2 border-white dark:border-zinc-900 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                                        {accountInfo.media?.[0]?.filePath ? (
                                            <ImageComponent path={accountInfo.media[0].filePath} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                                <User className="w-10 h-10" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <h4 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                                    {accountInfo.displayName || accountInfo.username}
                                    {accountInfo.isVerified && <ShieldCheck className="w-5 h-5 text-blue-500 fill-blue-500/10" />}
                                </h4>
                                <p className="text-zinc-500 text-sm font-medium">@{accountInfo.username}</p>
                            </div>

                            {/* Info List */}
                            <div className="space-y-4">
                                <div className="flex items-start gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                                    <Calendar className="w-5 h-5 text-zinc-400 mt-0.5" />
                                    <div>
                                        <div className="text-[13px] font-bold text-zinc-900 dark:text-zinc-100">Date joined</div>
                                        <div className="text-sm text-zinc-500 mt-0.5">{formatDate(accountInfo.createdAt)}</div>
                                    </div>
                                </div>

                                {accountInfo.location && (
                                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                                        <MapPin className="w-5 h-5 text-zinc-400 mt-0.5" />
                                        <div>
                                            <div className="text-[13px] font-bold text-zinc-900 dark:text-zinc-100">Account location</div>
                                            <div className="text-sm text-zinc-500 mt-0.5">{accountInfo.location}</div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-start gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                                    <ShieldCheck className="w-5 h-5 text-zinc-400 mt-0.5" />
                                    <div>
                                        <div className="text-[13px] font-bold text-zinc-900 dark:text-zinc-100">Verification status</div>
                                        <div className="text-sm text-zinc-500 mt-0.5">{accountInfo.isVerified ? 'Verified account' : 'Standard account'}</div>
                                    </div>
                                </div>
                            </div>

                            <p className="text-[12px] text-center text-zinc-500 px-6 leading-relaxed">
                                To help keep our community authentic, we show information about accounts that reach a lot of people or behave in certain ways.
                            </p>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-zinc-500">Failed to load account information.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
