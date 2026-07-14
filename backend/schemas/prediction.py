from pydantic import BaseModel
from typing import List, Dict, Any

class HotspotCenter(BaseModel):
    lat: float
    lng: float

class HotspotPrediction(BaseModel):
    id: str
    area: str
    district: str
    predictedCrimeType: str
    riskScore: int
    confidence: int
    explanation: str
    center: HotspotCenter

class PredictionResponse(BaseModel):
    hotspots: List[HotspotPrediction]
