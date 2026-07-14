from typing import List, Dict, Any
from datetime import datetime, timedelta
import collections

try:
    import numpy as np
    from sklearn.cluster import DBSCAN
    ML_AVAILABLE = True
except ImportError:
    ML_AVAILABLE = False
    print("Warning: scikit-learn or numpy not installed. Falling back to mock hotspot clustering.")

class HotspotModel:
    """
    Machine Learning engine for detecting crime hotspots using spatial density clustering.
    Uses DBSCAN (Density-Based Spatial Clustering of Applications with Noise).
    """
    
    def __init__(self):
        self.is_loaded = True
        
    def _fallback_predict(self) -> List[Dict[str, Any]]:
        return [
            {
                "id": "pred-fallback-1",
                "area": "Simulated Cluster A",
                "district": "Bengaluru Urban",
                "predictedCrimeType": "Theft",
                "riskScore": 82,
                "confidence": 88,
                "explanation": "High clustering detected (Fallback mode: ML libraries missing).",
                "center": {"lat": 12.9716, "lng": 77.5946}
            }
        ]

    def predict_hotspots(self, cases_data: List[Dict[str, Any]], eps_km: float = 2.0, min_samples: int = 3) -> List[Dict[str, Any]]:
        """
        Executes DBSCAN clustering on case coordinates.
        eps_km: The maximum distance between two samples for one to be considered as in the neighborhood of the other.
        """
        if not cases_data:
            return []
            
        if not ML_AVAILABLE:
            return self._fallback_predict()
            
        # 1. Prepare Spatial Data
        coords = []
        valid_cases = []
        for case in cases_data:
            lat = case.get("latitude")
            lng = case.get("longitude")
            if lat and lng:
                coords.append([lat, lng])
                valid_cases.append(case)
                
        if len(coords) < min_samples:
            return []

        # Convert to numpy array for DBSCAN
        # Note: To use km for eps, we convert coordinates to radians and use Haversine metric
        X = np.radians(coords)
        kms_per_radian = 6371.0088
        epsilon = eps_km / kms_per_radian
        
        # 2. Run DBSCAN Clustering
        db = DBSCAN(eps=epsilon, min_samples=min_samples, algorithm='ball_tree', metric='haversine')
        db.fit(X)
        labels = db.labels_
        
        # 3. Analyze Clusters
        clusters = collections.defaultdict(list)
        for idx, label in enumerate(labels):
            if label != -1: # -1 means noise (unclustered)
                clusters[label].append(valid_cases[idx])
                
        hotspots = []
        # 4. Generate Predictions from Clusters
        for cluster_id, cluster_cases in clusters.items():
            # Calculate geometric center
            center_lat = np.mean([c.get("latitude") for c in cluster_cases])
            center_lng = np.mean([c.get("longitude") for c in cluster_cases])
            
            # Find dominant crime type
            crime_heads = [c.get("crime_head_ext") or c.get("crime_head_id", "Unknown") for c in cluster_cases]
            dominant_crime = max(set(crime_heads), key=crime_heads.count) if crime_heads else "Unknown"
            
            # Density / Risk Score calculation (heuristics based on cluster size vs radius)
            # Cap at 99
            risk_score = min(50 + (len(cluster_cases) * 5), 99)
            confidence = min(60 + (len(cluster_cases) * 3), 95)
            
            # Fetch district from first case
            district = cluster_cases[0].get("district_id", "Unknown District")
            
            hotspots.append({
                "id": f"cluster-{cluster_id}-{datetime.now().timestamp()}",
                "area": f"Lat: {center_lat:.4f}, Lng: {center_lng:.4f}",
                "district": district,
                "predictedCrimeType": str(dominant_crime),
                "riskScore": int(risk_score),
                "confidence": int(confidence),
                "explanation": f"Algorithm identified a high-density cluster of {len(cluster_cases)} incidents, predominantly {dominant_crime}.",
                "center": {"lat": float(center_lat), "lng": float(center_lng)}
            })
            
        # Sort by risk score
        hotspots.sort(key=lambda x: x["riskScore"], reverse=True)
        return hotspots

hotspot_model = HotspotModel()
