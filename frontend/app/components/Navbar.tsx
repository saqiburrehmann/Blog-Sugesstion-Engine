"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../lib/api";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(
    null
  );

  useEffect(() => {
    const fetchUser = async () => {
      try {
        console.log("[🔄] Fetching user profile...");

        const res = await fetch(`${api.profile}`, {
          method: "GET",
          credentials: "include",
        });

        console.log("[🌐] Profile response status:", res.status);

        if (res.ok) {
          const userData = await res.json();
          console.log("[✅] User data received:", userData);
          setUser(userData);
        } else {
          console.warn("[⚠️] Failed to fetch user info");
        }
      } catch (err) {
        console.error("[❌] Error fetching user info", err);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch(api.logout, {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        router.push("/login");
      } else {
        console.error("Logout failed");
      }
    } catch (err) {
      console.error("Logout error", err);
    }
  };

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center shadow">
      <h1 className="text-2xl font-bold">Blog Dashboard</h1>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="text-sm text-gray-300">
            Logged in as <span className="font-semibold">{user.name}</span>
          </div>
        ) : (
          <div className="text-sm text-gray-500">Loading user...</div>
        )}
        <button
          onClick={handleLogout}
          className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 cursor-pointer"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
