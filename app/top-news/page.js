"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import BiasBar from "@/components/BiasBar";
import { fetchArticles } from "@/lib/api";

export default function TopNewsPage() {
  const [news, setNews] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const PAGE_SIZE = 16;

  async function loadArticles(reset = false) {
    try {
      setLoading(true);
      const skip = reset ? 0 : page * PAGE_SIZE;
      const data = await fetchArticles({ limit: PAGE_SIZE + 1, skip });

      if (data?.articles?.length > 0) {
        const sorted = data.articles.sort(
          (a, b) => (b.urls?.length || 0) - (a.urls?.length || 0)
        );

        if (reset) {
          setNews(sorted.slice(0, PAGE_SIZE));
          setPage(1);
        } else {
          setNews((prev) => [...prev, ...sorted.slice(0, PAGE_SIZE)]);
          setPage((prev) => prev + 1);
        }

        setHasMore(data.articles.length > PAGE_SIZE);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Failed to load top news:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadArticles(true);
  }, []);

  if (!news.length && loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-text-secondary animate-pulse">
          Loading Top News...
        </p>
      </div>
    );
  }

  const hero = news[0];
  const trending = news.slice(1, 6);
  const rest = news.slice(6);

  const tagToArticle = {};
  for (const item of rest) {
    const tags = item.tag && Array.isArray(item.tag) ? item.tag : [];
    const primary = (tags[0] || "General").trim() || "General";
    if (!tagToArticle[primary]) tagToArticle[primary] = item;
  }

  const categories = Object.entries(tagToArticle).map(([tag, article]) => ({
    tag,
    article,
  }));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8 space-y-10">
      {/* Page Heading */}
      <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary text-center mb-6">
        📰 Top News
      </h1>

      {/* Hero */}
      {hero && (
        <div className="relative rounded-xl overflow-hidden shadow-lg">
          <img
            src={
              hero.image ||
              hero.imgs?.[0] ||
              "https://via.placeholder.com/1200x500?text=Top+News"
            }
            alt={hero.headline || hero.title || "Top story"}
            className="w-full h-[250px] sm:h-[350px] md:h-[450px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg mb-2 line-clamp-3">
              {hero.headline || hero.title}
            </h2>
            <Link
              href={`/articles/${hero._id}`}
              className="text-sm md:text-base text-accent font-medium hover:underline"
            >
              Read full story →
            </Link>
          </div>
        </div>
      )}

      {/* Trending */}
      <section>
        <h2 className="text-xl sm:text-2xl font-bold mb-4">🔥 Trending Now</h2>
        <div className="space-y-4">
          {trending.map((item, idx) => (
            <Link
              key={item._id}
              href={`/articles/${item._id}`}
              className="flex items-start gap-4 p-4 rounded-lg bg-surface border border-border hover:border-accent transition"
            >
              <span className="text-2xl font-bold text-accent">{idx + 2}</span>
              <div className="flex-1">
                <h3 className="font-semibold text-text-primary line-clamp-2">
                  {item.headline}
                </h3>
                <p className="text-xs text-text-secondary mt-1">
                  {(item.urls?.length || 0)} sources
                </p>
                <div className="mt-2">
                  <BiasBar
                    bias={{
                      left: Math.round((item.bias_left || 0) * 100),
                      center: Math.round((item.bias_center || 0) * 100),
                      right: Math.round((item.bias_right || 0) * 100),
                    }}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Category grid */}
      <section>
        <h2 className="text-xl sm:text-2xl font-bold mb-6">
          🌍 Top News by Category
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(({ tag, article }) => (
            <div
              key={tag}
              className="flex flex-col bg-surface border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition"
            >
              {/* Category name */}
              <div className="px-4 pt-3">
                <h3 className="text-base sm:text-lg font-semibold mb-2">
                  {tag}
                </h3>
              </div>

              {/* Article Card */}
              {article.imgs?.[0] ? (
                <img
                  src={article.imgs[0]}
                  alt={article.headline || "category story"}
                  className="w-full h-40 object-cover"
                />
              ) : (
                <div className="w-full h-40 bg-gray-800/30" />
              )}

              <div className="p-4 flex flex-col flex-1">
                <h4 className="font-semibold text-text-primary mb-2 line-clamp-2 min-h-[3rem]">
                  {article.headline}
                </h4>

                <p className="text-xs text-text-secondary mb-3">
                  {(article.urls?.length || 0)} sources
                </p>

                <div className="mb-3">
                  <BiasBar
                    bias={{
                      left: Math.round((article.bias_left || 0) * 100),
                      center: Math.round((article.bias_center || 0) * 100),
                      right: Math.round((article.bias_right || 0) * 100),
                    }}
                  />
                </div>

                <div className="mt-auto">
                  <Link
                    href={`/articles/${article._id}`}
                    className="text-sm font-medium text-accent hover:underline"
                  >
                    Read more →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center mt-10">
          <button
            onClick={() => loadArticles()}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow hover:shadow-md disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
}
