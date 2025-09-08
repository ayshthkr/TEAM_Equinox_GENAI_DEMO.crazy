// src/hooks/useArticles.js
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchArticles } from '../api/articles';

// Helpers (kept mostly the same as your original version)
const clamp = (v, min = 0, max = 1) => Math.max(min, Math.min(max, v));

const extractHostname = (url) => {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return null;
  }
};

const buildFaviconUrl = (hostname) =>
  hostname ? `https://www.google.com/s2/favicons?domain=${hostname}&sz=64` : undefined;

// Fallback dummy image for articles without images
const FALLBACK_IMAGE = 'https://thumbs.dreamstime.com/b/news-woodn-dice-depicting-letters-bundle-small-newspapers-leaning-left-dice-34802664.jpg';

const pickBiasLabel = (left, center, right) => {
  const entries = [
    ['left', typeof left === 'number' ? left : 0],
    ['center', typeof center === 'number' ? center : 0],
    ['right', typeof right === 'number' ? right : 0],
  ];
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][1] === 0 ? 'center' : entries[0][0];
};

export function mapApiArticle(item, index) {
  const id = item._id || `api-article-${index}`;
  const title = item.headline || 'Untitled';
  const summary = item.summary || '';
  const tags = Array.isArray(item.tag) ? item.tag : [];
  const category = tags[0] || 'General';

  const links = Array.isArray(item.urls) ? item.urls.filter(Boolean) : [];
  const firstUrl = links.length ? links[0] : null;
  const hostname = firstUrl ? extractHostname(firstUrl) : null;
  const source = hostname ? hostname.split('.')[0] : 'Unknown';
  const favicon = buildFaviconUrl(hostname);

  const sources = links
    .map((u) => extractHostname(u))
    .filter(Boolean)
    .map((h) => h.split('.')[0]);
  const uniqueSources = Array.from(new Set(sources));

  const left = item.bias_left,
    center = item.bias_center,
    right = item.bias_right;
  const bias = pickBiasLabel(left, center, right);

  const fraud =
    typeof item.fraud_score === 'number' ? clamp(item.fraud_score, 0, 1) : 0.3;
  const score = clamp(1 - fraud, 0, 1); // Higher = more credible

  const images = Array.isArray(item.imgs) ? item.imgs.filter(Boolean) : [FALLBACK_IMAGE];
  const image = images.length ? images[0] : FALLBACK_IMAGE;

  return {
    id,
    title,
    summary,
    category,
    source,
    sources: uniqueSources,
    links,
    bias,
    timestamp: new Date(item.fetched_at || Date.now()),
    url: firstUrl || undefined,
    author: undefined,
    score,
    favicon,
    image,
    images,
    originalText: summary,
  };
}

/**
 * useArticles hook
 * params: { tags?: string[], limit?: number }
 * returns: { articles, count, loading, refreshing, error, canLoadMore, loadMore, refresh }
 */
export default function useArticles({ tags = [], limit = 20 } = {}) {
  const [articles, setArticles] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false); // used for pagination / initial load
  const [refreshing, setRefreshing] = useState(false); // used for pull-to-refresh
  const [error, setError] = useState(null);

  // paging state (mutable via ref)
  const pagingRef = useRef({ limit, skip: 0 });

  // request id to ignore stale responses
  const requestIdRef = useRef(0);

  // Stable key: depends on tags only — when tags change, we reset.
  const tagKey = useMemo(() => JSON.stringify(tags || []), [tags]);

  // Core loader
  // options: { reset: boolean } => reset indicates a fresh load (skip=0)
  const load = useCallback(
    async ({ reset = false } = {}) => {
      const isCurrentlyLoading = loading || refreshing;
      // allow reset to proceed even if currently loading (we will ignore stale responses)
      if (!reset && isCurrentlyLoading) return;

      // bump request id
      const reqId = ++requestIdRef.current;

      // if reset: start refreshing UI, reset pagination to skip=0
      if (reset) {
        pagingRef.current = { limit, skip: 0 };
        setRefreshing(true);
        setError(null);
      } else {
        setLoading(true);
        setError(null);
      }

      const { limit: l, skip: s } = pagingRef.current;

      try {
        const res = await fetchArticles({ tags, limit: l, skip: s });
        // If a newer request started meanwhile, ignore this result
        if (requestIdRef.current !== reqId) {
          return;
        }

        const total = res && typeof res.count === 'number' ? res.count : 0;
        const page = Array.isArray(res.articles) ? res.articles : [];

        const mapped = page.map(mapApiArticle);

        // If skip is 0 we replace the list; otherwise append
        setArticles((prev) => (s === 0 ? mapped : [...prev, ...mapped]));
        setCount(total);
      } catch (err) {
        // only set error if this is the latest request
        if (requestIdRef.current === reqId) {
          setError(err);
        }
      } finally {
        if (requestIdRef.current === reqId) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [tags, limit, loading, refreshing]
  );

  // When tags change, reset pagination and fetch fresh results
  useEffect(() => {
    pagingRef.current = { limit, skip: 0 };
    setArticles([]);
    setCount(0);
    // start fresh load
    load({ reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagKey, limit]); // tagKey includes tags

  // initial load on mount if there are no articles
  useEffect(() => {
    if (articles.length === 0) {
      load({ reset: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canLoadMore = articles.length < count;

  const loadMore = useCallback(() => {
  if (loading || refreshing ) {
    console.log("❌ Skipping loadMore — conditions not met");
    return;
  }
  console.log("✅ loadMore triggered");
  pagingRef.current = {
    limit,
    skip: (pagingRef.current.skip || 0) + limit,
  };
  load({ reset: false });
}, [loading, refreshing, canLoadMore, limit, load]);

  const refresh = useCallback(() => {
    // reset skip and pull fresh data
    pagingRef.current = { limit, skip: 0 };
    // Clear current articles immediately to avoid duplicates / flash; UI can show loading placeholders
    setArticles([]);
    load({ reset: true });
  }, [limit, load]);

  return {
    articles,
    count,
    loading,
    refreshing,
    error,
    canLoadMore,
    loadMore,
    refresh,
  };
}
