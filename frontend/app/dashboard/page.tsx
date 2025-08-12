// DashboardPage.tsx
"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import Footer from "../components/Footer";
import { api } from "../lib/api";

interface Blog {
  id: string;
  title: string;
  content: string;
  tags: string[];
  viewCount: number;
  status: string;
  coverImageUrl?: string;
  createdAt: string;
  updatedAt: string;
  author: {
    email: string;
  };
}

export default function DashboardPage() {
  const [suggestedBlogs, setSuggestedBlogs] = useState<Blog[]>([]);
  const [popularBlogs, setPopularBlogs] = useState<Blog[]>([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        // Suggested
        const resSuggestions = await fetch(api.suggestions, {
          method: "GET",
          credentials: "include",
        });
        if (resSuggestions.ok) {
          const data = await resSuggestions.json();
          setSuggestedBlogs(data.suggestions);
        }

        // Popular
        const resPopular = await fetch(`${api.suggestions}/popular`, {
          method: "GET",
        });
        if (resPopular.ok) {
          const data = await resPopular.json();
          setPopularBlogs(data.blogs);
        }
      } catch (err) {
        console.error("Error fetching blogs:", err);
      }
    };

    fetchBlogs();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow bg-gray-950 text-white">
        {/* Suggested blogs only if available */}
        {suggestedBlogs.length > 0 && (
          <HeroSection blogs={suggestedBlogs} suggestionType="personalized" />
        )}

        {/* Always show popular */}
        <HeroSection blogs={popularBlogs} suggestionType="popular" />
      </main>

      <Footer />
    </div>
  );
}
