"use client";
import React, { useState } from 'react';
import { AlertTriangle, X, CheckCircle2, ChevronRight, MessageSquare } from 'lucide-react';
import { submitReport } from '@/api/reports';

interface ReportDialogProps {
    isOpen: boolean;
    onClose: () => void;
    targetId: string;
    targetType: 'post' | 'comment' | 'story' | 'user' | 'reel';
    reportedUserId?: string;
}

const REPORT_CATEGORIES = [
    { id: 'spam', label: 'Spam', description: 'Misleading or repetitive content' },
    { id: 'harassment', label: 'Harassment', description: 'Bullying or targeted insults' },
    { id: 'hate_speech', label: 'Hate Speech', description: 'Attack on protected groups' },
    { id: 'violence', label: 'Violence', description: 'Graphic or threatening content' },
    { id: 'nudity', label: 'Nudity or Sexual Content', description: 'Inappropriate adult content' },
    { id: 'scam', label: 'Scam or Fraud', description: 'Deceptive financial practices' },
    { id: 'other', label: 'Other', description: 'Something else not listed' },
];

export default function ReportDialog({ isOpen, onClose, targetId, targetType, reportedUserId }: ReportDialogProps) {
    const [step, setStep] = useState<'category' | 'details' | 'success'>('category');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleCategorySelect = (categoryId: string) => {
        setSelectedCategory(categoryId);
        setStep('details');
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        const success = await submitReport({
            reportedUserId,
            targetType,
            targetId,
            reportCategory: selectedCategory,
            description
        });
        setIsSubmitting(false);
        if (success) {
            setStep('success');
        } else {
            alert('Failed to submit report. Please try again.');
        }
    };

    const resetAndClose = () => {
        setStep('category');
        setSelectedCategory('');
        setDescription('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-zinc-100 dark:border-zinc-800 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                        {step !== 'success' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                        {step === 'category' ? 'Report Content' : step === 'details' ? 'Report Details' : 'Thank You'}
                    </h3>
                    <button onClick={resetAndClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    {step === 'category' && (
                        <div className="space-y-2">
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                                Why are you reporting this {targetType}? Your report is anonymous, except if you're reporting an intellectual property infringement.
                            </p>
                            <div className="max-h-[350px] overflow-y-auto pr-2 scrollbar-hide">
                                {REPORT_CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => handleCategorySelect(cat.id)}
                                        className="w-full flex items-center justify-between p-4 mb-2 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-2xl transition-all border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 group"
                                    >
                                        <div>
                                            <div className="font-bold text-zinc-900 dark:text-zinc-100">{cat.label}</div>
                                            <div className="text-xs text-zinc-500">{cat.description}</div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 'details' && (
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2 block">
                                    Additional details (optional)
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Provide more context to help us understand the issue..."
                                    className="w-full h-32 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 text-zinc-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all resize-none"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep('category')}
                                    className="flex-1 py-3 px-6 rounded-2xl font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="flex-1 py-3 px-6 rounded-2xl font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Report'}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 className="w-10 h-10 text-green-500" />
                            </div>
                            <h4 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">We've Received Your Report</h4>
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-8 px-4">
                                Thank you for helping us keep Viora safe. We'll review your report and take appropriate action.
                            </p>
                            <button
                                onClick={resetAndClose}
                                className="w-full py-3 px-6 rounded-2xl font-bold bg-zinc-900 dark:bg-white text-white dark:text-black hover:opacity-90 active:scale-95 transition-all"
                            >
                                Done
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
