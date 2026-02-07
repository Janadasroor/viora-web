import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
    children: React.ReactNode;
    userId?: string;
}

export function SocketProvider({ children, userId }: SocketProviderProps) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Only connect if we have a userId (user is authenticated)
        if (!userId) {
            return;
        }

        // Determine the socket URL
        // Priority: env var > dynamic current host (if on port 3000, try 3003) > localhost:3003
        let socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_MEDIA_API_URL;

        if (!socketUrl && typeof window !== 'undefined') {
            const hostname = window.location.hostname;
            socketUrl = `http://${hostname}:3003`; // Default server port in this project
        }

        // Get token from cookies
        const token = typeof document !== 'undefined' ?
            document.cookie.split('; ').find(row => row.startsWith('accessToken='))?.split('=')[1] : null;



        // Connect to Socket.IO server
        const socketInstance = io(socketUrl || 'http://localhost:3003', {
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            auth: {
                userId: userId,
                token: token,
            },
        });

        socketInstance.on('connect', () => {
            setIsConnected(true);

            // Join user-specific room
            socketInstance.emit('join', `user_${userId}`);
        });

        socketInstance.on('disconnect', (reason) => {
            setIsConnected(false);
        });

        socketInstance.on('connect_error', (error: Error) => {
            console.error('⚠️ Socket connection error:', error.message);
            setIsConnected(false);
        });

        setSocket(socketInstance);

        // Cleanup on unmount
        return () => {
            socketInstance.disconnect();
        };
    }, [userId]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
}
