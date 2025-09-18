from datetime import datetime, timedelta, timezone
from pymongo import MongoClient
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np
from keybert import KeyBERT
import ast
import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.metrics import pairwise_distances_argmin_min
from sklearn.preprocessing import normalize
from sklearn.cluster import AgglomerativeClustering
from sklearn.metrics.pairwise import cosine_distances
from sklearn.metrics.pairwise import cosine_similarity
# pd.set_option("display.max_colwidth", None)  # show full text in cells
# pd.set_option("display.max_columns", None)  # show all columns
# pd.set_option("display.max_rows", None)     # show all rows if needed
pd.set_option("display.max_colwidth", None)  # show full text in cells


def cluster_docs(df, num_clusters=5):
    """
    Cluster documents based on their embeddings.
    df must have a column 'embedding' with list/array values.
    """

    # convert string embedding to list
    if isinstance(df["embedding"].iloc[0], str):
        df["embedding"] = df["embedding"].apply(lambda x: ast.literal_eval(x))
     

    # Convert embeddings to numpy array
    X = np.vstack(df["embedding"].values)

    # Run KMeans (or any other clustering algo)
    kmeans = KMeans(n_clusters=num_clusters, random_state=42)
    df["cluster"] = kmeans.fit_predict(X)

    # Find representative doc for each cluster (closest to centroid)
    closest, _ = pairwise_distances_argmin_min(kmeans.cluster_centers_, X)
    reps = df.iloc[closest]

    return df, reps

def cluster_docs_cosine(df, num_clusters=5):
    """
    Cluster documents based on cosine similarity.
    """
    # convert string embedding to list
    if isinstance(df["embedding"].iloc[0], str):
        df["embedding"] = df["embedding"].apply(lambda x: ast.literal_eval(x))

    # Convert embeddings to numpy array
    X = np.vstack(df["embedding"].values)

    # Normalize embeddings (unit vectors)
    X_norm = normalize(X, norm='l2')

    # Run KMeans on normalized vectors (now effectively cosine similarity)
    kmeans = KMeans(n_clusters=num_clusters, random_state=42)
    df["cluster"] = kmeans.fit_predict(X_norm)

    # Find representative docs (closest to centroid)
    closest, _ = pairwise_distances_argmin_min(kmeans.cluster_centers_, X_norm, metric="euclidean")
    reps = df.iloc[closest]

    return df, reps




def cluster_docs_hierarchical(df, similarity_threshold=0.5):
    # Convert embedding strings back to arrays if needed
    if isinstance(df["embedding"].iloc[0], str):
        df["embedding"] = df["embedding"].apply(lambda x: ast.literal_eval(x))

    X = np.vstack(df["embedding"].values)

    # Cosine distance matrix
    dist_matrix = cosine_distances(X)

    # Agglomerative clustering
    clustering = AgglomerativeClustering(
        n_clusters=None,               # auto, based on distance threshold
     metric="cosine",
        linkage="average",
        distance_threshold=similarity_threshold
    )
    labels = clustering.fit_predict(dist_matrix)

    df["cluster"] = labels
    return df



import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity



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


def Bert(recent_docs):
    kw_model = KeyBERT()

    topics = []
    for _, row in df_back.iterrows():   # iterate rows properly
        text = str(row.get("title") or row.get("content") or "")
        keywords = kw_model.extract_keywords(text, top_n=5)
        topics.append({"url": row["url"], "topics": [k[0] for k in keywords]})

    for t in topics:
        print(t)

import pandas as pd


from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np

def extract_cluster_topics(df, num_words=5):
    topics = {}
    for cluster_id in df["cluster"].unique():
        cluster_texts = df[df["cluster"] == cluster_id]["content"].dropna().tolist()
        if not cluster_texts:
            continue

        # TF-IDF to get top words in this cluster
        vectorizer = TfidfVectorizer(stop_words="english", max_features=5000)
        X = vectorizer.fit_transform(cluster_texts)
        tfidf_means = np.asarray(X.mean(axis=0)).ravel()

        top_indices = tfidf_means.argsort()[-num_words:][::-1]
        top_words = [vectorizer.get_feature_names_out()[i] for i in top_indices]
        topics[cluster_id] = top_words
    return topics


if __name__ == "__main__":
    # recent_docs = fetch_recent_docs()
    # df = pd.DataFrame(recent_docs)
    # df.to_csv("recent_docs.csv", index=False, encoding="utf-8")
    # print("✅ Saved to recent_docs.csv")

   
    # Load saved docs
    df_back = pd.read_csv("recent_docs.csv")
    print(f"🔄 Loaded {len(df_back)} docs back")
    print(f"✅ Found {len(df_back)} docs from last 12 hours")

    # --- Hierarchical clustering instead of KMeans ---
    # clustered_df = cluster_docs_hierarchical(df_back, similarity_threshold=0.75)

    # print("\nClustered docs (first few):")
    # print(clustered_df[["url", "cluster"]].head())

    # # Print URLs grouped by cluster
    # for c, group in clustered_df.groupby("cluster"):
    #     print(f"\nCluster {c} ({len(group)} docs):")
    #     for u in group["url"].tolist():
    #         print("  ", u)

    # # Extract & print cluster topics
    # topics = extract_cluster_topics(clustered_df)
    # print("\nCluster topics summary:")
    # for cid, words in topics.items():
    #     print(f"Cluster {cid} → {', '.join(words)}")
    # topics from each article
    # Bert(df_back)
    # for d in recent_docs[:5]:  # preview first 5
    #     print(d.get("url"))
    
    # Cluster
    # clustered_df, reps = cluster_docs(df_back, num_clusters=20)

    # print("Clustered docs:")
    # print(clustered_df[["url", "cluster"]].head())

    # print("\nRepresentative docs for each cluster:")
    # for _, row in reps.iterrows():
    #     print(f"Cluster {row['cluster']} → {row['url']}")

    # for c, group in clustered_df.groupby("cluster"):
    #     print(f"\nCluster {c}:")
    #     print(group[[ "url"]])  # show first 5 per cluster


    # topics = extract_cluster_topics(clustered_df)
    # for cid, words in topics.items():
    #     print(f"Cluster {cid} → {', '.join(words)}")    
    # # clustered_df.to_csv("clustered_news.csv", index=False)


    # o(n2 ) approach
    df_back = pd.read_csv("recent_docs.csv")
    clusters = cluster_docs_by_similarity(df_back, threshold=0.8, top_n_words=80)

    clusters = cluster_docs_by_similarity_df(df_back, threshold=0.8, top_n_words=80)

# ✅ Save outside the function
    rows = []
    for cluster in clusters:
        cluster_id = cluster["cluster_id"]
        for doc in cluster["docs"]:
            rows.append({
                "cluster_id": cluster_id,
                "url": doc["url"],
                "content": doc["content"],
                "similarity_with_first": doc["similarity_with_first"]
            })
    df_clusters = pd.DataFrame(rows)
    # Compute cluster size by grouping
    cluster_sizes = df_clusters.groupby("cluster_id").size().reset_index(name="cluster_size")
    df_clusters = df_clusters.merge(cluster_sizes, on="cluster_id")

    # Sort clusters by size
    df_clusters = df_clusters.sort_values(by="cluster_size", ascending=False)

    # Save
    df_clusters.to_csv("clusters.csv", index=False)

    print(f"✅ Saved {len(df_clusters)} clustered docs into clusters.csv")

        
