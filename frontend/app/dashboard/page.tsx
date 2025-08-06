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
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [type, setType] = useState<string>("");

  useEffect(() => {
    const fetchSuggestedBlogs = async () => {
      try {
        const res = await fetch(api.suggestions, {
          method: "GET",
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setBlogs(data.suggestions);
          setType(data.type);
        } else {
          console.error("Failed to fetch suggestions");
        }
      } catch (err) {
        console.error("Error fetching suggestions", err);
      }
    };

    fetchSuggestedBlogs();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* 👇 main section takes remaining space */}
      <main className="flex-grow bg-gray-950 text-white">
        <HeroSection blogs={blogs} suggestionType={type} />
      </main>

      <Footer />
    </div>
  );
}
