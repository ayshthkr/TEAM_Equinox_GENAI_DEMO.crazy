from datetime import datetime, timedelta, timezone
from pymongo import MongoClient
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np
import json
import ast
import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.metrics import pairwise_distances_argmin_min
from sklearn.preprocessing import normalize
from sklearn.cluster import AgglomerativeClustering
from sklearn.metrics.pairwise import cosine_distances
from sklearn.metrics.pairwise import cosine_similarity
from pprint import pprint
import pandas as pd
import google.generativeai as genai
import time
import re
import itertools
#gemini cycle
GEMINI_KEYS = [
    "xxx",
    "xxx",
  "xxx",
    "xxx",
    "xxx"

    
]
# Create an infinite cycle iterator over API keys
key_cycle = itertools.cycle(GEMINI_KEYS)

# Function to set next API key
def set_next_key():
    key = next(key_cycle)
    genai.configure(api_key=key)
    print(f"🔑 Using API Key: {key[:8]}...")  # partial display for debugging
    return key





# fetch 24- hours docs 




def fetch_recent_docs(
    mongo_uri="xxx",
    db_name="mydb",
    hours=24
):
    client = MongoClient( mongo_uri,
    )
    db = client[db_name]
    collection = db["scraped_articles"]

    print("Working")
    # Calculate cutoff time
    cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)

    # Fetch docs with createdAt >= cutoff
    docs = list(collection.find(
       
    ))
    docs = list(collection.find())
    recent_docs = [
        d for d in docs
        if datetime.fromisoformat(d["createdAt"]) >= cutoff
    ]
    client.close()
    return recent_docs

# clustering fucntionss


def cluster_docs_by_similarity(df, threshold=0.5, top_n_words=50):
    """
    Cluster documents based on cosine similarity of embeddings.
    Returns list of clusters with grouped URLs + truncated content.
    """

    # Convert embeddings to numpy array
    embeddings = np.vstack(df['embedding'].apply(eval).values)  # assuming stored as stringified list

    # Compute similarity matrix
    sim_matrix = cosine_similarity(embeddings)

    visited = set()
    clusters = []

    for i in range(len(df)):
        if i in visited:
            continue
        cluster = [i]
        visited.add(i)
        for j in range(i + 1, len(df)):
            if sim_matrix[i, j] >= threshold and j not in visited:
                cluster.append(j)
                visited.add(j)

        if len(cluster) > 1:  # keep only clusters with at least 2 docs
            cluster_docs = []
            for idx in cluster:
                content = df.iloc[idx].get("content", "")
                if not isinstance(content, str):  # handle NaN/float
                    content = ""
                cluster_docs.append({
                    "url": df.iloc[idx].get("url", ""),
                    "content": content + ("..." if len(content) > top_n_words else "")
                })
            clusters.append(cluster_docs)

    # Pretty print
    for c_idx, cluster in enumerate(clusters, 1):
        print(f"\n🔗 Cluster {c_idx} (size={len(cluster)}):")
        for doc in cluster:
            print(f" - {doc['url']} | {doc['content']}")

    return clusters


def cluster_docs_by_similarity_df(df, threshold=0.7, top_n_words=50):
    """
    Cluster documents based on cosine similarity of embeddings.

    Args:
        df (pd.DataFrame): Must contain 'embedding', 'url', and 'content'.
        threshold (float): Cosine similarity threshold.
        top_n_words (int): Number of characters of content to keep for preview.

    Returns:
        clusters (list of dicts): Each cluster has URLs, contents, and similarity info.
    """
    def safe_eval(x):
        if isinstance(x, str):
            return eval(x)
        elif isinstance(x, list):
            return x
        else:
            return []
    embeddings = np.vstack(df["embedding"].apply(safe_eval).values)
    sim_matrix = cosine_similarity(embeddings)

    visited = set()
    clusters = []

    for i in range(len(df)):
        if i in visited:
            continue
        cluster = []
        for j in range(len(df)):
            if sim_matrix[i, j] >= threshold:
                visited.add(j)
                cluster.append({
                    "url": df.iloc[j].get("url", ""),
                    "content": str(df.iloc[j].get("content", "")),
                    "similarity_with_first": float(sim_matrix[i, j])
                })
        if cluster:
            clusters.append({"cluster_id": len(clusters) + 1, "docs": cluster})

    return clusters

def cluster_content():
    df_clusters = pd.read_csv("clusters.csv")
    print(df_clusters.head())
    # pd.set_option("display.max_colwidth", None)  # show full text in cells
    # Group by cluster
    cluster_groups = (
        df_clusters.groupby("cluster_id")["content"]
        .apply(lambda x: " ".join(str(v) for v in x if pd.notna(v)))
        .reset_index()
    )
    return cluster_docs_by_similarity_df


def _safe_json_loads(s):
    """Safely parse JSON, fallback to wrapping as list of strings."""
    try:
        parsed = json.loads(s)
        if isinstance(parsed, list):
            return [str(x).strip() for x in parsed if x and isinstance(x, str)]
        return [str(parsed).strip()]
    except:
        return [s.strip()]

def _clean_json_block(text):
    """Remove Markdown fences like ```json ... ``` if present."""
    return re.sub(r"^```(?:json)?|```$", "", text.strip(), flags=re.MULTILINE).strip()

def _generate_headlines_for_cluster(content, retries=3):
    prompt = f"""
You are a search query/headline generator.

Task:
- Input: multiple article snippets from one cluster.
- Output: A JSON list of 1–3 concise, meaningful headlines (strings only).
- Each headline should be short, keyword-rich, and specific (not generic keywords).
- No dicts, no metadata, no explanations — only plain strings in a JSON list.
- If content empty → [].

Content:
{content}
"""
    for _ in range(retries):
        try:
            model = genai.GenerativeModel("gemini-2.0-flash-lite")
            response = model.generate_content(prompt)
            clean = _clean_json_block(response.text)
            parsed = _safe_json_loads(clean)
            return parsed
        except Exception as e:
            print(f"⚠️ Error: {e}, rotating key...")
            set_next_key()
            time.sleep(5)
    return []

def _deduplicate_and_merge(headlines, retries=3):
    """Deduplicate and merge headlines across clusters."""
    if not headlines:
        return []
    
    unique_headlines = sorted(set(h.strip() for h in headlines if h and isinstance(h, str)))
    
    merge_prompt = f"""
You are a headline deduplication and merging assistant.

Task:
- Input: candidate headlines.
- Merge overlapping/redundant ones into clearer, specific headlines.
- Keep distinct topics separate.
- Output: A JSON list of plain strings (headlines only).
- No dicts, no metadata, no explanations — just headlines.

Headlines:
{json.dumps(unique_headlines, ensure_ascii=False)}
"""
    for _ in range(retries):
        try:
            model = genai.GenerativeModel("gemini-2.0-flash-lite")
            response = model.generate_content(merge_prompt)
            clean = _clean_json_block(response.text)
            parsed = _safe_json_loads(clean)
            return parsed
        except Exception as e:
            print(f"⚠️ Merge error: {e}, rotating key...")
            set_next_key()
            time.sleep(5)
    return unique_headlines

def process_and_merge_headlines(cluster_groups, save_prefix="cluster_search_terms"):
    search_terms = []
    
    # Stage 1 → generate raw headlines
    for _, row in cluster_groups.iterrows():
        headlines = _generate_headlines_for_cluster(row["content"])
        print(f"Cluster {row['cluster_id']} → {headlines}")
        search_terms.append({"cluster_id": row["cluster_id"], 
                             "search_terms": json.dumps(headlines, ensure_ascii=False)})
        time.sleep(2)

    df_search = pd.DataFrame(search_terms)
    df_search.to_csv(f"{save_prefix}_raw.csv", index=False)
    print(f"✅ Saved raw headlines to {save_prefix}_raw.csv")

    # Stage 2 → merge across clusters
    all_headlines = []
    for val in df_search["search_terms"].dropna():
        parsed = json.loads(val) if isinstance(val, str) else val
        all_headlines.extend(parsed if isinstance(parsed, list) else [str(parsed)])

    merged = _deduplicate_and_merge(all_headlines)
    print("🔗 Final Merged Headlines:", merged)

    df_final = pd.DataFrame([{"final_headlines": json.dumps(merged, ensure_ascii=False)}])
    df_final.to_csv(f"{save_prefix}_final.csv", index=False)
    print(f"✅ Saved merged search terms to {save_prefix}_final.csv")

    return df_search, df_final



from exa_py import Exa


import pprint

def fetch_and_save_exa(headlines, 
                       mongo_uri="xxx",
                       db_name="mydb",
                       collection_name="exa_headlines",
                       api_key="037d0186-123a-47a2-b1ff-81a9135a29ee",
                       limit=5):
    """
    Fetch Exa content for a list of headlines and save all results to a single MongoDB collection.

    Args:
        headlines (list): list of headline strings
        mongo_uri (str): MongoDB URI
        db_name (str): database name
        collection_name (str): constant collection name to save all headlines
        api_key (str): Exa API key
        limit (int): number of results per headline
    """
    # Connect to MongoDB
    client = MongoClient(mongo_uri)
    db = client[db_name]
    collection = db[collection_name]

    # Initialize Exa
    exa = Exa(api_key=api_key)

    def serialize(obj):
        """Recursive serialization to dicts/lists for non-JSON objects"""
        if isinstance(obj, list):
            return [serialize(i) for i in obj]
        elif hasattr(obj, "__dict__"):
            return {k: serialize(v) for k, v in obj.__dict__.items()}
        else:
            return obj

    now = datetime.utcnow()
    start_dt = now - timedelta(days=1)
    start_date = start_dt.strftime("%Y-%m-%dT%H:%M:%S.000Z")
    end_date = now.strftime("%Y-%m-%dT%H:%M:%S.000Z")

    for head in headlines:
        print(f"🔍 Fetching Exa content for: {head}")
        try:
            result = exa.search_and_contents(
                head,
                text=True,
                type="fast",
                start_published_date=start_date,
                end_published_date=end_date,
                context=True,
                num_results=limit
            )
            serialized = serialize(result)
            # pprint.pprint(serialized)

            # Save to constant MongoDB collection
            a= collection.insert_one({
                "headline": head,
                "results": serialized,
                "fetched_at": datetime.utcnow()
            })
            # print(a)
            # print(f"Inserted document ID: {a.inserted_id}")
            print(f"✅ Saved results to MongoDB collection: {collection_name}\n")

        except Exception as e:
            print(f"⚠️ Error fetching/saving headline '{head}': {e}")

def pipeline_process(
    mongo_uri="xxx",
    db_name="mydb",
    scraped_collection="scraped_articles",
    exa_collection="exa_headlines",
    hours=24,
    similarity_threshold=0.8,
    headline_limit=5,
    top_news=100
):
    """
    Complete pipeline:
    1. Fetch recent docs from MongoDB.
    2. Cluster by cosine similarity.
    3. Generate cluster-level headlines using Gemini LLM.
    4. Merge headlines across clusters.
    5. Fetch Exa content for top headlines and save to constant MongoDB collection.
    """

    # --- 1. Fetch recent docs ---
    print("🔍 Fetching recent documents from MongoDB...")
    client = MongoClient(mongo_uri)
    db = client[db_name]
    coll = db[scraped_collection]

    cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)
    docs = list(coll.find())
    recent_docs = [
        d for d in docs
        if datetime.fromisoformat(d["createdAt"]) >= cutoff
    ]
    if not recent_docs:
        print("No recent documents found.")
        return

    df_docs = pd.DataFrame(recent_docs)
    print(f"✅ Fetched {len(df_docs)} recent documents."
    )
    print(df_docs.head())


    # --- 2. Cluster docs ---
    print("🔍 Clustering documents...")
    clusters = cluster_docs_by_similarity_df(df_docs, threshold=similarity_threshold)

    # Sort clusters by size (number of docs) and pick top 20
    clusters_sorted = sorted(clusters, key=lambda x: len(x["docs"]), reverse=True)[:20]

    # Prepare DataFrame for headline generation
    cluster_groups = pd.DataFrame([
        {"cluster_id": c["cluster_id"], "content": " ".join([d["content"] for d in c["docs"]])}
        for c in clusters_sorted
    ])
    print(f"Processing top {len(cluster_groups)} clusters by size:")
    print(cluster_groups.head())

    # --- 3 & 4. Generate & merge headlines ---
    print("generating headlines 🗞️🗞️🗞️")
    df_search, df_final = process_and_merge_headlines(cluster_groups)

    # --- 5. Fetch Exa content for top headlines ---
   
    final_headlines_str = df_final["final_headlines"].iloc[0]
    print(final_headlines_str)
    final_headlines_list = json.loads(final_headlines_str)[:top_news]
    print(final_headlines_list)

    
    # Fetch & save to MongoDB
    print("🔍 Fetching Exa content for top headlines...")
    fetch_and_save_exa(
        headlines=final_headlines_list,
        mongo_uri=mongo_uri,
        db_name=db_name,
        collection_name=exa_collection,
        limit=headline_limit
    )

    print("✅ Pipeline completed successfully.")
    client.close()
    return df_search, df_final

pipeline_process()