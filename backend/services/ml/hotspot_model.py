from typing import List, Dict, Any
from datetime import datetime, timedelta

class HotspotModel:
    """
    Mocked Machine Learning engine for detecting crime hotspots.
    """
    
    def __init__(self):
        self.is_loaded = True
        
    def predict_hotspots(self, cases_data: List[Dict[str, Any]], eps_km: float = 2.0, min_samples: int = 3) -> List[Dict[str, Any]]:
        return [
            {
                "id": f"pred-fallback-{datetime.now().timestamp()}",
                "area": "Simulated Cluster A",
                "district": "Bengaluru Urban",
                "predictedCrimeType": "Theft",
                "riskScore": 82,
                "confidence": 88,
                "explanation": "High clustering detected (ML mocked due to Catalyst limits).",
                "center": {"lat": 12.9716, "lng": 77.5946}
            }
        ]

hotspot_model = HotspotModel()
