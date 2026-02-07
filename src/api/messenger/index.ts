import { apiUrl, jsonFetchOptions, defaultFetchOptions } from "../config";
import { fetchWithAuth } from "../fetchClient";

export interface User {
    userId: string;
    username: string;
    avatarUrl?: string;
    displayName?: string;
}

export interface Message {
    conversationId: string;
    messageId: string;
    senderId: string;
    messageType: 'text' | 'image' | 'video' | 'audio' | 'file';
    content?: string;
    mediaUrl?: string;
    metadata?: string;
    isDelivered: boolean;
    deliveredBy?: { [key: string]: string };
    isRead: boolean;
    readBy?: { [key: string]: string };
    isDeleted?: boolean;
    deletedFor?: string[];
    createdAt: string;
    sender?: User;
}

export interface Conversation {
    conversationId: string;
    members: User[];
    name?: string;
    isGroup: boolean;
    groupAdmin?: string;
    lastMessageId?: string;
    lastMessageTime?: string;
    lastMessageContent?: string;
    createdAt: string;
    updatedAt: string;
    unreadCount?: number;
}

export const getConversations = async (): Promise<Conversation[]> => {
    try {
        const response = await fetchWithAuth(`${apiUrl}/messenger/conversations`, {
            ...defaultFetchOptions
        });
        const data = await response.json();

        if (!response.ok) {
            console.error("Failed to fetch conversations:", data.error || response.statusText);
            return [];
        }

        return (data.data || []) as Conversation[];
    } catch (error) {
        console.error("Error in getConversations helper:", error);
        return [];
    }
};

export const getMessages = async (conversationId: string, limit = 50, cursor?: string) => {
    try {
        const query = new URLSearchParams({ limit: limit.toString() });
        if (cursor) query.append("cursor", cursor);

        const response = await fetchWithAuth(`${apiUrl}/messenger/messages/${conversationId}?${query.toString()}`, {
            ...defaultFetchOptions
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Failed to fetch messages:", data.error || response.statusText);
            return { messages: [], pagination: { nextCursor: null } };
        }

        return {
            messages: (data.data || []) as Message[],
            pagination: (data.pagination || { nextCursor: null }) as { nextCursor: string | null }
        };
    } catch (error) {
        console.error("Error in getMessages helper:", error);
        return { messages: [], pagination: { nextCursor: null } };
    }
};

export const startPrivateChat = async (fromUsername: string, toUsername: string) => {

    const response = await fetchWithAuth(`${apiUrl}/messenger/start-private-chat`, {
        ...jsonFetchOptions("POST", { fromUsername, toUsername })
    });
    const data = await response.json();
    return data.data.conversationId as string;
};

export const markAsRead = async (conversationId: string, messageId: string) => {
    return await fetch(`${apiUrl}/messenger/${messageId}/read?conversationId=${conversationId}`, {
        method: "PUT",
        ...defaultFetchOptions
    });
};

export const deleteMessage = async (conversationId: string, messageId: string, forEveryone = false) => {
    return await fetch(`${apiUrl}/messenger/${messageId}?conversationId=${conversationId}&deleteForEveryone=${forEveryone}`, {
        method: "DELETE",
        ...defaultFetchOptions
    });
};
