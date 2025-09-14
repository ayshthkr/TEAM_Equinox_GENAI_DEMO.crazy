// src/api/articles.js
// Axios API client and fetchArticles/searchArticles implementation
import axios from 'axios';

// Prefer Expo public env var. Configure in app config or your shell:
// EXPO_PUBLIC_API_BASE_URL=https://your-api.example.com
const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://your-api.example.com';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// POST /articles
// params: { tags?: string[], limit?: number, skip?: number }
export async function fetchArticles({ tags, limit = 20, skip = 0 } = {}) {
  try {
    const payload = {
      limit,
      skip,
      ...(Array.isArray(tags) && tags.length > 0 ? { tags } : {}),
    };

    const res = await api.post('/articles', payload);

    if (!res || typeof res.data !== 'object') {
      throw new Error('Invalid response from server');
    }

    const { count, articles } = res.data;

    if (!Array.isArray(articles)) {
      throw new Error('Malformed API response: expected { articles: [] }');
    }

    return { count: typeof count === 'number' ? count : articles.length, articles };
  } catch (err) {
    const status = err?.response?.status;
    const message = err?.response?.data?.message || err?.message || 'Unknown error';
    const error = new Error(`Failed to fetch articles${status ? ` (HTTP ${status})` : ''}: ${message}`);
    error.status = status;
    error.cause = err;
    throw error;
  }
}

// POST /article/search
// body: { query: string }
// returns: { articles: [...] , count?: number } OR plain array
export async function searchArticles(query) {
  try {
    const q = typeof query === 'string' ? query.trim() : '';
    if (!q) return { count: 0, articles: [] };

    const res = await api.post('/article/search', { query: q });
    if (!res) throw new Error('No response from server');

    let articles;
    let count;
    if (Array.isArray(res.data)) {
      articles = res.data;
      count = res.data.length;
    } else if (res.data && typeof res.data === 'object') {
      articles = Array.isArray(res.data.articles) ? res.data.articles : [];
      count = typeof res.data.count === 'number' ? res.data.count : articles.length;
    } else {
      throw new Error('Malformed API response for search');
    }

    return { count, articles };
  } catch (err) {
    const status = err?.response?.status;
    const message = err?.response?.data?.message || err?.message || 'Unknown error';
    const error = new Error(`Failed to search articles${status ? ` (HTTP ${status})` : ''}: ${message}`);
    error.status = status;
    error.cause = err;
    throw error;
  }
}

export default api;
