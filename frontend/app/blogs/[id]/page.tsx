import { api } from "@/app/lib/api";
import { cookies } from "next/headers";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Markdown from "react-markdown";

export const dynamic = "force-dynamic";

interface Blog {
  id: string;
  title: string;
  content: string;
  tags: string[];
  author: {
    email: string;
  };
}

async function getBlog(id: string): Promise<Blog | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const res = await fetch(`${api.blogDetail}/${id}`, {
      method: "GET",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store",
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error fetching blog:", err);
    return null;
  }
}

export default async function BlogDetailPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const blog = await getBlog(id);

  if (!blog) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-950 text-white">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center text-red-400 text-xl">
            Blog not found.
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-white">
      <Navbar />

      <main className="flex-grow px-6 py-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-sky-400 mb-4">{blog.title}</h1>
          <p className="text-sm text-gray-400 italic mb-6">
            By <span className="text-white">{blog.author.email}</span>
          </p>
          <article className="text-slate-200 leading-relaxed whitespace-pre-line text-lg mb-8">
            <Markdown>{blog.content}</Markdown> 
          </article>
          <div className="flex flex-wrap gap-2">
            {blog.tags.map((tag, idx) => (
              <span
                key={idx}
                className="bg-sky-800/30 border border-sky-600 text-sky-300 text-xs px-3 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
