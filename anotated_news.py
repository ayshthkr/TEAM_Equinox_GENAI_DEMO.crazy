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


# df=pd.read_csv('annotated_news_articles.csv')
# df=df[df['processing_status'] == 'success']

# # avg column length

# avg = df['text'].str.len().mean()
# print(f"Average text length: {avg:.2f}")
# # print(df.head())


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


mongo_uri2="xxx"
db_name2 = "mydb"
client2 = MongoClient(mongo_uri2)
db2 = client2[db_name2]
collection2=db2["embeddded_articles"]


mongo_uri="xxx",
db_name="mydb"
client = MongoClient(mongo_uri)
db = client[db_name]
collection = db["scraped_articles"]

df=pd.read_csv('Valid.csv')
# print(df.head())

def measure_error():
    l1 = {"right": 0, "left": 0, "center": 0}
    l2 = {"right": 0, "left": 0, "center": 0}
    n = 0

    for _, row in df[8000:10000].iterrows():
        url = row['url']
        doc = collection.find_one({"url": url})
        if not doc:
            n += 1
            query = row['text']
            embedding = get_embedding(clean_text(query))

            results = collection2.aggregate([
                {
                    "$vectorSearch": {
                        "index": "embedding",
                        "queryVector": embedding,
                        "path": "embedding",
                        "numCandidates": 800,
                        "limit": 500,
                    }
                },
                {
                    "$project": {
                        "bias_right": 1,
                        "bias_left": 1,
                        "bias_center": 1,
                        "score": {"$meta": "vectorSearchScore"}
                    }
                }
            ])

            cal_right = cal_left = cal_center = 0
            cnt = 0
            for r in results:
                            
                cnt += 1
                cal_right += r["bias_right"]
                cal_left  += r["bias_left"]
                cal_center+= r["bias_center"]

            if cnt > 0:
                pred_right  = cal_right / cnt
                pred_left   = cal_left / cnt
                pred_center = cal_center / cnt

                # errors
                l1["right"]  += abs(pred_right - row['bias_right'])
                l2["right"]  += (pred_right - row['bias_right'])**2
                l1["left"]   += abs(pred_left - row['bias_left'])
                l2["left"]   += (pred_left - row['bias_left'])**2
                l1["center"] += abs(pred_center - row['bias_center'])
                l2["center"] += (pred_center - row['bias_center'])**2

    # final metrics
    print("Final Errors:")
    print("total rows", n)
    for side in ["right", "left", "center"]:
        mae = l1[side] / n
        mse = l2[side] / n
        rmse = mse ** 0.5
        print(f"{side.capitalize()} - L1: {l1[side]:.3f}, MSE: {mse:.3f}, RMSE: {rmse:.3f}, MAE: {mae:.3f}")

measure_error()
        
def bias_from_embedding_of_different():
    # pick one doc from scraped_articles
    news_docs = list(collection.find({}).limit(100))[4:5]
    print(f"Total news docs to process: {len(news_docs)}")

    for doc in news_docs:
        print(doc["_id"])
        print(doc["url"])
        print(doc["content"][:100])

        if not doc.get("content") or len(doc["content"]) < 50:
            print("Skipping due to insufficient content")
            continue

        

        query_vector = doc["embedding"]
        print(f"Query vector length: {len(query_vector)}")

        # MongoDB Atlas Vector Search query
        results = collection2.aggregate([
            {
                "$vectorSearch": {
                    "index": "embedding",   # name of your vector index in Atlas
                    "queryVector": query_vector,
                    "path": "embedding",          # field name in collection2
                    "numCandidates": 1000,         # how many to consider
                    "limit": 1000,                   # top N results
                }
            },
            {
                "$project": {
                    "_id": 1,
                    "url": 1,
                    "bias_right": 1,
                    "bias_left": 1,
                    "bias_center": 1,
                    
                    "score": {"$meta": "vectorSearchScore"}
                }
            }
        ])
        results = list(results)
        cal_right=0
        cal_left=0
        cal_center=0
        cnt=0
        for r in results:
            if r["score"] > 0.4:  # similarity threshold
                cnt+=1
                print(f"Neighbor: {r['_id']} | score={r['score']:.3f}")
                # print(f"  URL: {r['url']}")
                cal_right+=r["bias_right"]
                cal_left+=r["bias_left"]
                cal_center+=r["bias_center"]
                # print(r["bias_center"])
                # print(r["bias_right"])
        print("-" * 40)
        if cnt>0:
            print(f"Right: {cal_right/cnt:.3f}, Left: {cal_left/cnt:.3f}, Center: {cal_center/cnt:.3f}")
        else:
            print("No similar articles found.")

# bias_from_embedding_of_different()




# Fetch 10k _ids to delete
# ids_to_delete = collection2.find({}, {"_id": 1}).limit(4000)
# id_list = [doc["_id"] for doc in ids_to_delete]

# # Delete them
# result = collection2.delete_many({"_id": {"$in": id_list}})
# print(f"✅ Deleted {result.deleted_count} documents from scraped_articles_raw")