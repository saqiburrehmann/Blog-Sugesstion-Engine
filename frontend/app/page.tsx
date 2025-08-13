"use client";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-pink-400 via-red-400 to-yellow-400 p-10">
      <h1 className="text-5xl font-extrabold text-white mb-8 drop-shadow-lg">
        ✨ Discover, Create, and Share Your Blogs ✨
      </h1>
      <button
        onClick={() => (window.location.href = "/dashboard")}
        className="bg-pink-500 text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:bg-pink-600 transition cursor-pointer"
      >
        Go to Dashboard
      </button>
    </div>
  );
}
