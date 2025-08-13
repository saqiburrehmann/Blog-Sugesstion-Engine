"use client";

import { useState } from "react";
import { api } from "../../lib/api";
import { useRouter } from "next/navigation";

export default function CreateBlogPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [useAI, setUseAI] = useState(false); // NEW
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(api.blogDetail, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content: useAI ? "" : content, // leave empty if AI should generate
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create blog");
      }

      setSuccess(true);
      setTitle("");
      setContent("");
      setTags("");
      setUseAI(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!title.trim()) {
      setError("Please enter a title first");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(api.blogGenerate, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to generate blog");
      }

      const data = await res.json();
      setContent(data.content);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto p-6 bg-white rounded shadow mt-10">
      <h1 className="text-3xl font-bold mb-6">Create a New Blog</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block font-semibold mb-1">
            Topic / Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="Enter blog title or topic"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="useAI"
            type="checkbox"
            checked={useAI}
            onChange={() => setUseAI(!useAI)}
          />
          <label htmlFor="useAI" className="text-sm">
            Don’t want to write? Let AI write it for you.
          </label>
        </div>

        {useAI && (
          <div>
            <button
              type="button"
              onClick={handleGenerate}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate Blog with AI"}
            </button>

            {content && (
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                className="w-full border border-gray-300 rounded px-3 py-2 mt-3"
                placeholder="Your AI-generated blog will appear here..."
              />
            )}
          </div>
        )}

        <div>
          <label htmlFor="tags" className="block font-semibold mb-1">
            Tags (comma separated)
          </label>
          <input
            id="tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g. React, JavaScript, WebDev"
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        {error && <p className="text-red-600">{error}</p>}
        {success && (
          <p className="text-green-600">Blog created successfully!</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-pink-600 text-white px-6 py-3 rounded hover:bg-pink-700 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Blog"}
        </button>
      </form>
    </main>
  );
}
