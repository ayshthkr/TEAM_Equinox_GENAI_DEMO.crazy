from pprint import pprint
import pandas as pd
import google.generativeai as genai
import time
import itertools



# df_clusters = pd.read_csv("clusters.csv")
# print(df_clusters.head())
# # pd.set_option("display.max_colwidth", None)  # show full text in cells
# # Group by cluster
# cluster_groups = (
#     df_clusters.groupby("cluster_id")["content"]
#     .apply(lambda x: " ".join(str(v) for v in x if pd.notna(v)))
#     .reset_index()
# )
# print(cluster_groups)



# search_terms = []
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

# # --- LLM Cluster Processing ---
# search_terms = []
#  # set initial key

# # for _, row in cluster_groups.iterrows():
# #     cluster_id = row["cluster_id"]
# #     combined_content = row["content"]

# #     prompt = f"""
# #    You are a search query/headline generator.

# # Task:
# # - You will receive multiple article snippets grouped into the same cluster.
# # - If the cluster is coherent (articles are about the same or very similar topic), generate ONLY 1 concise search headlines that best summarize the whole cluster.
# # - If the cluster contains mixed or unrelated topics, generate multiple short headlines (one for each distinct topic).
# # - Headlines should be concise, keyword-rich, and not full sentences. Mention cluster info clearly.

# # Content:
# # {combined_content}  # truncate to avoid exceeding context

# # Return the result as a comma-separated list ONLY (no numbering, no extra text)
# #     """

# #     retries = 3
# #     for attempt in range(retries):
# #         try:
# #             model = genai.GenerativeModel("gemini-2.0-flash-lite")
# #             response = model.generate_content(prompt)
# #             terms = response.text.strip()
# #             break  # success, exit retry loop
# #         except Exception as e:
# #             print(f"⚠️ Error with key: {e}, rotating key...")
# #             set_next_key()
# #             terms = f"ERROR: {e}"
# #             time.sleep(2)  # avoid hammering

# #     print(f"Cluster {cluster_id} → {terms}")
# #     search_terms.append({"cluster_id": cluster_id, "search_terms": terms})

# #     time.sleep(5)  # throttle between requests

# # # --- Save results ---
# # df_search = pd.DataFrame(search_terms)
# # df_search.to_csv("cluster_search_terms.csv", index=False)
# # print("✅ Saved search terms to cluster_search_terms.csv")

# for _, row in cluster_groups.iterrows():
#     set_next_key() 
#     cluster_id = row["cluster_id"]
#     combined_content = row["content"]

#     prompt = f"""
# You are a search query/headline generator.

# Task:
# - You will receive multiple article snippets grouped into the same cluster.
# - If the cluster is coherent (articles are about the same or very similar topic), generate ONLY 1 concise search headline that best summarizes the whole cluster.
# - If the cluster contains mixed or unrelated topics, generate multiple short headlines (one for each distinct topic).
# -if nothing is provided in content return null, no dialogue
# - Headlines should be concise, keyword-rich, and not full sentences.
# # - Mention cluster id for clarity.

# Content:
# {combined_content}  # truncated for safety

# Return ONLY a comma-separated list of headlines. Nothing else.
#     """

#     retries = 3
#     for attempt in range(retries):
#         try:
#             model = genai.GenerativeModel("gemini-2.0-flash-lite")
#             response = model.generate_content(prompt)
#             terms = response.text.strip()
#             break
#         except Exception as e:
#             print(f"⚠️ Error with key: {e}, rotating key...")
#             set_next_key()
#             terms = f"ERROR: {e}"
#             time.sleep(8)

#     print(f"Cluster {cluster_id} → {terms}")
#     search_terms.append({"cluster_id": cluster_id, "search_terms": terms})

#     # time.sleep(5)

# # Save raw headlines
# df_search = pd.DataFrame(search_terms)
# df_search.to_csv("cluster_search_terms_raw.csv", index=False)
# print("✅ Saved raw headlines to cluster_search_terms_raw.csv")

# -------- Stage 2: Merge & Refine Headlines --------
# df_search=pd.read_csv("cluster_search_terms_raw.csv")
# all_headlines = ", ".join(df_search["search_terms"].dropna().tolist())

# merge_prompt = f"""
# You are a headline deduplication and merging assistant.

# Task:
# - You will receive a list of candidate search headlines from multiple clusters.
# - Merge overlapping or redundant headlines into a single concise headline make it detailed.
# - Keep diverse and distinct topics separate.
# - Return the final list as  keyword-rich, comma-separated headlines ONLY.

# Headlines:
# {all_headlines}
# """

# retries = 3
# for attempt in range(retries):
#     try:
#         model = genai.GenerativeModel("gemini-2.0-flash")
#         response = model.generate_content(merge_prompt)
#         final_headlines = response.text.strip()
#         break
#     except Exception as e:
#         print(f"⚠️ Error in merge step: {e}, rotating key...")
#         set_next_key()
#         final_headlines = f"ERROR: {e}"
#         time.sleep(2)

# print("🔗 Final Merged Headlines:")
# print(final_headlines)

# Save merged results
# df_final = pd.DataFrame([{"final_headlines": final_headlines}])
# df_final.to_csv("cluster_search_terms_final.csv", index=False)
# print("✅ Saved merged search terms to cluster_search_terms_final.csv")

df_final=pd.read_csv("cluster_search_terms_final.csv")
print(len(df_final['final_headlines']))

final_headlines = df_final['final_headlines'].iloc[0]

# Count how many comma-separated headlines exist
num_headlines = len([h.strip() for h in final_headlines.split(",") if h.strip()][:5])

print(f"✅ Saved merged search terms to cluster_search_terms_final.csv")
print(f"📌 Total Headlines: {num_headlines}")


from exa_py import Exa
import datetime
import json

exa = Exa(api_key="037d0186-123a-47a2-b1ff-81a9135a29ee")
from pymongo import MongoClient
mongo_uri="xxx"
db_name="mydb"
collection_name="exa_headlines"
def fetch_exa_content(query):
    try:
        now = datetime.datetime.utcnow()
        # Set the start date to 2 days ago
        start_dt = now - datetime.timedelta(days=1)
        # Format dates in ISO 8601 with 'Z' suffix to indicate UTC time
        start_date = start_dt.strftime("%Y-%m-%dT%H:%M:%S.000Z")
        end_date = now.strftime("%Y-%m-%dT%H:%M:%S.000Z")
        
        result = exa.search_and_contents(
            query,
            text=True,
            type="fast",
            start_published_date=start_date,
            end_published_date=end_date,
            context=True,
            num_results = 5
        )
        client = MongoClient(mongo_uri)
        db = client[db_name]
        collection = db[collection_name]
        collection.insert_one({
                "headline": head,
                "results": result,
               
            })
        print(collection_name)
        client.close()
        def serialize(obj):
            if isinstance(obj, list):
                return [serialize(i) for i in obj]
            elif hasattr(obj, "__dict__"):
                return {k: serialize(v) for k, v in obj.__dict__.items()}
            else:
                return obj
   
        return serialize(result)
    except Exception as e:
        return f"Error fetching content: {e}"


import pprint  # for pretty printing


headlines=[h.strip() for h in final_headlines.split(",") if h.strip()][:30]
for head in headlines:
    print(head)
    response_obj = fetch_exa_content(head)
    # pprint.pprint(response_obj)

    # Save as JSON
    with open("exa_response.json", "w", encoding="utf-8") as f:
        json.dump(response_obj  ,f, ensure_ascii=False, indent=2)

    print("✅ Saved Exa response to exa_response.json")
    # print(content)
    