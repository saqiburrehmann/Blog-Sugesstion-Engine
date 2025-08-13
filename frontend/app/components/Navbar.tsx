"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "../lib/api";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<{
    name: string;
    email: string;
    role: string;
  } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
        router.push("/pages/login");
      } else {
        console.error("Logout failed");
      }
    } catch (err) {
      console.error("Logout error", err);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center shadow">
      <h1 className="text-2xl font-bold">Blog Dashboard</h1>

      <div className="flex items-center gap-6">
        {user ? (
          <>
            <div className="text-sm text-gray-300">
              Logged in as{" "}
              <span className="font-semibold">{user.name || user.email}</span> (
              {user.role})
            </div>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((open) => !open)}
                className="flex items-center gap-1 bg-gray-800 px-4 py-2 rounded hover:bg-gray-700 focus:outline-none"
              >
                Menu
                <svg
                  className={`w-4 h-4 transition-transform ${
                    dropdownOpen ? "rotate-180" : "rotate-0"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {dropdownOpen && (
                <ul className="absolute right-0 mt-2 w-40 bg-white text-gray-900 rounded-md shadow-lg py-2 z-50">
                  <li>
                    <a
                      href="/pages/create-blogs"
                      className="block px-4 py-2 hover:bg-gray-200"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Create Blog
                    </a>
                  </li>
                  <li>
                    <a
                      href="/my-blogs"
                      className="block px-4 py-2 hover:bg-gray-200"
                      onClick={() => setDropdownOpen(false)}
                    >
                      My Blogs
                    </a>
                  </li>
                  <li>
                    <a
                      href="/settings"
                      className="block px-4 py-2 hover:bg-gray-200"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Settings
                    </a>
                  </li>
                  {user.role === "admin" && (
                    <li>
                      <a
                        href="/admin/dashboard"
                        className="block px-4 py-2 hover:bg-gray-200 font-semibold text-red-600"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Admin Panel
                      </a>
                    </li>
                  )}
                </ul>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 cursor-pointer"
            >
              Logout
            </button>
          </>
        ) : (
          <div className="text-sm text-gray-500">Loading user...</div>
        )}
      </div>
    </nav>
  );
}
