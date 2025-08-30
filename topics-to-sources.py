from datetime import datetime, timedelta, timezone
from pymongo import MongoClient
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np
import datetime
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
import itertools
#gemini cycle
GEMINI_KEYS = [
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
    embeddings = np.vstack(df["embedding"].apply(eval).values)
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

def process_and_merge_headlines(cluster_groups, save_prefix="cluster_search_terms"):
    """
    Generates raw headlines per cluster, then merges and deduplicates them.
    
    Args:
        cluster_groups (pd.DataFrame): DataFrame with columns ['cluster_id', 'content']
        save_prefix (str): prefix for CSV files
    
    Returns:
        pd.DataFrame: final merged headlines per cluster
    """
    search_terms = []

    # --- Stage 1: Generate Raw Headlines ---
    for _, row in cluster_groups.iterrows():
        set_next_key()  # rotate key for LLM

        cluster_id = row["cluster_id"]
        combined_content = row["content"]

        prompt = f"""
You are a search query/headline generator.

Task:
- Receive multiple article snippets grouped into the same cluster.
- If coherent, generate 1 concise headline summarizing the cluster.
- If mixed topics, generate multiple short headlines.
- If content is empty, return null (no dialogue).
- Headlines should be concise, keyword-rich, not full sentences.

Content:
{combined_content}

Return ONLY a comma-separated list of headlines. Nothing else.
        """

        retries = 3
        for attempt in range(retries):
            try:
                model = genai.GenerativeModel("gemini-2.0-flash-lite")
                response = model.generate_content(prompt)
                terms = response.text.strip()
                break
            except Exception as e:
                print(f"⚠️ Error with key: {e}, rotating key...")
                set_next_key()
                terms = f"ERROR: {e}"
                time.sleep(8)

        print(f"Cluster {cluster_id} → {terms}")
        search_terms.append({"cluster_id": cluster_id, "search_terms": terms})

    # Save raw headlines
    df_search = pd.DataFrame(search_terms)
    raw_csv = f"{save_prefix}_raw.csv"
    df_search.to_csv(raw_csv, index=False)
    print(f"✅ Saved raw headlines to {raw_csv}")

    # --- Stage 2: Merge & Refine Headlines ---
    all_headlines = ", ".join(df_search["search_terms"].dropna().tolist())

    merge_prompt = f"""
You are a headline deduplication and merging assistant.

Task:
- Receive candidate search headlines from multiple clusters.
- Merge overlapping/redundant headlines into single detailed headlines.
- Keep diverse topics separate.
- Return keyword-rich, comma-separated headlines ONLY.

Headlines:
{all_headlines}
    """

    retries = 3
    for attempt in range(retries):
        try:
            model = genai.GenerativeModel("gemini-2.0-flash")
            response = model.generate_content(merge_prompt)
            final_headlines = response.text.strip()
            break
        except Exception as e:
            print(f"⚠️ Error in merge step: {e}, rotating key...")
            set_next_key()
            final_headlines = f"ERROR: {e}"
            time.sleep(2)

    print("🔗 Final Merged Headlines:")
    print(final_headlines)

    # Save merged results
    df_final = pd.DataFrame([{"final_headlines": final_headlines}])
    final_csv = f"{save_prefix}_final.csv"
    df_final.to_csv(final_csv, index=False)
    print(f"✅ Saved merged search terms to {final_csv}")

    return df_search, df_final    


from exa_py import Exa
import datetime
from pymongo import MongoClient
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

    now = datetime.datetime.utcnow()
    start_dt = now - datetime.timedelta(days=1)
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
            pprint.pprint(serialized)

            # Save to constant MongoDB collection
            collection.insert_one({
                "headline": head,
                "results": serialized,
                "fetched_at": datetime.datetime.utcnow()
            })
            print(f"✅ Saved results to MongoDB collection: {collection_name}\n")

        except Exception as e:
            print(f"⚠️ Error fetching/saving headline '{head}': {e}")

def pipeline_process(
    mongo_uri="xxx",
    db_name="mydb",
    scraped_collection="scraped_articles",
    exa_collection="exa_headlines",
    hours=24,
    similarity_threshold=0.7,
    headline_limit=5,
    top_news=20
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
    client = MongoClient(mongo_uri)
    db = client[db_name]
    coll = db[scraped_collection]

    cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)
    docs = list(coll.find())
    recent_docs = [
        d for d in docs if datetime.fromisoformat(d.get("createdAt")) >= cutoff
    ]
    if not recent_docs:
        print("No recent documents found.")
        return

    df_docs = pd.DataFrame(recent_docs)

    # --- 2. Cluster docs ---
    clusters = cluster_docs_by_similarity_df(df_docs, threshold=similarity_threshold)

    # Prepare DataFrame for headline generation
    cluster_groups = pd.DataFrame([
        {"cluster_id": c["cluster_id"], "content": " ".join([d["content"] for d in c["docs"]])}
        for c in clusters
    ])

    # --- 3 & 4. Generate & merge headlines ---
    df_search, df_final = process_and_merge_headlines(cluster_groups)

    # --- 5. Fetch Exa content for top headlines ---
    final_headlines_list = [h.strip() for h in df_final["final_headlines"].iloc[0].split(",") if h.strip()][:top_news]
    
    # Fetch & save to MongoDB
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
