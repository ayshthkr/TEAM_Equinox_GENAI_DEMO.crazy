# pipeline.py
import torch
import pandas as pd
import numpy as np
import json
import joblib
from pathlib import Path
from transformers import DistilBertTokenizer, DistilBertForSequenceClassification
from torch.utils.data import DataLoader
import spacy
from textstat import flesch_reading_ease
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from collections import Counter
import google.generativeai as genai
import os
import warnings

# Suppress warnings for a cleaner output
warnings.filterwarnings('ignore')

# --- 1. Load Models and Artifacts ---

# Check for GPU availability for faster inference
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(f"✅ Using device: {device}")

# Load spaCy model for advanced feature extraction
try:
    nlp = spacy.load("en_core_web_lg")
except OSError:
    print("⚠️ 'en_core_web_lg' spaCy model not found. Downloading...")
    spacy.cli.download("en_core_web_lg")
    nlp = spacy.load("en_core_web_lg")
print("✅ spaCy model 'en_core_web_lg' loaded.")

# --- Define Paths to Saved Model Artifacts ---
# Assumes this script is run from the project root directory
BASE_PATH = Path(__file__).parent
DISTILBERT_PATH = BASE_PATH / "models/final_fake_news_detector"
SCALER_PATH = BASE_PATH / "models/feature_scaler.pkl"

if not DISTILBERT_PATH.exists() or not SCALER_PATH.exists():
    raise FileNotFoundError(
        "Model files not found. Please ensure you have run '2_train.ipynb' and '3_pipeline.ipynb' "
        f"and the 'models' directory is in the correct location: {BASE_PATH}"
    )

# --- Load Fine-Tuned DistilBERT Model (from Phase 2) ---
# This is our primary, most accurate model for prediction.
print("Loading fine-tuned DistilBERT model...")
distilbert_tokenizer = DistilBertTokenizer.from_pretrained(DISTILBERT_PATH)
distilbert_model = DistilBertForSequenceClassification.from_pretrained(DISTILBERT_PATH)
distilbert_model.to(device)
distilbert_model.eval()
print("✅ DistilBERT model loaded successfully.")

# --- Gemini API Configuration ---
try:
    GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
    if not GEMINI_API_KEY:
        raise ValueError("'GEMINI_API_KEY' environment variable not set.")
    genai.configure(api_key=GEMINI_API_KEY)
    generative_model = genai.GenerativeModel('gemini-1.5-flash-latest')
    print("✅ Gemini API configured successfully.")
except Exception as e:
    print(f"🔥 Error configuring Gemini API: {e}")
    generative_model = None


# --- 2. Reusable Classes for Analysis ---

class AdvancedFeatureExtractor:
    """Extracts linguistic, sentiment, and entity features from text."""
    def __init__(self):
        self.nlp = nlp
        self.sentiment_analyzer = SentimentIntensityAnalyzer()
        self.sensational_words = {
            'shocking', 'unbelievable', 'amazing', 'incredible', 'outrageous',
            'scandal', 'exposed', 'revealed', 'secret', 'hidden', 'truth',
            'must see', "you won't believe", 'exclusive', 'breaking', 'hate',
            'urgent', 'conspiracy', 'cover-up', 'undeniable'
        }

    def extract_all_features(self, text: str) -> pd.Series:
        """Processes a single text string and returns a pandas Series of features."""
        doc = self.nlp(text)
        pos_counts = Counter(token.pos_ for token in doc)
        num_words = len(doc) if len(doc) > 0 else 1

        # Linguistic Features
        features = {
            'readability_score': flesch_reading_ease(text),
            'capitalization_ratio': sum(1 for c in text if c.isupper()) / (len(text) + 1e-6),
            'sensationalism_ratio': sum(1 for word in doc if word.lower_ in self.sensational_words) / num_words,
        }

        # Sentiment Features
        vader_scores = self.sentiment_analyzer.polarity_scores(text)
        features['sentiment_score'] = vader_scores['compound']

        # Entity Features
        entities = doc.ents
        features['total_entities'] = len(entities)
        features['people_mentioned'] = sum(1 for ent in entities if ent.label_ == 'PERSON')
        features['organizations_mentioned'] = sum(1 for ent in entities if ent.label_ == 'ORG')

        return pd.Series(features)


class UnifiedAnalysisPipeline:
    """
    An improved pipeline that uses DistilBERT for primary prediction and advanced
    features as supplementary signals for a more robust analysis.
    """
    def __init__(self, model, tokenizer, feature_extractor, device):
        self.model = model
        self.tokenizer = tokenizer
        self.feature_extractor = feature_extractor
        self.device = device
        self.labels = ['Reliable', 'Unreliable']

    def _get_distilbert_prediction(self, text: str) -> dict:
        """Gets the core prediction from the fine-tuned DistilBERT model."""
        inputs = self.tokenizer(
            text, truncation=True, padding=True, max_length=512, return_tensors='pt'
        ).to(self.device)

        with torch.no_grad():
            outputs = self.model(**inputs)
            predictions = torch.softmax(outputs.logits, dim=-1)
            predicted_class_idx = torch.argmax(predictions, dim=-1).item()

        confidence = predictions[0][predicted_class_idx].item()
        label = self.labels[predicted_class_idx]

        return {
            "prediction_label": label,
            "prediction_confidence": float(f"{confidence:.4f}"),
            "probabilities": {
                "reliable": float(f"{predictions[0][0].item():.4f}"),
                "unreliable": float(f"{predictions[0][1].item():.4f}")
            }
        }

    def analyze(self, article_text: str) -> dict:
        """
        Analyzes an article text and returns a comprehensive dictionary of results.
        """
        if not article_text or len(article_text.split()) < 20:
            raise ValueError("Input text is too short for a meaningful analysis (min 20 words).")

        # Step 1: Get the primary prediction from the powerful DistilBERT model
        ml_prediction = self._get_distilbert_prediction(article_text)

        # Step 2: Extract advanced linguistic features for context and explanation
        linguistic_signals = self.feature_extractor.extract_all_features(article_text)

        # Step 3: Combine results into a single, comprehensive output
        analysis_context = {
            **ml_prediction,
            "linguistic_signals": {
                "sentiment_score": float(f"{linguistic_signals['sentiment_score']:.3f}"),
                "sensationalism_ratio": float(f"{linguistic_signals['sensationalism_ratio']:.3f}"),
                "readability_score": float(f"{linguistic_signals['readability_score']:.1f}"),
                "capitalization_ratio": float(f"{linguistic_signals['capitalization_ratio']:.3f}")
            },
            "entity_signals": {
                "total_entities": int(linguistic_signals['total_entities']),
                "people_mentioned": int(linguistic_signals['people_mentioned']),
                "organizations_mentioned": int(linguistic_signals['organizations_mentioned'])
            }
        }
        return analysis_context


def generate_explanation(analysis_context: dict, article_text: str) -> str:
    """
    Uses the Gemini model to generate a plain-language explanation based on the
    analysis signals from our improved ML pipeline.
    """
    if not generative_model:
        return "Generative explanation is unavailable. Please check the API key and configuration."

    context_str = json.dumps(analysis_context, indent=2)

    # This improved prompt guides the LLM to use linguistic signals as evidence
    # for the primary prediction, leading to a more accurate explanation.
    prompt = f"""
    You are an AI news analysis assistant. Your task is to provide a clear, neutral, and educational explanation for a news article's reliability prediction. You must base your explanation on the provided machine learning model's output.

    Here is the analysis data from my ML model:
    ```json
    {context_str}
    ```

    Here is the beginning of the article text:
    "{article_text[:600]}..."

    Based ONLY on the data above, generate a brief, easy-to-understand summary for the end-user. Structure your response with these sections:
    1.  **Overall Assessment:** Start with a single sentence stating the model's prediction and confidence (e.g., "Our analysis indicates this article is likely **Unreliable** with **98.7%** confidence.").
    2.  **Key Signals Detected:** Create a bulleted list explaining the specific signals from the data that support the prediction. Translate the data points into simple concepts.
        - If the prediction is **Unreliable**, look for signals like high `sensationalism_ratio` (> 0.02), high `capitalization_ratio` (> 0.05), or a very negative `sentiment_score` (< -0.5). Mention these as evidence.
        - If the prediction is **Reliable**, look for signals like low sensationalism, neutral sentiment, and a reasonable readability score.
        - Always mention the number of people or organizations if it's low (e.g., 0 or 1), as this can indicate a lack of verifiable sources.
    3.  **Recommendation:** Conclude with a neutral recommendation, such as "We recommend cross-referencing this information with established news sources."

    Do not invent reasons not present in the JSON data. Do not add any text before "Overall Assessment". Keep the tone helpful and direct.
    """
    try:
        response = generative_model.generate_content(prompt, generation_config={"temperature": 0.2})
        return response.text
    except Exception as e:
        return f"🔥 An error occurred while generating the explanation: {e}"


# --- Initialize Global Pipeline Instance ---
# This ensures the models are loaded only once when the application starts.
feature_extractor_instance = AdvancedFeatureExtractor()

unified_pipeline_instance = UnifiedAnalysisPipeline(
    model=distilbert_model,
    tokenizer=distilbert_tokenizer,
    feature_extractor=feature_extractor_instance,
    device=device
)

print("\n🚀 Unified Analysis Pipeline is initialized and ready.")