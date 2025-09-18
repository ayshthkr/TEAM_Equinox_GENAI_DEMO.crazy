# main.py
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import Dict, Any
from dotenv import load_dotenv

# Load environment variables from a .env file (for GEMINI_API_KEY)
load_dotenv()

# Import the pre-initialized pipeline instances from pipeline.py
from pipeline import unified_pipeline_instance, generate_explanation

app = FastAPI(
    title="Advanced Fake News Detector API",
    description="An API that uses a fine-tuned Transformer model for fake news detection and a Generative AI for explanation.",
    version="2.0.0"
)

# --- Pydantic Models for API Request and Response ---
class ArticleRequest(BaseModel):
    text: str = Field(
        ...,
        min_length=100,
        description="The full text of the news article to be analyzed (minimum 100 characters)."
    )

class AnalysisResponse(BaseModel):
    ml_analysis: Dict[str, Any] = Field(..., description="The structured output from the machine learning model.")
    generative_explanation: str = Field(..., description="A human-readable explanation of the analysis.")

# --- Custom Exception Handler for Input Validation ---
@app.exception_handler(ValueError)
async def value_error_exception_handler(request: Request, exc: ValueError):
    """Handles ValueErrors, such as text being too short, and returns a 400 Bad Request."""
    return JSONResponse(
        status_code=400,
        content={"detail": f"Invalid Input: {str(exc)}"},
    )

# --- API Endpoints ---
@app.get("/", tags=["General"])
async def read_root():
    """A simple health check endpoint to confirm the API is running."""
    return {
        "status": "API is running",
        "model_device": unified_pipeline_instance.device.type
    }

@app.post("/analyze", response_model=AnalysisResponse, tags=["Analysis"])
async def analyze_article(request: ArticleRequest):
    """
    Analyzes a news article to determine its reliability and provides a detailed,
    AI-generated explanation of the key signals detected.
    """
    try:
        # Step 1: Get structured data from our robust ML pipeline
        ml_results = unified_pipeline_instance.analyze(request.text)

        # Step 2: Get the human-readable explanation from the Generative AI
        explanation = generate_explanation(ml_results, request.text)

        return AnalysisResponse(
            ml_analysis=ml_results,
            generative_explanation=explanation
        )
    except Exception as e:
        # Catch any other unexpected errors and return a 500 Internal Server Error
        print(f"ERROR: An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail="An internal server error occurred during analysis.")