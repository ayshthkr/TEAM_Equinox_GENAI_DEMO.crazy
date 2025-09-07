"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchArticles } from "@/lib/api";
import BiasBar from "@/components/BiasBar";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

export default function CategoryPage() {
  const [articles, setArticles] = useState([]);
  const [leftBlindspots, setLeftBlindspots] = useState([]);
  const [rightBlindspots, setRightBlindspots] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const limit = 24;

  const [seenIds, setSeenIds] = useState(new Set());

  useEffect(() => {
    async function loadArticles() {
      try {
        setLoading(true);

        const data = await fetchArticles({ limit, skip: (page - 1) * limit });
        if (!data?.articles?.length) return;

        const mapped = data.articles.map((a) => ({
          id: a._id,
          title: a.headline,
          description: a.description || "",
          image: a.imgs?.[0] || null,
          bias: {
            left: Math.round((a.bias_left || 0) * 100),
            center: Math.round((a.bias_center || 0) * 100),
            right: Math.round((a.bias_right || 0) * 100),
          },
        }));

        const fresh = mapped.filter((a) => !seenIds.has(a.id));
        if (!fresh.length) return;

        setSeenIds((prev) => new Set([...prev, ...fresh.map((a) => a.id)]));

        const updated = [...articles, ...fresh];
        setArticles(updated);

        const left = updated.filter((a) => a.bias.left > a.bias.right);
        const right = updated.filter((a) => a.bias.right > a.bias.left);

        const minLength = Math.min(left.length, right.length);
        setLeftBlindspots(left.slice(0, minLength));
        setRightBlindspots(right.slice(0, minLength));
      } catch (err) {
        console.error("Failed to fetch blindspot articles:", err);
      } finally {
        setLoading(false);
      }
    }

    loadArticles();
  }, [page]);

  const rows = leftBlindspots.length;

  return (
    <section className="px-4 sm:px-6 lg:px-12 py-10 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary">
            Blindspot
          </h1>
          <p className="mt-2 text-text-secondary max-w-2xl mx-auto">
            Stories that receive significantly less coverage from one side of
            the political spectrum.
          </p>
        </div>

        {/* Column Titles */}
        <div className="grid grid-cols-2 gap-8 items-end mb-6">
          <div>
            <h2 className="text-lg font-semibold text-red-600">
              Low Coverage from Right Sources
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              {leftBlindspots.length} showing
            </p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-blue-600">
              Low Coverage from Left Sources
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              {rightBlindspots.length} showing
            </p>
          </div>
        </div>

        {/* Paired Rows */}
        <div className="space-y-6">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="grid md:grid-cols-2 gap-6 items-stretch">
              <ArticleCard article={leftBlindspots[i]} side="left" />
              <ArticleCard article={rightBlindspots[i]} side="right" />
            </div>
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-10">
          {!loading ? (
            <button
              onClick={() => setPage((p) => p + 1)}
              className="px-6 py-2 cursor-pointer bg-blue-600 hover:bg-blue-600 text-white font-semibold rounded-lg shadow transition"
            >
              Load More
            </button>
          ) : (
            <p className="text-text-secondary">Loading...</p>
          )}
        </div>
      </div>
    </section>
  );
}

function ArticleCard({ article, side }) {
  if (!article) return null;

  const accent = side === "left" ? "text-red-600" : "text-blue-600";

  return (
    <article className="bg-surface rounded-xl shadow-sm hover:shadow-md transition overflow-hidden flex flex-col h-full">
      <img
        src={
          article.image
            ? article.image.startsWith("http")
              ? article.image
              : `${API_BASE}/${article.image}`
            : "/placeholder.jpg"
        }
        alt={article.title}
        className="w-full h-56 object-cover"
      />

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-base md:text-lg text-text-primary mb-2 line-clamp-2">
          {article.title}
        </h3>

        <p className="text-sm text-text-secondary mb-2 line-clamp-3">
          {article.description}
        </p>

        <BiasBar bias={article.bias} />

        <div className="mt-3 text-right">
          <Link
            href={`/articles/${article.id}`}
            className={`text-sm font-medium ${accent} hover:opacity-90`}
          >
            Read more →
          </Link>
        </div>
      </div>
    </article>
  );
}
