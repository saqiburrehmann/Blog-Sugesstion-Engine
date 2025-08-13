"use client";

import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { api } from "@/app/lib/api";

interface Blog {
  id: string;
  title: string;
  status: "draft" | "published" | "unpublished";
  author: {
    name?: string;
    email: string;
  };
  createdAt: string;
}

interface User {
  role: string;
  name?: string;
  email: string;
}

export default function AdminDashboardPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewStatus, setViewStatus] = useState<"published" | "unpublished">(
    "published"
  );

  useEffect(() => {
    async function fetchUserAndBlogs() {
      try {
        const userRes = await fetch(api.profile, { credentials: "include" });
        if (!userRes.ok) throw new Error("Unauthorized");
        const userData = await userRes.json();
        setUser(userData);

        if (userData.role !== "admin") {
          alert("Access denied: Admins only");
          return;
        }

        const blogsRes = await fetch(`${api.blogDetail}/admin/all`, {
          credentials: "include",
        });
        if (!blogsRes.ok) throw new Error("Failed to fetch blogs");
        const blogsData = await blogsRes.json();
        setBlogs(blogsData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    fetchUserAndBlogs();
  }, []);

  async function toggleStatus(blog: Blog) {
    if (!user || user.role !== "admin") return;
    const newStatus = blog.status === "published" ? "draft" : "published";

    try {
      const res = await fetch(`${api.blogDetail}/${blog.id}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        alert("Failed to update blog status");
        return;
      }

      setBlogs((prev) =>
        prev.map((b) => (b.id === blog.id ? { ...b, status: newStatus } : b))
      );
    } catch (err) {
      alert("Error updating blog status");
    }
  }

  if (loading)
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <p className="p-6 text-lg animate-pulse">Loading...</p>
      </div>
    );

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-950 text-red-500 flex items-center justify-center">
        <p className="p-6 text-lg">Access denied</p>
      </div>
    );
  }

  const filteredBlogs = blogs.filter((blog) =>
    viewStatus === "published"
      ? blog.status === "published"
      : blog.status === "draft" || blog.status === "unpublished"
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-white">
      <Navbar />

      <main className="flex-grow max-w-6xl mx-auto p-6">
        <h1 className="text-4xl font-extrabold mb-8 text-center text-pink-500 tracking-wide animate-pulse">
          Admin Dashboard
        </h1>

        {/* Toggle Buttons */}
        <div className="flex justify-center gap-4 mb-10">
          <button
            onClick={() => setViewStatus("published")}
            className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 transform ${
              viewStatus === "published"
                ? "bg-pink-500 text-white shadow-xl scale-105 cursor-pointer"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:scale-105 cursor-pointer"
            }`}
          >
            Published Blogs
          </button>
          <button
            onClick={() => setViewStatus("unpublished")}
            className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 transform ${
              viewStatus === "unpublished"
                ? "bg-pink-500 text-white shadow-xl scale-105 cursor-pointer"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:scale-105 cursor-pointer"
            }`}
          >
            Unpublished Blogs
          </button>
        </div>

        {/* Blogs Grid */}
        {filteredBlogs.length === 0 ? (
          <p className="text-gray-400 text-center mt-12 text-lg">
            No blogs in this state
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredBlogs.map((blog) => (
              <div
                key={blog.id}
                className="bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-md hover:shadow-2xl hover:scale-105 transition-transform duration-300 flex flex-col justify-between cursor-pointer"
              >
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-pink-400 mb-2">
                    {blog.title}
                  </h2>
                  <p className="text-gray-400 text-sm mb-2">
                    By {blog.author.name ?? blog.author.email} •{" "}
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </p>
                  <span
                    className={`inline-block mt-1 px-3 py-1 text-sm font-semibold rounded-full ${
                      blog.status === "published"
                        ? "bg-green-600 text-white"
                        : blog.status === "unpublished"
                        ? "bg-yellow-600 text-white"
                        : "bg-gray-500 text-white"
                    }`}
                  >
                    {blog.status.toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={() => toggleStatus(blog)}
                  className={`mt-auto px-4 py-2 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 transform ${
                    blog.status === "published"
                      ? "bg-red-600 hover:bg-red-700 hover:scale-105 focus:ring-red-500 cursor-pointer"
                      : "bg-green-600 hover:bg-green-700 hover:scale-105 focus:ring-green-500 cursor-pointer"
                  } text-white`}
                >
                  {blog.status === "published" ? "Unpublish" : "Publish"}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
