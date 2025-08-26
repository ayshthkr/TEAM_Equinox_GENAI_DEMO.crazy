import os
import pandas as pd
from datetime import datetime
from pymongo import MongoClient
import google.generativeai as genai
from google.generativeai import types
from google.generativeai.embedding import embed_content
# Gemini API client
import time
import itertools


GEMINI_KEYS = [
    "xxx",
    "xxx",
    "xxx"
   
   
]
key_cycle = itertools.cycle(GEMINI_KEYS)

def get_embedding(text: str, retries: int = 3, delay: int = 5):
    """
    Create embedding for text with key rotation and retry logic.
    
    Args:
        text (str): Input text to embed
        retries (int): Max retries if call fails
        delay (int): Seconds to wait before retry
    """
    for attempt in range(retries):
        try:
            # Rotate key on each call
            current_key = next(key_cycle)
            genai.configure(api_key=current_key)

            response = genai.embed_content(
                model="models/embedding-001",
                content=text,
            )
            embedding = response["embedding"]
            print(f"✅ Success with key {current_key[:10]}..., length={len(embedding)}")
            return embedding

        except Exception as e:
            print(f"⚠️ Attempt {attempt+1} failed with key {current_key}...: {e}")
            if attempt < retries - 1:
                print(f"⏳ Retrying in {delay} seconds...")
                time.sleep(delay)
            else:
                raise RuntimeError("All retries failed") from e
    

def save_csvs_to_mongo(csv_paths, mongo_uri="xxx", db_name="mydb"):
    client = MongoClient(mongo_uri)
    db = client[db_name]
    collection = db["scraped_data"]

    documents = []

    for csv_file in csv_paths:
        # Extract source name (file name without extension)
        source = os.path.splitext(os.path.basename(csv_file))[0]

        # Read CSV
        df = pd.read_csv(csv_file)

        # Ensure only url + content columns are used
        for csv_file in csv_paths:
            source = os.path.splitext(os.path.basename(csv_file))[0]
            df = pd.read_csv(csv_file)

            for _, row in df.iterrows():
                text = str(row["content"])

                # Create embedding from Gemini
                embedding = get_embedding(text)

                  # extract embedding vector

                doc = {
                    "url": str(row["url"]),
                    "content": text,
                    "embedding": embedding,
                    "createdAt": datetime.now().isoformat(),
                    "source": source,
                }
                # print(doc)
                # break
                documents.append(doc)
                time.sleep(5)
    if documents:
        # pass
        collection.insert_many(documents)  # non-blocking bulk insert

    client.close()
save_csvs_to_mongo(csv_paths=['thedailyjagran.csv', 'thehindustan.csv', 'thehindu.csv', 'toi.csv'])