from fastapi import APIRouter
from typing import Dict, Any
from services.ml_service import MLService

router = APIRouter()
ml_service = MLService()

@router.get("")
async def get_predictions():
    # Automatically triggers training if not trained, then predicts and computes SHAP values
    return ml_service.predict_hotspots()
