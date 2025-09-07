"use client";

import { useEffect, useState } from "react";
import CategoryBar from "@/components/CategoryBar";
import FeaturedNews from "@/components/FeaturedNews";
import NewsCard from "@/components/NewsCard";
import MarketDashboard from "@/components/MarketDashboard";
import { fetchArticles } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

export default function HomePage() {
  const [featured, setFeatured] = useState(null);
  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const PAGE_SIZE = 12;
  const fallback = "/placeholder.jpg"; 

  async function loadArticles(reset = false) {
    try {
      setLoading(true);
      const skip = reset ? 0 : page * PAGE_SIZE;
      const data = await fetchArticles({ limit: PAGE_SIZE + 1, skip });

      if (data?.articles?.length > 0) {
        if (reset) {
          setFeatured(data.articles[0]);
          setArticles(data.articles.slice(1));
          setPage(1);
        } else {
          setArticles((prev) => {
            const newOnes = data.articles.filter(
              (a) => !prev.some((p) => p._id === a._id)
            );
            return [...prev, ...newOnes];
          });
          setPage((prev) => prev + 1);
        }
        setHasMore(data.articles.length >= PAGE_SIZE);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Failed to fetch articles:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadArticles(true);
  }, []);

  return (
    <div className="flex flex-col lg:flex-row gap-6 px-4 sm:px-6 lg:px-8">
      {/* Left content */}
      <div className="flex-1">
        <CategoryBar />
        <h1 className="text-2xl sm:text-3xl font-bold mt-2 mb-5">
          Daily Briefing
        </h1>

        {/* Featured News */}
        <div className="mb-8">
          {featured ? (
            <FeaturedNews article={featured} />
          ) : (
            <p className="text-gray-500">Loading featured news...</p>
          )}
        </div>

        {/* Grid of NewsCards */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {articles.map((a, i) => (
            <NewsCard
              key={a._id || i}
              news={{
                id: a._id,
                title: a.headline,
                url: a.url || `${API_BASE}/article/${a._id}`,
                image: a.imgs?.[0] || fallback,
                sources: a.sources || 0,
                bias:
                  a.bias_left || a.bias_center || a.bias_right
                    ? {
                        left: Math.round((a.bias_left || 0) * 100),
                        center: Math.round((a.bias_center || 0) * 100),
                        right: Math.round((a.bias_right || 0) * 100),
                      }
                    : null,
              }}
              className={i === 2 ? "lg:col-span-2 lg:row-span-2" : ""}
            />
          ))}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => loadArticles()}
              disabled={loading}
              className="px-6 py-2 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow hover:shadow-md disabled:opacity-50"
            >
              {loading ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
      </div>

      {/* Right side: Market Dashboard */}
      {featured && !loading && (
        <aside className="hidden lg:block w-full lg:w-[430px] lg:sticky lg:top-20 lg:h-[calc(100vh-7rem)]">
          <MarketDashboard />
        </aside>
      )}
    </div>
  );
}
