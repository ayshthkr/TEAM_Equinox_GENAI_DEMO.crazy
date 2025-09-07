"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchArticles } from "@/lib/api";
import BiasBar from "@/components/BiasBar";
import Link from "next/link";

export default function TagPage() {
  const params = useParams();
  const tag = decodeURIComponent(params.id);

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadArticles() {
      try {
        setLoading(true);
        const data = await fetchArticles({ limit: 100, skip: 0 });
        const filtered = data.articles.filter(
          (article) => article.tag && article.tag.includes(tag)
        );
        setArticles(filtered);

        const clicks = JSON.parse(localStorage.getItem("clickedTags") || "{}");

        clicks[tag] = (clicks[tag] || 0) + 1;

        localStorage.setItem("clickedTags", JSON.stringify(clicks));

        window.dispatchEvent(new Event("tagsUpdated"));
      } catch (error) {
        console.error("Error loading articles:", error);
      } finally {
        setLoading(false);
      }
    }

    if (tag) {
      loadArticles();
    }
  }, [tag]);

  if (loading) {
    return <p className="text-center py-5">Loading articles...</p>;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-6">News about "{tag}"</h1>
      {articles.length === 0 ? (
        <p className="text-center text-gray-500">
          No articles found for this topic.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <ArticleCard key={article._id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}

function ArticleCard({ article }) {
  const fallback = "/placeholder.jpg";

  return (
    <article className="bg-surface border border-border rounded-lg overflow-hidden hover:border-accent transition flex flex-col h-full">
      {article.imgs?.[0] ? (
        <img
          src={article.imgs[0]}
          alt={article.headline}
          className="w-full h-40 object-cover"
        />
      ) : (
        <img
          src={fallback}
          alt="Placeholder"
          className="w-full h-40 object-cover"
        />
      )}

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold leading-snug text-text-primary line-clamp-2 min-h-[3rem]">
          {article.headline}
        </h3>
        <p className="text-xs text-text-secondary mt-1">
          {article.sources || 0} sources
        </p>
        <BiasBar
          bias={
            article.bias_left || article.bias_center || article.bias_right
              ? {
                  left: Math.round((article.bias_left || 0) * 100),
                  center: Math.round((article.bias_center || 0) * 100),
                  right: Math.round((article.bias_right || 0) * 100),
                }
              : { left: 33, center: 34, right: 33 }
          }
        />
        <Link
          href={`/articles/${article._id}`}
          className="inline-block mt-auto text-sm text-accent hover:text-accent-hover hover:underline"
        >
          Read more →
        </Link>
      </div>
    </article>
  );
}
