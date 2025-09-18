
import os
from pathlib import Path

# Project paths
PROJECT_ROOT = Path(__file__).parent.parent
DATA_DIR = PROJECT_ROOT / "data"
RAW_DATA_DIR = DATA_DIR / "raw"
PROCESSED_DATA_DIR = DATA_DIR / "processed"
MODELS_DIR = PROJECT_ROOT / "models"
LOGS_DIR = PROJECT_ROOT / "logs"

# Dataset paths
LIAR_DATA_PATH = RAW_DATA_DIR / "liar"
FAKENEWSNET_DATA_PATH = RAW_DATA_DIR / "fakenewsnet"
INDIAN_CONTEXT_DATA_PATH = RAW_DATA_DIR / "indian_context"
SENTIMENT_DATA_PATH = RAW_DATA_DIR / "sentiment_analysis"

# Model configurations
MODEL_CONFIGS = {
    "distilbert": {
        "model_name": "distilbert-base-uncased",
        "max_length": 512,
        "batch_size": 16,
        "learning_rate": 2e-5,
        "num_epochs": 3
    },
    "roberta": {
        "model_name": "roberta-base", 
        "max_length": 512,
        "batch_size": 16,
        "learning_rate": 1e-5,
        "num_epochs": 3
    }
}

# Scraping configurations
SCRAPING_CONFIG = {
    "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "delay": 1,  # seconds between requests
    "timeout": 30,
    "max_retries": 3
}

# Indian news sources
RELIABLE_INDIAN_SOURCES = [
    "https://www.thehindu.com",
    "https://indianexpress.com", 
    "https://www.hindustantimes.com",
    "https://timesofindia.indiatimes.com",
    "https://www.ndtv.com",
    "https://www.business-standard.com",
    "https://economictimes.indiatimes.com"
]

FACT_CHECK_SOURCES = [
    "https://www.altnews.in",
    "https://www.boomlive.in",
    "https://factly.in",
    "https://newsmobile.in/articles/category/fake-news/"
]

# API Keys (set in environment variables)
TWITTER_BEARER_TOKEN = os.getenv("TWITTER_BEARER_TOKEN")
NEWS_API_KEY = os.getenv("NEWS_API_KEY")
