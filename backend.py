from http.client import HTTPException
from typing import List, Dict, Any
from fastapi import Body, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

from toi_utils import scrape_and_export
from thehindustan import scrape_and_export_hindustan_times
from thehindu_utils import scrape_hindu_news
from thedailyjagran_utils import scrape_jagran
from topics_to_sources import pipeline_process

app = FastAPI(
    title="News Scraper API",
    description="""
    An API to scrape news articles from multiple Indian news sources:

    - 📰 Times of India
    - 📰 Hindustan Times
    - 📰 The Hindu
    - 📰 Dainik Jagran

    You can either fetch from **individual sources** or get them **all at once**.
    """,
    version="1.0.0",
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Root"])
def read_root():
    """Simple health check endpoint."""
    return {"message": "Hello, FastAPI!"}


# ------------------ Individual Scraper Routes ------------------ #
@app.get("/scrape/toi", tags=["Scrapers"], summary="Scrape Times of India")
def scrape_toi():
    """
    Scrapes the **Times of India** website and returns a list of news articles.

    - **source**: Times of India  
    - **count**: Number of articles scraped  
    - **articles**: List of scraped article objects
    """
    articles = scrape_and_export()
    return {"source": "Times of India", "count": len(articles), "articles": articles}


@app.get("/scrape/hindustan", tags=["Scrapers"], summary="Scrape Hindustan Times")
def scrape_hindustan():
    """Scrapes the **Hindustan Times** website for articles."""
    articles = scrape_and_export_hindustan_times()
    return {"source": "Hindustan Times", "count": len(articles), "articles": articles}


@app.get("/scrape/hindu", tags=["Scrapers"], summary="Scrape The Hindu")
def scrape_hindu():
    """Scrapes the **The Hindu** website for articles."""
    articles = scrape_hindu_news()
    return {"source": "The Hindu", "count": len(articles), "articles": articles}


@app.get("/scrape/jagran", tags=["Scrapers"], summary="Scrape Dainik Jagran")
def scrape_jagran_news():
    """Scrapes the **Dainik Jagran** website for articles."""
    articles = scrape_jagran()
    return {"source": "Dainik Jagran", "count": len(articles), "articles": articles}


# ------------------ Combined Route ------------------ #
from fastapi import BackgroundTasks
from mongo import save_csvs_to_mongo
import threading

@app.get("/scrape/all", tags=["Scrapers"], summary="Scrape all news sources")
def scrape_all(background_tasks: BackgroundTasks):
    """
    Scrapes **all supported news sources** in one go:

    - Times of India  
    - Hindustan Times  
    - The Hindu  
    - Dainik Jagran  

    Returns combined results and total article count.
    """

    def do_scraping_and_save():
        scrape_and_export()
        scrape_and_export_hindustan_times()
        scrape_hindu_news()
        scrape_jagran()

        # Save to MongoDB
        save_csvs_to_mongo(csv_paths=['thedailyjagran.csv', 'thehindustan.csv', 'thehindu.csv', 'toi.csv'])

    thread = threading.Thread(target=do_scraping_and_save)
    thread.start()

    return {
        "message": "Scraping started in background. Results will be saved to MongoDB.",
        "status": "processing"
    }

@app.get("/process/topics", tags=["Processing"], summary="Process topics to sources")
def process_topics():
    """
    Processes topics and maps them to their respective sources.
    """
    thread = threading.Thread(target=pipeline_process)
    thread.start()
    return {"message": "Topic processing started in background."}



from typing import Optional, List
from bson import ObjectId
from pymongo import MongoClient, UpdateOne

# ---- Pydantic Models ---- #
class ArticleFilter(BaseModel):
    tags: Optional[List[str]] = None
    limit: Optional[int] = 20
    skip: Optional[int] = 0


# ---- MongoDB Helper ---- #
def get_collection(
    mongo_uri="xxx",
    db_name="mydb",
    collection_name="exa_headlines",
):
    client = MongoClient(mongo_uri)
    db = client[db_name]
    return db[collection_name]


# ------------------ New Routes ------------------ #
@app.post("/articles", tags=["Articles"], summary="Get all or filtered articles")
def get_articles(filters: ArticleFilter = Body(default=ArticleFilter())):
    """
    Fetches articles from the `exa_headlines` collection.

    - If no filters → returns all articles (default limit=20).  
    - You can filter by:
        - `tags`: list of tags  
        - `limit`: max number of articles  
        - `skip`: offset for pagination  

    Sample usage:

    Request:
        POST /articles
        Content-Type: application/json
        {
            "tags": ["sports", "politics"],
            "limit": 10,
            "skip": 0
        }


    Response:
        {
            "count": 10,
            "articles": [ ... ]
        }
    """
    collection = get_collection()
    query = {}

    if filters.tags:
        query["tag"] = {"$in": filters.tags}

    cursor = collection.find(query).skip(filters.skip).limit(filters.limit)
    results = []
    for doc in cursor:
        doc["_id"] = str(doc["_id"])  # convert ObjectId → str
        results.append(doc)

    return {"count": len(results), "articles": results}


@app.get("/articles/{article_id}", tags=["Articles"], summary="Get article by ID")
def get_article_by_id(article_id: str):
    """
    Fetch a single article by its MongoDB `_id`.
    """
    collection = get_collection()
    try:
        doc = collection.find_one({"_id": ObjectId(article_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid article ID format")

    if not doc:
        raise HTTPException(status_code=404, detail="Article not found")

    doc["_id"] = str(doc["_id"])
    return doc








if __name__ == "__main__":
    uvicorn.run("backend:app", host="0.0.0.0", port=8000, reload=True)
