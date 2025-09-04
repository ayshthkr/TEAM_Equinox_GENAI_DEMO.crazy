import pandas as pd
import itertools
import google.generativeai as genai
from pymongo import MongoClient
import time

from mongo import clean_text
gemini_keys = [
'xxx',
'xxx',
'xxx',
'xxx',
'xxx',
'xxx',
'xxx',
'xxx',



'xxx',
'xxx' ]

key_cycle = itertools.cycle(gemini_keys)

# Function to set next API key
def set_next_key():
    key = next(key_cycle)
    genai.configure(api_key=key)
    print(f"🔑 Using API Key: {key[:8]}...")  # partial display for debugging
    return key


df=pd.read_csv('annotated_news_articles.csv')
df=df[df['processing_status'] == 'success']

# avg column length

avg = df['text'].str.len().mean()
print(f"Average text length: {avg:.2f}")
# print(df.head())


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


mongo_uri="xxx"
db_name = "mydb"
client = MongoClient(mongo_uri)
db = client[db_name]

if "embeddded_articles" in db.list_collection_names():
    collection = db["embeddded_articles"]
else:
    collection = db.create_collection("embeddded_articles")

print("done")    
BATCH_SIZE = 500
batch = []

for i, row in enumerate(df.itertuples(index=False), 1):
    if(i<4500): continue
    content = clean_text(row.text)
    embedding = get_embedding(content)
    print(i)
    batch.append({
        "url": row.url,
        "source": row.source,
        "publish_date": row.publish_date,
        "title": row.title,
        "text": content,
        "bias_left": row.bias_left,
        "bias_right": row.bias_right,
        "bias_center": row.bias_center,
        "embedding": embedding,
    })

    if i % BATCH_SIZE == 0:
        collection.insert_many(batch)
        print(f"✅ Inserted {i} rows so far...")
        batch = []

# Insert remaining docs
if batch:
    collection.insert_many(batch)
    print(f"✅ Inserted final {len(batch)} rows")

# O8wFhshwzrME1xTg
# rajraman21211_db_user

mongo_uri="xxx",
db_name="mydb"
# client = MongoClient(mongo_uri)
# db = client[db_name]
# collection2 = db["scraped_articles_raw"]

# # Fetch 10k _ids to delete
# ids_to_delete = collection2.find({}, {"_id": 1}).limit(4000)
# id_list = [doc["_id"] for doc in ids_to_delete]

# # Delete them
# result = collection2.delete_many({"_id": {"$in": id_list}})
# print(f"✅ Deleted {result.deleted_count} documents from scraped_articles_raw")