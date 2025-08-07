"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { api } from "../lib/api";

interface Blog {
  id: string;
  title: string;
  content: string;
  tags: string[];
  author: {
    email: string;
  };
}

export default function BlogCard({
  blog,
  onClick,
}: {
  blog: Blog;
  onClick?: (id: string) => void;
}) {
  const router = useRouter();

  const handleClick = async () => {
    if (onClick) onClick(blog.id);

    try {
      await axios.post(
        api.readingHistory,
        { blogId: blog.id },
        { withCredentials: true }
      );
      console.log("📚 Reading history recorded");
    } catch (err) {
      console.error("❌ Failed to record reading history", err);
    }

    router.push(`/blogs/${blog.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer bg-gradient-to-br mt-5 from-[#1e293b] via-[#0f172a] to-[#0a0e17] border border-[#334155] rounded-xl p-6 shadow-lg hover:shadow-blue-900/50 transition duration-300 transform hover:-translate-y-1 hover:scale-[1.015] group backdrop-blur-sm bg-opacity-60"
    >
      <h3 className="text-2xl font-bold text-sky-300 group-hover:text-sky-400 transition-colors duration-200 mb-3">
        {blog.title}
      </h3>
      <p className="text-slate-300 mb-4 line-clamp-3 leading-relaxed text-sm tracking-wide">
        {blog.content}
      </p>
      <p className="text-sm text-slate-400 mb-4 italic">
        By{" "}
        <span className="font-medium text-slate-200">{blog.author.email}</span>
      </p>
      <div className="flex flex-wrap gap-2 mt-auto">
        {blog.tags.map((tag, idx) => (
          <span
            key={idx}
            className="bg-sky-800/20 border border-sky-500 text-sky-300 text-xs px-2 py-1 rounded-full hover:bg-sky-600/40 transition-colors duration-200"
          >
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
}
