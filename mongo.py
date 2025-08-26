import os
import pandas as pd
from datetime import datetime, timezone
from pymongo import MongoClient, UpdateOne

def save_csvs_to_mongo(csv_paths, mongo_uri="xxx", db_name="mydb"):
    client = MongoClient(mongo_uri)
    db = client[db_name]
    collection = db["scraped_articles"]

    for csv_file in csv_paths:
        source = os.path.splitext(os.path.basename(csv_file))[0]
        df = pd.read_csv(csv_file, usecols=["url", "content"])

        ops = []
        for record in df.to_dict(orient="records"):
            url = str(record["url"])
            content = str(record["content"])
            now = datetime.now(timezone.utc).isoformat()

            # Use pipeline update (MongoDB 4.2+)
            ops.append(UpdateOne(
                {"url": url},
                [
                    {
                        "$set": {
                            "content": {
                                "$concat": [
                                   {"$ifNull": ["$content", ""]},
                                    "\n",
                                    content
                                ]
                            },
                            "source": source,
                            "updatedAt": now
                        }
                    },
                    {
                        "$setOnInsert": {
                            "createdAt": now
                        }
                    }
                ],
                upsert=True
            ))

        if ops:
            collection.bulk_write(ops)

    print("Docs saved to MongoDB.")
    client.close()
