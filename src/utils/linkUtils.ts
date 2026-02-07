/**
 * Generates a shareable link for a post or reel.
 * @param type The type of content ('post' or 'reel')
 * @param id The unique identifier of the content
 * @param baseUrl Optional base URL (defaults to window.location.origin in browser)
 * @returns The complete shareable URL
 */
export const generateShareLink = (
    type: 'post' | 'reel',
    id: string,
    baseUrl?: string
): string => {
    // If baseUrl is not provided, try to use window.location.origin
    // If not in browser (SSR), fallback to empty string or a default
    const origin = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');

    // Ensure we don't have double slashes if origin ends with /
    const cleanOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;

    return `${cleanOrigin}/${type}/${id}`;
};
