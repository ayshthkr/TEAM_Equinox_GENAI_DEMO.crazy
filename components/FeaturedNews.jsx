"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchArticles } from "../lib/api";
import BiasBar from "./BiasBar";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;
const fallback = "/placeholder.jpg";

export default function FeaturedNews() {
  const [featured, setFeatured] = useState(null);
  const [blindspot, setBlindspot] = useState(null);
  const router = useRouter();

  const getImage = (img) => {
    if (!img || typeof img !== "string") return fallback;
    const clean = img.trim().toLowerCase();
    if (clean.startsWith("http")) {
      return img.trim();
    }
    return `${API_BASE}/${img}`;
  };

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchArticles({ limit: 20, skip: 0 });

        if (data?.articles?.length > 0) {
          const a = data.articles[0]; 
          setFeatured({
            id: a._id,
            url: a.url || null,
            title: a.headline,
            image: a.imgs?.[0] || null,
            description: a.description || "",
            bias:
              a.bias_left || a.bias_center || a.bias_right
                ? {
                    left: Math.round((a.bias_left || 0) * 100),
                    center: Math.round((a.bias_center || 0) * 100),
                    right: Math.round((a.bias_right || 0) * 100),
                  }
                : null,
          });
        }

        let politicsArticle = data.articles.find(
          (art) =>
            art.category?.toLowerCase() === "politics" ||
            art.tags?.some((t) => t.toLowerCase() === "politics")
        );

        if (!politicsArticle && data?.articles?.length > 1) {
          politicsArticle = data.articles[1]; 
        }

        if (politicsArticle) {
          setBlindspot({
            id: politicsArticle._id,
            url: politicsArticle.url || null,
            title: politicsArticle.headline,
            image: politicsArticle.imgs?.[0] || null,
            description: politicsArticle.description || "",
            bias:
              politicsArticle.bias_left ||
              politicsArticle.bias_center ||
              politicsArticle.bias_right
                ? {
                    left: Math.round((politicsArticle.bias_left || 0) * 100),
                    center: Math.round((politicsArticle.bias_center || 0) * 100),
                    right: Math.round((politicsArticle.bias_right || 0) * 100),
                  }
                : null,
          });
        }
      } catch (err) {
        console.error("Failed to fetch featured/blindspot:", err);
      }
    }
    load();
  }, []);

  const handleOpen = (item) => {
    if (!item) return;
    if (item.url) {
      window.open(item.url, "_blank"); 
    } else if (item.id) {
      router.push(`/articles/${item.id}`);
    }
  };

  if (!featured) {
    return (
      <p className="text-center text-gray-500">
        Loading featured article...
      </p>
    );
  }

  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left: Featured Big Card */}
      <div
        onClick={() => handleOpen(featured)}
        className="lg:col-span-2 bg-surface border border-border rounded-xl overflow-hidden shadow-md flex flex-col h-full cursor-pointer hover:shadow-lg transition"
      >
        <img
          src={getImage(featured.image)}
          alt={featured.title || "No title"}
          className="w-full h-80 object-cover"
        />

        <div className="p-5 flex flex-col flex-1">
          <h2 className="text-xl md:text-2xl font-bold leading-snug text-text-primary">
            {featured.title || "Untitled"}
          </h2>

          <div className="mt-4">
            <BiasBar bias={featured.bias || { left: 33, center: 34, right: 33 }} />
          </div>

          <span className="inline-block mt-auto pt-5 text-accent hover:text-accent-hover underline font-medium">
            Open story →
          </span>
        </div>
      </div>

      {/* Right: Sidebar (Blindspot) */}
      <aside className="h-full">
        <div
          onClick={() => handleOpen(blindspot)}
          className="bg-surface border border-border rounded-xl overflow-hidden shadow-md flex flex-col h-full cursor-pointer hover:shadow-lg transition"
        >
          {/* Header */}
          <div className="p-5 border-b border-border">
            <h3 className="text-lg font-semibold text-text-primary">BLINDSPOT™</h3>
            <p className="text-sm text-text-secondary mt-1 leading-snug">
              Political stories disproportionately covered by one side.
            </p>
          </div>

          {/* Content Area */}
          <div className="flex flex-col flex-1">
            {blindspot?.image && (
              <img
                src={getImage(blindspot.image)}
                alt={blindspot?.title || "Blindspot"}
                className="w-full h-48 object-cover"
              />
            )}

            <div className="p-5 flex flex-col flex-1">
              <h4 className="font-semibold text-base text-text-primary leading-snug">
                {blindspot?.title || "No politics article available"}
              </h4>

              {blindspot?.description && (
                <p className="text-sm text-text-secondary mt-3 leading-relaxed">
                  {blindspot.description}
                </p>
              )}

              <div className="mt-auto pt-5">
                <BiasBar bias={blindspot?.bias || { left: 33, center: 34, right: 33 }} />
              </div>

              <span className="mt-4 text-sm text-accent hover:text-accent-hover underline">
                Open story →
              </span>
            </div>
          </div>
        </div>
      </aside>
    </section>
  );
}
