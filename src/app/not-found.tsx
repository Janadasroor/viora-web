import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center dark:bg-black">
            <div className="relative mb-8 h-24 w-24 overflow-hidden rounded-2xl shadow-xl shadow-violet-200/50 dark:shadow-violet-900/20">
                <Image
                    src="/icons/icon-192x192.png"
                    alt="Viora Logo"
                    fill
                    className="object-cover"
                    priority
                />
            </div>

            <h1 className="mb-2 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
                Page not found
            </h1>

            <p className="mb-8 max-w-md text-lg text-gray-600 dark:text-gray-400">
                Sorry, we couldn't find the page you're looking for. It might have been removed or the link might be broken.
            </p>

            <Link
                href="/"
                className="rounded-full bg-violet-600 px-8 py-3 text-base font-semibold text-white transition-all hover:bg-violet-700 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
                Go back home
            </Link>
        </div>
    );
}
