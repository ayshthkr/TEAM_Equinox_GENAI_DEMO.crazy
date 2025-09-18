/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchArticleById } from "@/lib/api";
import BiasBar from "@/components/BiasBar";
import NewsSkeleton from "@/components/NewsSkeleton";
import Recommendations from "@/components/Recommendation";
import Link from "next/link";

function ArticleSkeleton() {
  return (
    <div className=" mx-8 animate-pulse">
      {/* Hero Skeleton */}
      <div className="relative w-full h-[220px] sm:h-[280px] md:h-[380px] lg:h-[500px] rounded-xl overflow-hidden shadow-lg bg-blue-600/30" />

      <div className="px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10">
        {/* Bias Skeleton */}
        <div className="mb-6 sm:mb-8 md:mb-10">
          <div className="h-5 w-48 bg-blue-600/30 rounded mb-3" />
          <div className="h-6 w-full bg-blue-600/30 rounded" />
        </div>

        {/* Summary Skeleton */}
        <div className="mb-8 sm:mb-10 md:mb-12">
          <div className="h-6 w-40 bg-gray-300 rounded mb-4" />
          <div className="bg-surface border border-border rounded-xl p-4 sm:p-6 md:p-8 shadow-sm">
            <div className="h-4 w-3/4 bg-blue-600/30 rounded mb-3" />
            <div className="h-4 w-5/6 bg-blue-600/30 rounded mb-3" />
            <div className="h-4 w-2/3 bg-blue-600/30 rounded" />
          </div>
        </div>

        {/* Sources Skeleton */}
        
      </div>
    </div>
  );
}

 function SourcesAndTags({ article }) {
  const [open, setOpen] = useState(false);

  const urls = article.urls || [];
  const tags = article.tag || [];

  // Helper to get hostname first letter
  const getHostInitial = (url) => {
    try {
      return new URL(url).hostname.replace("www.", "")[0].toUpperCase();
    } catch {
      return "?";
    }
  };

  return (
    <div className="space-y-3">
      {/* Sources */}
      {urls.length > 0 && (
        <div className="flex items-center relative">
          {urls.slice(0, 3).map((url, idx) => (
            <a
              key={idx}
              href={url}
              target="_blank"
              rel="noreferrer"
              className={`w-10 h-10 flex items-center justify-center rounded-full border border-border bg-surface text-sm font-semibold text-accent shadow hover:bg-accent hover:text-white transition ${
                idx !== 0 ? "-ml-3" : ""
              }`}
              title={new URL(url).hostname.replace("www.", "")}
            >
              {getHostInitial(url)}
            </a>
          ))}

          {urls.length > 3 && (
            <div className="-ml-3 relative">
              <button
                onClick={(e) => {
                  e.stopPropagation(); // prevent parent closing immediately
                  setOpen(!open);
                }}
                className="w-10 h-10 flex items-center justify-center rounded-full border border-border bg-surface text-sm font-semibold text-text-secondary shadow hover:bg-accent hover:text-white transition"
              >
                +{urls.length - 3}
              </button>

              {open && (
                <div className="absolute top-12 left-0 bg-surface border border-border rounded-lg shadow-lg p-3 w-64 z-10">
                  <h4 className="text-sm font-semibold text-text-secondary mb-2">
                    More Sources
                  </h4>
                  <ul className="space-y-2 max-h-48 overflow-y-auto" >
                    {urls.map((url, idx) => (
                      <li key={idx}>
                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="block text-sm text-accent hover:underline truncate"
                        >
                          {new URL(url).hostname.replace("www.", "")}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tags (capsule style) */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, idx) => (
      
            <Link
              href={`/tag/${tag}`}
              key={idx}
              className="px-3 py-1 rounded-full border border-border bg-surface text-xs font-medium text-text-secondary hover:bg-accent hover:text-white transition"
            >
              {tag}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ArticlePage() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);

  const fallback = "/placeholder.jpg"; 

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchArticleById(id);
        console.log(data)
        setArticle(data);
      } catch (err) {
        console.error("Failed to fetch article:", err);
      }
    }
    if (id) load();
  }, [id]);

  if (!article) {
    return (
         <ArticleSkeleton></ArticleSkeleton>
    );
  }

  return (
    <div className=" mx-auto">
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
      

      {/* sources in circle */}

     

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
        <SourcesAndTags article={article}></SourcesAndTags>
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


        <div className="">
          <Recommendations currentId={article._id} tags={article.tag}/>
        </div>

        
      </div>
    </div>
  );
}
