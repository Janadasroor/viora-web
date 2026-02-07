"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/**
 * Global API error handler component
 * Intercepts API errors and handles them appropriately
 */
export function ApiErrorHandler({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { user } = useAuth();

    useEffect(() => {
        // Store original fetch
        const originalFetch = window.fetch;

        // Override fetch to intercept responses
        window.fetch = async (...args) => {
            const response = await originalFetch(...args);

            // Clone response to read it
            const clonedResponse = response.clone();

            // Only intercept JSON responses
            const contentType = response.headers.get("content-type");
            if (contentType?.includes("application/json")) {
                try {
                    const data = await clonedResponse.json();

                    // Handle ACCOUNT_SUSPENDED error
                    if (
                        data.code === "ACCOUNT_SUSPENDED" &&
                        response.status === 403 &&
                        user
                    ) {
                        router.push("/complete-profile");
                    }
                } catch (e) {
                    // Ignore JSON parse errors
                }
            }

            return response;
        };

        // Cleanup: restore original fetch on unmount
        return () => {
            window.fetch = originalFetch;
        };
    }, [router, user]);

    return <>{children}</>;
}
