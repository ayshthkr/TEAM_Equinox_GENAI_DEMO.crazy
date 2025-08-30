df_search=pd.read_csv("cluster_search_terms_raw.csv")
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
