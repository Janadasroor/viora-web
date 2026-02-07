"use client";

import UserProfile from "@/components/profile/UserProfile";
import { use } from "react";

interface ProfilePageProps {
    params: Promise<{
        userId: string;
    }>;
}

export default function ProfilePage({ params }: ProfilePageProps) {
    const { userId } = use(params);

    return <UserProfile userId={userId} />;
}
