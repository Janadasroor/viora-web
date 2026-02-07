/**
 * Decode JWT token without verification (client-side only)
 * This is safe because we're only reading the payload, not verifying authenticity
 */
export function decodeJWT(token: string): any {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error decoding JWT:', error);
        return null;
    }
}

/**
 * Get cookie value by name
 */
export function getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;

    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);

    if (parts.length === 2) {
        return parts.pop()?.split(';').shift() || null;
    }

    return null;
}

/**
 * Get user ID from access token cookie
 */
export function getUserIdFromToken(): string | null {
    const accessToken = getCookie('accessToken');

    if (!accessToken) {
        return null;
    }

    const decoded = decodeJWT(accessToken);

    if (decoded && decoded.userId) {
        return decoded.userId;
    }

    return null;
}
