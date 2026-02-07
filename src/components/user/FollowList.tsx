"use client";
import { useEffect, useState } from "react";
import { getFollowers, getFollowing } from "@/api/users";
import type { User } from "@/models/User";

interface Props {
  userId: string;
  type: "followers" | "following";
}

export default function FollowList({ userId, type }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const data = type === "followers"
        ? await getFollowers(userId)
        : await getFollowing(userId);
      setUsers(data);
      setLoading(false);
    }
    fetchData();
  }, [userId, type]);

  if (loading) return <div>Loading {type}...</div>;
  if (!users.length) return <div>No {type} found</div>;

  return (
    <ul className="space-y-2">
      {users.map((user) => (
        <li key={user.userId} className="flex items-center space-x-3 p-2 border rounded">
          <img
            src={user.profilePictureUrl || "/default-avatar.png"}
            alt={user.displayName || user.username || "User"}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p className="font-semibold">{user.displayName || user.username}</p>
            <p className="text-sm text-gray-500">{user.username}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
