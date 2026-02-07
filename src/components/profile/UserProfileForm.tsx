"use client";
import { useState } from "react";
import { updateUserProfile, updateUserProfilePicture } from "@/api/users";

export default function ProfileForm() {
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleProfileUpdate = async () => {
    setLoading(true);
    try {
      const res = await updateUserProfile({ displayName: displayName, bio });
      setMessage(res.message);
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureUpdate = async () => {
    if (!profilePic) return;

    setLoading(true);
    try {
      // Upload file to server or get file_name from file upload service
      // Assuming you have already uploaded and have file_name:
      const fileName = profilePic.name;
      const res = await updateUserProfilePicture([fileName]); // Pass as array
      setMessage(res.message);
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Display Name"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        className="border p-2 rounded"
      />
      <textarea
        placeholder="Bio"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        className="border p-2 rounded w-full"
      />
      <button onClick={handleProfileUpdate} disabled={loading} className="bg-blue-500 text-white p-2 rounded">
        Update Profile
      </button>

      <input type="file" onChange={(e) => setProfilePic(e.target.files?.[0] || null)} />
      <button onClick={handleProfilePictureUpdate} disabled={loading} className="bg-green-500 text-white p-2 rounded">
        Update Profile Picture
      </button>

      {message && <p className="text-sm text-gray-700">{message}</p>}
    </div>
  );
}
