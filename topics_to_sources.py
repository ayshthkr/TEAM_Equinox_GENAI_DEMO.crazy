from datetime import datetime, timedelta, timezone
from pymongo import MongoClient, UpdateOne
import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import google.generativeai as genai
import time, json, re, itertools, threading, random
from exa_py import Exa


MONGO_URI = "xxx"
DB_NAME = "mydb"
SCRAPED_COLLECTION = "scraped_articles"
EXA_COLLECTION = "exa_headlines"
# #################keys#########################
GEMINI_KEYS = [
    "xxx",
    "xxx",
  "xxx",
    "xxx",
    "xxx"

    
]

EXA_KEY="3d3fbf94-f869-44ab-8019-234aaabe93a6"
key_cycle = itertools.cycle(GEMINI_KEYS)

def set_next_key():
    key = next(key_cycle)
    genai.configure(api_key=key)
    print(f"🔑 Using API Key: {key[:8]}...")  # partial display for debugging
    return key

################################################

############### EMBEDDING  LOGIC #########################

def get_embedding(text: str, retries: int = 3, delay: int = 5):
    """
    Generate embeddings with Gemini API.
    Rotates keys + retry logic.
    """
    for attempt in range(retries):
        try:
            set_next_key()

            response = genai.embed_content(
                model="models/embedding-001",
                content=text,
            )
            embedding = response["embedding"]
         
            return embedding

        except Exception as e:
         
            if attempt < retries - 1:
                print(f"⏳ Retrying in {delay} seconds...")
                time.sleep(delay)
            else:
                raise RuntimeError("All retries failed") from e

MAX_CHARS = 30000  # max chars for embedding
# Clean and truncate text
def clean_text(text: str) -> str:
    # Remove extra whitespace
    text = " ".join(text.split())
    # Truncate safely
    if len(text) > MAX_CHARS:
        text = text[:MAX_CHARS]
    return text

def save_csvs_to_mongo(
    csv_paths,
    mongo_uri=MONGO_URI,
    db_name=DB_NAME
):
    client = MongoClient(mongo_uri)
    db = client[db_name]
    collection = db["scraped_articles"]
   

    for csv_file in csv_paths:
       
        df = pd.read_csv(csv_file, usecols=["url", "content"])

        ops = []
     
        for record in df.to_dict(orient="records"):
            url = str(record["url"])
            content = str(record["content"])
            
            now = datetime.now(timezone.utc).isoformat()
            source=url.split("/")[2].split(".")[-2] if len(url.split("/"))>2 else "unknown"

            # Generate embedding for content
            content = clean_text(content)
            embedding = get_embedding(content)

         

            ops.append(UpdateOne(
                {"url": url},
                [
                    {
                        "$set": {
                            "content": {
                                "$cond": {
                                    "if": {"$ifNull": ["$content", False]},
                                    "then": {"$concat": ["$content", "\n", content]},
                                    "else": content
                                }
                            },
                            "embedding": embedding,
                            "source": source,
                            "updatedAt": now,
                            "createdAt": {"$ifNull": ["$createdAt", now]}
                        }
                    }
                ],
                upsert=True
            ))

            time.sleep(2)  # avoid rate limiting

        if ops:
            result = collection.bulk_write(ops)
            print(f"{csv_file} -> inserted: {result.upserted_count}, modified: {result.modified_count}")

       

    client.close()
def do_scraping_and_save():
        print("Starting scraping and saving to MongoDB...")
        # Save to MongoDB
        save_csvs_to_mongo(csv_paths=['final_exa_rows.csv'])

####################################################

############### CLUSTERING LOGIC #########################

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
# ######## GEMIN GENERATERATOR ###############

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

def _generate_keys_for_cluster(content, retries=3):
    prompt = f"""
You are a search query/keyword generator.

Task:
- Input: multiple article snippets from one cluster.
- Output: A JSON list of 3-5 concise, meaningful keywords (strings only).
- Each keyword should be short, keyword-rich, and specific (not generic keywords).
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

def generate_headline(content: str, retries=3):
    """
    Generate a short headline (max 12 words).
    Returns: string
    """
    prompt = f"""
Persona:
You are an experienced news editor and headline writer with a deep understanding of global journalism. You craft headlines that are concise, engaging, and authentic, while avoiding exaggeration or clickbait.

Context:
You are given multiple news articles from different sources that report on the same event or topic. Your job is to synthesize the content and create a single headline that captures the core story in a catchy, memorable, and credible way. The headline should reflect the facts across sources, not biased toward one perspective.

Task:
Analyze the provided articles.
Identify the central theme, event, or development.

Create one headline that is:
Short (max 12–15 words).
Catchy, yet faithful to the facts.
Engaging in tone. 
Can be Poetic

Format:
Return only the headline as a single line of text.

Example Headlines:
Climate Reality: Why Today’s Heatwaves Won’t End Tomorrow
Gene Breakthrough Restores Sight for Thousands
Trump Adviser Calls Ukraine Conflict ‘Modi’s War’
Markets or Mayhem? Wall Street Reacts to Asia’s Tech Surge

Tone:
Engaging and attention-grabbing, while remaining authentic, factual, and trustworthy.

Articles:

Content:
{content}
"""
    for _ in range(retries):
        try:
            model = genai.GenerativeModel("gemini-2.0-flash-lite")
            response = model.generate_content(prompt)
            return response.text.strip().strip('"')
        except Exception as e:
            print(f"⚠️ Headline error: {e}, rotating key…")
            set_next_key()
            time.sleep(5)
    return ""


def generate_tags(content: str, retries=3):
    """
    Generate 3–5 tags (topic keywords).
    Returns: list of strings
    """
    prompt = f"""
You are a topic tag generator.

Task:
- Input: news article text.
- Output: a JSON array of 3–5 concise tags (strings only).
- No dicts, no explanations, just a JSON list.
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
            if isinstance(parsed, list):
                return [str(tag) for tag in parsed]
        except Exception as e:
            print(f"⚠️ Tags error: {e}, rotating key…")
            set_next_key()
            time.sleep(5)
    return []


def generate_summary(content: str, retries=3):
    """
    Generate a concise summary (max 50 words).
    Returns: string
    """
    prompt = f"""
Persona:
You are a professional news analyst who specializes in condensing complex stories into clear, concise, and accurate summaries. You value balance, clarity, and factual accuracy, avoiding personal bias or sensationalism.

Context:
You are given multiple news articles from different sources about the same event, issue, or topic. Your job is to merge the perspectives into a unified summary that highlights the key facts and insights without redundancy.

Task:
Read and analyze the provided articles.
Extract the most important points (who, what, when, where, why, how).

Create a single, cohesive summary that:
Is 150–200 words 
Highlights agreements or differences across sources.
Avoids unnecessary details, speculation, or bias.
Write in a clear, neutral, professional news style.

Format:
Return the summary as one continuous block of text, with no bullet points or lists.

Example Summaries:
Multiple countries are ramping up renewable energy investments as heatwaves intensify, with governments pushing for faster adoption of solar and wind to curb climate impacts. While some industries warn of short-term costs, scientists emphasize urgent action as extreme weather events multiply.

A breakthrough in gene therapy has restored partial vision for thousands of patients suffering from inherited blindness. Clinical trials show promising results, though experts caution that accessibility and affordability remain challenges before large-scale rollout.

Tone:
Neutral, clear, and informative. Engaging enough for general readers but always fact-based and trustworthy.

Articles:
Here are the articles’ content:
{content}
"""
    

    for _ in range(retries):
        try:
            model = genai.GenerativeModel("gemini-2.0-flash-lite")
            response = model.generate_content(prompt)
            return response.text.strip().strip('"')
        except Exception as e:
            print(f"⚠️ Summary error: {e}, rotating key…")
            set_next_key()
            time.sleep(5)
    return ""
####################################################


################ EXA FETCHING LOGIC #########################

def process_and_merge_headlines(cluster_groups, save_prefix="cluster_search_terms"):
    search_terms = []
    
    # Stage 1 → generate raw keywords
    mongo_uri = "xxx"
    db_name = "mydb"
    for _, row in cluster_groups.iterrows():
        keywords = _generate_keys_for_cluster(row["content"])
        keywords = ", ".join(keywords)
        print(f"Cluster {row['cluster_id']} → {keywords}")
        print("🔍 Fetching Exa content for top headlines...")
        fetch_and_save_exa(
            headlines=keywords,
            mongo_uri=mongo_uri,
            db_name=db_name,
            collection_name="exa_headlines",
            existing_urls=row["urls"],
            existing_content=row["content"],
            limit=5
        )


        time.sleep(2)


from exa_py import Exa


import pprint
import random
rows = []
def transform_exa_response(exa_json: dict) -> dict:
                """
                Transform Exa API JSON response into simplified format:
                {
                "content": "... merged article texts ...",
                "image": "img",
                "url": ["https://...", "https://..."]
                }
                """
                results = exa_json.get("results", [])

                contents = []
                images = []
                urls = []
             
               
                for item in results:
                    # Collect content
                    text = item.get("text", "")
                    if text:
                        contents.append(text.strip())
                    # Collect images - check both `image` (string) and `images` (list)
                    img_single = item.get("image")
                    img_list = item.get("images")

                    if isinstance(img_single, str) and img_single:
                        images.append(img_single)

                    if isinstance(img_list, list):
                        images.extend([i for i in img_list if i])  # filter out None/empty    
                
                    # Collect URL
                    url = item.get("url")
                    if url:
                        urls.append(url)
                    rows.append({"content": text, "url": url})
    

               
                return {
                    "content": "\n\n".join(contents),  # merged text
                    "image": images,
                    "url": set(urls)
                }


def serialize(obj):
        """Recursive serialization to dicts/lists for non-JSON objects"""
        if isinstance(obj, list):
            return [serialize(i) for i in obj]
        elif hasattr(obj, "__dict__"):
            return {k: serialize(v) for k, v in obj.__dict__.items()}
        else:
            return obj

def fetch_and_save_exa(headlines, 
                       mongo_uri="xxx",
                       db_name="mydb",
                       collection_name="exa_headlines",
                       api_key=EXA_KEY,
                       limit=5,
                       existing_urls=None,
                       existing_content=None
                       ):
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

    now = datetime.utcnow()
    start_dt = now - timedelta(days=1)
    start_date = start_dt.strftime("%Y-%m-%dT%H:%M:%S.000Z")
    end_date = now.strftime("%Y-%m-%dT%H:%M:%S.000Z")

  
    print(f"🔍 Fetching Exa content for: {headlines}")
    try:
            result = exa.search_and_contents(
                headlines,
                text=True,
                type="fast",
                start_published_date=start_date,
                end_published_date=end_date,
                context=True,
                num_results=limit
            ) # type: ignore
            serialized = serialize(result)
          
            
            # filename = f"exa_result.json"
            # with open(filename, "w") as f:
            #     json.dump(serialized, f, indent=4)
            # print(transform_exa_response(transform_exa_response(serialized)))

            # Save to constant MongoDB collection
            objectified=transform_exa_response(serialized)
            objectified["content"]+= "\n\n"+ existing_content if existing_content else ""
            objectified["url"]=list(objectified["url"].union(set(existing_urls))) if existing_urls else list(objectified["url"])
            headline=generate_headline(objectified["content"])
            tags=generate_tags(objectified["content"])
            summary=generate_summary(objectified["content"])
            # Compute normalized bias values so that they sum to 1
            r = random.random()
            l = random.random()
            c = random.random()
            total = r + l + c
            bias_right = r / total
            bias_left = l / total
            bias_center = c / total

            a = collection.insert_one({
                "searchterms": headlines,
                "headline": headline,
                "tag": tags,
                "imgs": objectified["image"],
                "urls": objectified["url"],
                "summary": summary,
                "bias_right": bias_right,
                "bias_left": bias_left,
                "bias_center": bias_center,
                "fraud_score": random.random(),
                "fetched_at": datetime.utcnow()
            })
            # a= collection.insert_one({
            #     "headline": head,
            #     "results": serialized,
            #     "fetched_at": datetime.utcnow()
            # })
            print(a)
            print(f"Inserted document ID: {a.inserted_id}")
            print(f"✅ Saved results to MongoDB collection: {collection_name}\n")

    except Exception as e:
            print(f"⚠️ Error fetching/saving headline '{headlines}': {e}")



#######################################################3
def pipeline_process(
    mongo_uri=MONGO_URI,
    db_name=DB_NAME,
    scraped_collection="scraped_articles",
    exa_collection="exa_headlines",
    hours=24,
    similarity_threshold=0.72,
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
    print(f"Cutoff time: {cutoff.isoformat()}")
    docs = list(coll.find(
        {"createdAt": {"$gte": cutoff.isoformat()}},
    ))

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

    # Sort clusters by size (number of docs) - largest first, pick top 20
    clusters_sorted_top = sorted(clusters, key=lambda x: len(x["docs"]), reverse=True)[:30]
    # Sort clusters by size (number of docs) - smallest first, pick bottom 10
    clusters_sorted_bottom = sorted(clusters, key=lambda x: len(x["docs"]))[:10]
    # Combine both lists
    clusters_sorted = clusters_sorted_top 
   

    # Prepare DataFrame for headline generation
    
    cluster_groups = pd.DataFrame([
        {
            "cluster_id": c["cluster_id"],
            "content": " ".join([d["content"] for d in c["docs"]]),
            "urls": [d["url"] for d in c["docs"]]
        }
        for c in clusters_sorted
    ])
    print(f"Processing top {len(cluster_groups)} clusters by size:")
    print(cluster_groups.head())

    # --- 3 & 4. Generate & merge headlines ---
    print("generating keyword for exa 🗞️🗞️🗞️")
    process_and_merge_headlines(cluster_groups)

   
  
    
    # Fetch & save to MongoDB
    if rows:
        df_final = pd.DataFrame(rows)
        df_final.to_csv("final_exa_rows.csv", index=False)
        print("✅ Saved final_exa_rows.csv, starting pushing to scrapped articles........")
        thread = threading.Thread(target=do_scraping_and_save)
        thread.start()

        
    
    print("✅ Pipeline completed successfully.")
    client.close()
    # return df_search, df_final

# pipeline_process()