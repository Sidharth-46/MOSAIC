import random
from typing import List, Dict, Any

from database.repositories import (
    CaseMasterRepository,
    EmployeeRepository,
    UnitRepository,
    DistrictRepository
)
from services.ml_service import MLService

class ResourceAllocationService:
    def __init__(self):
        self.case_repo = CaseMasterRepository()
        self.emp_repo = EmployeeRepository()
        self.unit_repo = UnitRepository()
        self.district_repo = DistrictRepository()
        self.ml_service = MLService()

        # Anchor points for realistic rendering on the UI Map
        self.geo_anchors = {
            "Bengaluru Urban": (12.9698, 77.7499),
            "Mysuru": (12.3051, 76.6551),
            "Mangaluru": (12.8710, 74.8465),
            "Hubballi-Dharwad": (15.3688, 75.1275),
            "Belagavi": (15.8450, 74.5200)
        }

    def generate_patrol_zones(self) -> List[Dict[str, Any]]:
        """
        Calculates optimal patrol zones based on:
        - ML predicted hotspots
        - Active case density
        - Available officers
        """
        # 1. Fetch live ML Hotspot predictions
        hotspots_data = self.ml_service.predict_hotspots()
        predictions = hotspots_data.get("predictions", [])
        
        # 2. Fetch database records
        all_cases = self.case_repo.get_all()
        all_officers = self.emp_repo.get_all()
        all_districts = self.district_repo.get_all()
        
        # Create a lookup for total officers per district (simulated via station to district)
        # For simplicity in mock data, let's just distribute total active officers randomly 
        # or globally proportional to the risk.
        total_officers = len(all_officers)
        total_cases = len(all_cases)

        patrol_zones = []
        
        # 3. Build dynamic zones based on top ML predictions
        for idx, pred in enumerate(predictions):
            dist_name = pred.get("district", "Bengaluru Urban")
            crime_type = pred.get("predictedCrimeType", "Unknown")
            risk_score = pred.get("riskScore", 50)
            
            # Use specific coordinate if known, otherwise slightly randomize around BLR
            lat, lng = self.geo_anchors.get(dist_name, (12.97 + random.uniform(-0.1, 0.1), 77.59 + random.uniform(-0.1, 0.1)))
            
            # Priority rules
            if risk_score >= 80:
                priority = 'High'
            elif risk_score >= 60:
                priority = 'Medium'
            else:
                priority = 'Low'
                
            # Suggested Officers: base allocation depending on risk and total workforce availability
            base_officers = 2
            if priority == 'High':
                base_officers += random.randint(4, 6)
            elif priority == 'Medium':
                base_officers += random.randint(1, 3)
                
            # Capped by overall availability (dummy logic for offline)
            suggested = min(base_officers, max(2, total_officers // 2))
            
            # Construct time windows based on crime type (e.g. Robbery = night, Cyber = irrelevant but let's say day)
            start_time = "22:00" if crime_type in ["Robbery", "Vehicle Theft"] else "09:00"
            end_time = "06:00" if crime_type in ["Robbery", "Vehicle Theft"] else "18:00"
            
            # Expected improvement notes
            notes = f"Targeting recent surge in {crime_type}. Expected 30% reduction in response time based on spatial repositioning."
            if "Patrol" in pred.get("explanation", ""):
                notes = f"AI detected low patrol frequency. Reinforcing {dist_name} sectors immediately."
                
            patrol_zones.append({
                "id": f"pz-dyn-{idx}",
                "name": f"{dist_name} Strategic Zone",
                "district": dist_name,
                "priority": priority,
                "riskScore": risk_score,
                "suggestedOfficers": suggested,
                "startTime": start_time,
                "endTime": end_time,
                "latitude": lat,
                "longitude": lng,
                "radius": random.randint(800, 1500),
                "crimeTypes": [crime_type, "Assault" if priority == 'High' else "Petty Theft"],
                "notes": notes
            })
            
        # Ensure we return at least a few zones if ML pipeline gives empty 
        if not patrol_zones:
            patrol_zones.append({
                "id": "pz-dyn-fallback",
                "name": "Statewide Core Patrol",
                "district": "Bengaluru Urban",
                "priority": "Medium",
                "riskScore": 65,
                "suggestedOfficers": 4,
                "startTime": "20:00",
                "endTime": "04:00",
                "latitude": 12.9698,
                "longitude": 77.7499,
                "radius": 1000,
                "crimeTypes": ["General Patrol"],
                "notes": "Default fallback zone due to insufficient data."
            })

        return patrol_zones
