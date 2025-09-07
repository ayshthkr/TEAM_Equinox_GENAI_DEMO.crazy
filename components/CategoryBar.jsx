"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchArticles } from "@/lib/api";

export default function CategoryBar() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function getTags() {
      try {
        setLoading(true);
        const data = await fetchArticles({ limit: 100, skip: 0 });

        if (data?.articles) {
          const tagCounts = {};

          data.articles.forEach((article) => {
            const articleTags = article.tag || [];
            const urlCount = article.urls ? article.urls.length : 0;

            articleTags.forEach((tag) => {
              if (!tagCounts[tag]) {
                tagCounts[tag] = 0;
              }
              tagCounts[tag] += urlCount;
            });
          });

          const sortedTags = Object.entries(tagCounts)
            .sort(([, countA], [, countB]) => countB - countA)
            .map(([tag]) => tag);

          setTags(sortedTags.slice(0, 9));
        }
      } catch (error) {
        console.error("Failed to fetch tags:", error);
      } finally {
        setLoading(false);
      }
    }

    getTags();
  }, []);

  const handleTagClick = (tag) => {
    router.push(`/tag/${encodeURIComponent(tag)}`);
  };

  if (loading) {
    return <p className="text-gray-500 text-center py-3">Loading tags...</p>;
  }

  if (tags.length === 0) {
    return <p className="text-gray-500 text-center py-3">No tags available</p>;
  }

  return (
    <div className="h-14 overflow-x-auto bg-[#0D1B2A] flex items-center">
      <div className="flex gap-2 min-w-max">
        {tags.map((t, index) => (
          <span
            key={index}
            onClick={() => handleTagClick(t)}
            className="px-3 py-1.5 rounded-full 
                       bg-gradient-to-br from-[#1E2A38] to-[#0D1B2A] 
                       border border-zinc-700/60 
                       text-xs text-zinc-200 
                       hover:border-blue-500/50 hover:text-blue-400 
                       transition-colors duration-200 cursor-pointer shadow-sm whitespace-nowrap"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
