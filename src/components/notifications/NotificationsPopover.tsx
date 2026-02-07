"use client";

import React, { useRef, useEffect } from "react";
import NotificationsList from "./NotificationsList";

interface NotificationsPopoverProps {
    onClose: () => void;
}

export default function NotificationsPopover({ onClose }: NotificationsPopoverProps) {
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Close on click outside
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClose]);

    return (
        <div
            ref={popoverRef}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 origin-top-right transform transition-all duration-200 ease-out"
        >
            <NotificationsList isPopover={true} onClose={onClose} />
        </div>
    );
}
