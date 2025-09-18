import NewsCard from "@/components/NewsCard";
import { fetchArticles } from "@/lib/api";
import { useState,useEffect } from "react";
export default function Recommendations({ currentId, tags }) {
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(false); 

  const fallback = "/placeholder.jpg"; 
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

  useEffect(() => {
    async function load() {
      if (!tags?.length) return;
      try {
        setLoading(true);
        console.log(tags)
        const data = await fetchArticles({
            limit:200,
            skip:0,
            tags:tags

        })
        
        console.log("data",data)

        const filtered = data.articles.filter((a) => a._id !== currentId);
        setRecs(filtered);
      } catch (err) {
        console.error("Failed to fetch recommendations:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [tags, currentId]);

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse w-64 h-40 bg-blue-600/30 rounded-xl flex-shrink-0"
          />
        ))}
      </div>
    );
  }

  if (!recs.length) return null;

  return (
    <div className="mt-12">
      <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-4">
        Recommended Articles
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {recs.map((a) => (
          <div key={a._id} className="w-72 flex-shrink-0">
            <NewsCard
              news={{
                id: a._id,
                title: a.headline,
                url: a.url || `${API_BASE}/article/${a._id}`,
                image: a.imgs?.[0] || fallback,
                sources: a.imgs?.length,
                bias:
                  a.bias_left || a.bias_center || a.bias_right
                    ? {
                        left: Math.round((a.bias_left || 0) * 100),
                        center: Math.round((a.bias_center || 0) * 100),
                        right: Math.round((a.bias_right || 0) * 100),
                      }
                    : null,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
