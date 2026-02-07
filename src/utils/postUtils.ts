export const getPostBackgroundColor = (postId: string) => {
    const colors = [
        'bg-gradient-to-br from-pink-500 to-rose-500',
        'bg-gradient-to-br from-purple-500 to-indigo-500',
        'bg-gradient-to-br from-blue-500 to-cyan-500',
        'bg-gradient-to-br from-teal-500 to-emerald-500',
        'bg-gradient-to-br from-orange-500 to-amber-500',
        'bg-gradient-to-br from-fuchsia-500 to-pink-500',
        'bg-gradient-to-br from-rose-400 to-red-500',
        'bg-gradient-to-br from-violet-600 to-indigo-600',
    ];

    let hash = 0;
    for (let i = 0; i < postId.length; i++) {
        hash = postId.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash) % colors.length;
    return colors[index];
};
