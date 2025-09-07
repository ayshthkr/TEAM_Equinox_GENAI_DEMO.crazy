"use client";
import { useEffect, useState } from "react";
import { fetchArticles } from "@/lib/api";
import BiasBar from "@/components/BiasBar";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL; 

export default function ForYouPage() {
  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const PAGE_SIZE = 12;

  async function loadArticles(reset = false) {
    try {
      setLoading(true);
      const skip = reset ? 0 : page * PAGE_SIZE;
      const data = await fetchArticles({ limit: PAGE_SIZE + 1, skip });

      if (data?.articles?.length > 0) {
        const clicks = JSON.parse(localStorage.getItem("clickedTags") || "{}");

        let allArticles = data.articles.map(mapArticle);

        if (Object.keys(clicks).length > 0) {
          const sortedTags = Object.entries(clicks)
            .sort((a, b) => b[1] - a[1])
            .map(([tag]) => tag);

          const topTags = sortedTags.slice(0, 3);

          allArticles.sort((a, b) => {
            const aMatch = a.tag && topTags.some((t) => a.tag.includes(t));
            const bMatch = b.tag && topTags.some((t) => b.tag.includes(t));
            return Number(bMatch) - Number(aMatch);
          });
        }

        if (reset) {
          setArticles(allArticles.slice(0, PAGE_SIZE));
          setPage(1);
        } else {
          setArticles((prev) => [
            ...prev,
            ...allArticles.slice(0, PAGE_SIZE),
          ]);
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

    const onStorageChange = (e) => {
      if (e.key === "clickedTags") loadArticles(true);
    };
    window.addEventListener("storage", onStorageChange);

    const onCustomEvent = () => loadArticles(true);
    window.addEventListener("tagsUpdated", onCustomEvent);

    return () => {
      window.removeEventListener("storage", onStorageChange);
      window.removeEventListener("tagsUpdated", onCustomEvent);
    };
  }, []);

  return (
    <section className="px-4 sm:px-6 lg:px-12 py-12">
      <div className="mb-12 text-center max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-text-primary tracking-tight">
          For You
        </h1>
        <p className="mt-3 text-text-secondary text-lg leading-relaxed">
          Personalized articles and recommendations curated from multiple
          sources based on your interests.
        </p>
      </div>

      {/* Articles */}
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

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
    </section>
  );
}

// 🔹 Normalize article
function mapArticle(a) {
  return {
    id: a._id,
    title: a.headline,
    description: a.description || "",
    image: a.imgs?.[0] || null,
    tag: a.tag || "",
    bias:
      a.bias_left || a.bias_center || a.bias_right
        ? {
            left: Math.round((a.bias_left || 0) * 100),
            center: Math.round((a.bias_center || 0) * 100),
            right: Math.round((a.bias_right || 0) * 100),
          }
        : { left: 33, center: 34, right: 33 },
  };
}

// 🔹 Card
function ArticleCard({ article }) {
  const fallbackImage = "/placeholder.jpg";

  const imageUrl = article.image
    ? article.image.startsWith("http")
      ? article.image
      : `${API_URL}/${article.image}` 
    : fallbackImage;

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group">
      <div className="overflow-hidden">
        <img
          src={imageUrl}
          alt={article.title}
          className="w-full h-48 object-cover transform group-hover:scale-105 transition duration-500"
          onError={(e) => (e.target.src = fallbackImage)}
        />
      </div>

      <div className="p-6 flex flex-col flex-1">
        <h3 className="font-semibold text-lg text-text-primary line-clamp-2 group-hover:text-accent transition-colors">
          {article.title}
        </h3>

        <p className="mt-3 text-sm text-text-secondary line-clamp-3 leading-relaxed">
          {article.description}
        </p>

        <div className="mt-5">
          <BiasBar bias={article.bias} />
        </div>

        <Link
          href={`/articles/${article.id}`}
          className="mt-auto pt-5 text-sm font-medium text-accent hover:text-accent-hover transition-colors inline-flex items-center gap-1"
        >
          Read more →
        </Link>
      </div>
    </div>
  );
}
