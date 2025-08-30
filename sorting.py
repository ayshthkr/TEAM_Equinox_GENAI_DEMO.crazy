df_back = pd.read_csv("recent_docs.csv")
clusters = cluster_docs_by_similarity(df_back, threshold=0.8, top_n_words=80)

# Convert to DataFrame
df_clusters = pd.DataFrame(clusters)

# Count docs per cluster and sort
df_clusters["cluster_size"] = df_clusters["docs"].apply(len)
df_clusters = df_clusters.sort_values(by="cluster_size", ascending=False)

# Save to CSV
df_clusters.to_csv("clusters.csv", index=False)

print(f"✅ Saved {len(df_clusters)} clusters into clusters.csv (sorted by size)")