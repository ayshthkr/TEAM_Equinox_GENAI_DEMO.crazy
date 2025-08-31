import os
import time
import itertools
import pandas as pd
from datetime import datetime, timezone
from pymongo import MongoClient, UpdateOne
import google.generativeai as genai

# ======================
# Gemini API setup
# ======================

MAX_CHARS = 30000  # keep under limit

def clean_text(text: str) -> str:
    # Remove extra whitespace
    text = " ".join(text.split())
    # Truncate safely
    if len(text) > MAX_CHARS:
        text = text[:MAX_CHARS]
    return text

GEMINI_KEYS = [
    "xxx",
    "xxx",
  "xxx",
    "xxx",
    "xxx"

    
]
key_cycle = itertools.cycle(GEMINI_KEYS)

def get_embedding(text: str, retries: int = 3, delay: int = 5):
    """
    Generate embeddings with Gemini API.
    Rotates keys + retry logic.
    """
    for attempt in range(retries):
        try:
            current_key = next(key_cycle)
            genai.configure(api_key=current_key)

            response = genai.embed_content(
                model="models/embedding-001",
                content=text,
            )
            embedding = response["embedding"]
            print(f"✅ Embedding success (key={current_key[:10]}..., le={len(embedding)})")
            return embedding

        except Exception as e:
            print(f"⚠️ Attempt {attempt+1} failed with key {current_key}: {e}")
            if attempt < retries - 1:
                print(f"⏳ Retrying in {delay} seconds...")
                time.sleep(delay)
            else:
                raise RuntimeError("All retries failed") from e

# ======================
# Mongo saver
# ======================
def save_csvs_to_mongo(
    csv_paths,
    mongo_uri="xxx",
    db_name="mydb"
):
    client = MongoClient(mongo_uri)
    db = client[db_name]
    collection = db["scraped_articles"]
    collection2 = db["scraped_articles_raw"]

    for csv_file in csv_paths:
        source = os.path.splitext(os.path.basename(csv_file))[0]
        df = pd.read_csv(csv_file, usecols=["url", "content"])

        ops = []
        ops2 = []
        for record in df.to_dict(orient="records"):
            url = str(record["url"])
            content = str(record["content"])
            now = datetime.now(timezone.utc).isoformat()

            # Generate embedding for content
            content = clean_text(content)
            embedding = get_embedding(content)

            ops2.append({"url": url, "content": content, "source": source, "insertedAt": now, "embedding": embedding})

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

        if ops2:
            collection2.insert_many(ops2)
            print(f"{csv_file} -> raw inserted: {len(ops2)}")

    client.close()


if __name__ == "__main__":
    save_csvs_to_mongo(
        csv_paths=["thedailyjagran.csv", "thehindustan.csv", "thehindu.csv", "toi.csv"]
    )
