const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

export async function fetchArticles({ limit = 30, skip = 0 ,tags}) {
  try {
    const res = await fetch(`${API_BASE}/articles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ limit, skip ,tags}),
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch articles: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("API error:", err);
    return { articles: [] };
  }
}

export async function fetchArticleById(id) {
  const res = await fetch(`${API_BASE}/articles/${id}`, {
    headers: {
      "ngrok-skip-browser-warning": "true"
    }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch article: ${res.status} ${res.statusText}`);
  }

  return res.json();
}


export async function fetchTags() {
  try {
    const res = await fetch(`${API_BASE}/api/tags`);
    if (!res.ok) {
      throw new Error("Failed to fetch tags");
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error(error);
    return { tags: [] };
  }
}
