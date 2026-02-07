"use client";
import React from "react";
import MessengerView from "@/components/messenger/MessengerView";
import { useRouter } from "next/navigation";

export default function MessengerPage() {
    const router = useRouter();

    return (
        <div className="fixed inset-0 bg-white dark:bg-black z-50 overflow-hidden">
            <MessengerView
                standalone={true}
                onBack={() => router.push("/feed")}
            />
        </div>
    );
}
