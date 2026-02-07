"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { trackHeartbeat } from "@/api/analytics";

/**
 * Custom hook to track user active time on the web application.
 * Sends a heartbeat every 60 seconds when the user is authenticated and the page is visible.
 */
export function useHeartbeat() {
    const { isAuthenticated } = useAuth();
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const HEARTBEAT_INTERVAL = 60000; // 60 seconds

    useEffect(() => {
        if (!isAuthenticated) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        const sendPulse = () => {
            // Only send if the page is visible
            if (document.visibilityState === 'visible') {
                trackHeartbeat(60, 'active_time');
            }
        };

        // Send initial pulse after interval
        intervalRef.current = setInterval(sendPulse, HEARTBEAT_INTERVAL);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isAuthenticated]);
}
