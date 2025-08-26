import os
import pandas as pd
from datetime import datetime, timezone
from pymongo import MongoClient

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
        for _, row in df.iterrows():
            doc = {
                "url": str(row["url"]),
                "content": str(row["content"]),
                "createdAt": datetime.now().astimezone().isoformat(),
                "source": source
            }
            documents.append(doc)

    if documents:
        collection.insert_many(documents)  # non-blocking bulk insert

    client.close()
