// HeroSection.tsx
import BlogCard from "./BlogCard";

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

interface HeroSectionProps {
  blogs: Blog[];
  suggestionType?: string;
}

export default function HeroSection({
  blogs,
  suggestionType,
}: HeroSectionProps) {
  const validBlogs = blogs.filter(
    (blog) =>
      blog && blog.id && blog.title && blog.content && Array.isArray(blog.tags)
  );

  const heading =
    suggestionType === "personalized"
      ? "Suggested for You"
      : suggestionType === "popular"
      ? "Popular Blogs"
      : "Latest Blogs";

  const handleCardClick = (id: string) => {
    console.log("Blog Id is...", id);
  };

  return (
    <section className="p-8">
      <h2 className="text-3xl font-bold mb-6">{heading}</h2>

      {validBlogs.length === 0 ? (
        <p className="text-gray-400">No blogs found.</p>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {validBlogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} onClick={handleCardClick} />
          ))}
        </div>
      )}
    </section>
  );
}
