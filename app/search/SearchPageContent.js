"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import NewsCard from "@/components/NewsCard";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

export default function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) {
      setArticles([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/article/search`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }), // backend expects { query }
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`API ${res.status}: ${errText}`);
        }

        const data = await res.json();
        const list = Array.isArray(data) ? data : [];

        if (!cancelled) setArticles(list);
      } catch (err) {
        console.error("Search failed:", err);
        if (!cancelled) setArticles([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [query]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 px-4 sm:px-6 lg:px-8">
      {/* Left content */}
      <div className="flex-1">
        <h1 className="text-2xl sm:text-3xl font-bold mb-5">
          {`Results for "${query}"`}
        </h1>

        {loading && <p className="text-gray-500">Loading...</p>}
        {!loading && articles.length === 0 && query && (
          <p className="text-gray-500">No results found.</p>
        )}

        {/* Grid of NewsCards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {articles.map((a, i) => (
            <NewsCard
              key={a._id || a.id || i}
              news={{
                id: a._id || a.id,
                title: a.headline || a.title || "Untitled",
                url:
                  (a.urls && a.urls.length > 0 && a.urls[0]) ||
                  a.url ||
                  `${API_BASE}/article/${a._id || a.id}`,
                image:
                  (a.imgs && a.imgs.length > 0 && a.imgs[0]) ||
                  a.image ||
                  "/placeholder.jpg",
                sources: a.sources || (a.urls ? a.urls.length : 0) || 0,
                bias:
                  a.bias_left || a.bias_center || a.bias_right
                    ? {
                        left: Math.round((a.bias_left || 0) * 100),
                        center: Math.round((a.bias_center || 0) * 100),
                        right: Math.round((a.bias_right || 0) * 100),
                      }
                    : a.bias || null,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
