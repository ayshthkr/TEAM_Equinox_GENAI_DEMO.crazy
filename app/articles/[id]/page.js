"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchArticleById } from "@/lib/api";
import BiasBar from "@/components/BiasBar";

export default function ArticlePage() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);

  const fallback = "/placeholder.jpg"; 

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchArticleById(id);
        setArticle(data);
      } catch (err) {
        console.error("Failed to fetch article:", err);
      }
    }
    if (id) load();
  }, [id]);

  if (!article) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-base md:text-lg text-text-secondary animate-pulse">
          Loading article...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero Section */}
      <div className="relative w-full h-[220px] sm:h-[280px] md:h-[380px] lg:h-[500px] rounded-xl overflow-hidden shadow-lg">
        <img
          src={article.imgs?.[0] || fallback} 
          alt={article.headline || "Article image"}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/60 to-transparent" />
        <div className="relative z-10 p-4 sm:p-6 md:p-10 flex flex-col justify-end h-full">
          <h1 className="text-xl sm:text-2xl md:text-4xl font-extrabold text-text-primary leading-tight drop-shadow-md line-clamp-3">
            {article.headline}
          </h1>
        </div>
      </div>

      <div className="px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10">
        {/* Bias Bar */}
        <div className="mb-6 sm:mb-8 md:mb-10">
          <h2 className="text-base sm:text-lg font-semibold text-text-secondary mb-2 sm:mb-3">
            Media Bias Distribution
          </h2>
          <BiasBar
            bias={{
              left: Math.round((article.bias_left || 0) * 100),
              center: Math.round((article.bias_center || 0) * 100),
              right: Math.round((article.bias_right || 0) * 100),
            }}
          />
        </div>

        {/* Summary */}
        <div className="mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-3 sm:mb-4">
            Summary
          </h2>
          <div className="bg-surface border border-border rounded-xl p-4 sm:p-6 md:p-8 shadow-sm">
            <p className="text-base sm:text-lg md:text-xl leading-relaxed text-text-primary">
              {article.summary || "No summary available."}
            </p>
          </div>
        </div>

        {/* External Sources */}
        {article.urls?.length > 0 && (
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-4 sm:mb-6">
              Read More from Trusted Sources
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {article.urls.map((link, i) => (
                <a
                  key={i}
                  href={link}
                  target="_blank"
                  rel="noreferrer"
                  className="block bg-surface border border-border rounded-lg p-3 sm:p-4 shadow-sm hover:shadow-md transition hover:border-accent"
                >
                  <span className="text-accent font-medium text-base sm:text-lg">
                    {new URL(link).hostname.replace("www.", "")}
                  </span>
                  <p className="text-xs sm:text-sm text-text-secondary truncate">
                    {link}
                  </p>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
