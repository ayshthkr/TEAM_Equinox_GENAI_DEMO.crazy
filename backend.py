from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from toi_utils import scrape_and_export
from thehindustan import scrape_and_export_hindustan_times
from thehindu_utils import scrape_hindu_news
from thedailyjagran_utils import scrape_jagran

app = FastAPI()

# Enable CORS for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods
    allow_headers=["*"],  # Allows all headers
)


@app.get("/")
def read_root():
    return {"message": "Hello, FastAPI!"}

# ------------------ Individual Scraper Routes ------------------ #
@app.get("/scrape/toi")
def scrape_toi():
    articles = scrape_and_export()
    return {"source": "Times of India", "count": len(articles), "articles": articles}

@app.get("/scrape/hindustan")
def scrape_hindustan():
    articles = scrape_and_export_hindustan_times()
    return {"source": "Hindustan Times", "count": len(articles), "articles": articles}

@app.get("/scrape/hindu")
def scrape_hindu():
    articles = scrape_hindu_news()
    return {"source": "The Hindu", "count": len(articles), "articles": articles}

@app.get("/scrape/jagran")
def scrape_jagran_news():
    articles = scrape_jagran()
    return {"source": "Dainik Jagran", "count": len(articles), "articles": articles}

# ------------------ Combined Route ------------------ #
@app.get("/scrape/all")
def scrape_all():
    toi_articles = scrape_and_export()
    hindustan_articles = scrape_and_export_hindustan_times()
    hindu_articles = scrape_hindu_news()
    jagran_articles = scrape_jagran()

    all_articles = {
        "Times of India": toi_articles,
        "Hindustan Times": hindustan_articles,
        "The Hindu": hindu_articles,
        "Dainik Jagran": jagran_articles,
    }

    total_count = (
        len(toi_articles)
        + len(hindustan_articles)
        + len(hindu_articles)
        + len(jagran_articles)
    )

    return {"total_count": total_count, "articles": all_articles}


if __name__ == "__main__":
    uvicorn.run("backend:app", host="127.0.0.1", port=8000, reload=True)
