import { API_URL } from "@/constants/url";
import { ref, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase-config";

const USE_Firebase = process.env.NEXT_PUBLIC_USE_FIREBASE === 'true';
const USE_STORAGE_EMULATOR = process.env.NEXT_PUBLIC_USE_STORAGE_EMULATOR === 'true';
const localUrl = 'http://localhost:9199/v0/b/viora-887d7.firebasestorage.app/o/';

export const getMediaUrl = async (path: string): Promise<string> => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }

    try {
        if (USE_Firebase) {
            if (!storage) {
                console.error("Firebase storage is not initialized");
                return "";
            }

            const storageRef = ref(storage, path);

            if (USE_STORAGE_EMULATOR) {
                const encodedPath = encodeURIComponent(path);
                return `${localUrl}${encodedPath}?alt=media`;
            }
            const url = await getDownloadURL(storageRef);
            return url;
        } else {
            // Avoid double slashes if path starts with /
            const cleanPath = path.startsWith("/") ? path.slice(1) : path;
            const apiUrl = API_URL.endsWith("/") ? API_URL : `${API_URL}/`;
            const fullUrl = `${apiUrl}${cleanPath}`;
            return fullUrl;
        }
    } catch (error) {
        console.error("Failed to get media URL for path:", path, error);
        // TODO: Replace with real fallback logic
        return ""; // fallback or placeholder URL
    }
};