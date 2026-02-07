import React, { useState, useEffect } from 'react';
import { Copy, Check, X, Share2, Loader2 } from 'lucide-react';

interface ShareDialogProps {
    isOpen: boolean;
    onClose: () => void;
    link: string;
    title: string;
    onShareToFeed?: () => Promise<boolean>;
}

const ShareDialog: React.FC<ShareDialogProps> = ({ isOpen, onClose, link, title, onShareToFeed }) => {
    const [copied, setCopied] = useState(false);
    const [sharing, setSharing] = useState(false);
    const [shared, setShared] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setCopied(false);
            setSharing(false);
            setShared(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(link);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const handleShareToFeed = async () => {
        if (!onShareToFeed || sharing || shared) return;

        setSharing(true);
        try {
            const success = await onShareToFeed();
            if (success) {
                setShared(true);
                setTimeout(() => onClose(), 1500);
            }
        } catch (error) {
            console.error('Failed to share to feed:', error);
        } finally {
            setSharing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-6 transform transition-all animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Share
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    {title}
                </p>

                {onShareToFeed && (
                    <button
                        onClick={handleShareToFeed}
                        disabled={sharing || shared}
                        className={`w-full flex items-center justify-center gap-3 p-4 mb-4 rounded-xl font-semibold transition-all duration-200 ${shared
                            ? 'bg-green-500 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20'
                            }`}
                    >
                        {sharing ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : shared ? (
                            <>
                                <Check className="w-5 h-5" />
                                Shared to Feed
                            </>
                        ) : (
                            <>
                                <Share2 className="w-5 h-5" />
                                Share to Feed
                            </>
                        )}
                    </button>
                )}

                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white dark:bg-gray-900 px-2 text-gray-400">or copy link</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                    <input
                        type="text"
                        readOnly
                        value={link}
                        className="flex-1 bg-transparent border-none text-sm text-gray-600 dark:text-gray-300 focus:outline-none px-2 truncate"
                    />
                    <button
                        onClick={handleCopy}
                        className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${copied
                                ? 'bg-green-500 text-white hover:bg-green-600'
                                : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90'
                            }
            `}
                    >
                        {copied ? (
                            <>
                                <Check className="w-4 h-4" />
                                Copied
                            </>
                        ) : (
                            <>
                                <Copy className="w-4 h-4" />
                                Copy
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Background click to close */}
            <div className="absolute inset-0 -z-10" onClick={onClose} />
        </div>
    );
};

export default ShareDialog;
