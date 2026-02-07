"use client"; // must be client

import { ReactNode } from "react";
import PostProvider from "@/context/PostContext";
import ReelProvider from "@/context/ReelContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { SettingsProvider } from "@/context/SettingsContext";
import { SocketProvider } from "@/context/SocketContext";
import { useNotifications } from "@/hooks/useNotifications";
import PushNotificationPrompt from "@/components/notifications/PushNotificationPrompt";
import MediaProcessingNotification from "@/components/notifications/MediaProcessingNotification";
import React from "react"; // Added React import for useState and useEffect
import { StoryViewerProvider } from "@/context/StoryViewerContext";
import { useHeartbeat } from "@/hooks/useHeartbeat";

function NotificationWrapper({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  const { requestPermission, notificationPermission } = useNotifications();

  // Only render after mount to avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {children}
      {mounted && notificationPermission === 'default' && (
        <PushNotificationPrompt
          onEnable={requestPermission}
          onDismiss={() => { }}
        />
      )}
      {mounted && <MediaProcessingNotification />}
    </>
  );
}

// Inner wrapper to access auth context
function ProvidersWithSocket({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.userId;

  // Global activity tracking
  useHeartbeat();

  return (
    <SocketProvider userId={userId}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <SettingsProvider>
          <ReelProvider>
            <PostProvider>
              <StoryViewerProvider>
                <NotificationWrapper>{children}</NotificationWrapper>
              </StoryViewerProvider>
            </PostProvider>
          </ReelProvider>
        </SettingsProvider>
      </ThemeProvider>
    </SocketProvider>
  );
}

export default function ClientProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ProvidersWithSocket>{children}</ProvidersWithSocket>
    </AuthProvider>
  );
}
