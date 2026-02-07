"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";

interface ErrorNotification {
    id: string;
    message: string;
    type: 'error' | 'warning' | 'info' | 'success';
    duration?: number;
}

interface ErrorContextType {
    notifications: ErrorNotification[];
    showError: (message: string, duration?: number) => void;
    showWarning: (message: string, duration?: number) => void;
    showInfo: (message: string, duration?: number) => void;
    showSuccess: (message: string, duration?: number) => void;
    clearNotification: (id: string) => void;
    clearAll: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export function ErrorProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<ErrorNotification[]>([]);

    const addNotification = useCallback((
        message: string,
        type: ErrorNotification['type'],
        duration: number = 5000
    ) => {
        const id = `${Date.now()}-${Math.random()}`;
        const notification: ErrorNotification = { id, message, type, duration };

        setNotifications(prev => [...prev, notification]);

        if (duration > 0) {
            setTimeout(() => {
                clearNotification(id);
            }, duration);
        }
    }, []);

    const showError = useCallback((message: string, duration?: number) => {
        addNotification(message, 'error', duration);
    }, [addNotification]);

    const showWarning = useCallback((message: string, duration?: number) => {
        addNotification(message, 'warning', duration);
    }, [addNotification]);

    const showInfo = useCallback((message: string, duration?: number) => {
        addNotification(message, 'info', duration);
    }, [addNotification]);

    const showSuccess = useCallback((message: string, duration?: number) => {
        addNotification(message, 'success', duration);
    }, [addNotification]);

    const clearNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const clearAll = useCallback(() => {
        setNotifications([]);
    }, []);

    return (
        <ErrorContext.Provider
            value={{
                notifications,
                showError,
                showWarning,
                showInfo,
                showSuccess,
                clearNotification,
                clearAll,
            }}
        >
            {children}
        </ErrorContext.Provider>
    );
}

export function useError() {
    const context = useContext(ErrorContext);
    if (context === undefined) {
        throw new Error("useError must be used within an ErrorProvider");
    }
    return context;
}
