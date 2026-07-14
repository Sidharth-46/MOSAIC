from fastapi import APIRouter
from typing import List, Dict, Any
import random
from services.fir_service import FIRService
from services.master_service import MasterDataService

router = APIRouter()
fir_service = FIRService()
master_service = MasterDataService()

def clamp_to_karnataka(lat: float, lng: float) -> tuple[float, float]:
    """Ensure coordinates strictly lie within Karnataka bounding box"""
    # Karnataka rough bounding box: Lat: [11.5, 18.5], Lng: [74.0, 78.5]
    lat = max(11.5, min(18.5, lat))
    lng = max(74.0, min(78.5, lng))
    return lat, lng

def generate_location(district_name: str) -> Dict[str, Any]:
    base_lat = 15.3173
    base_lng = 75.7139
    
    if 'Bengaluru' in district_name:
        base_lat, base_lng = 12.9716, 77.5946
    elif 'Mysuru' in district_name:
        base_lat, base_lng = 12.2958, 76.6394
    elif 'Mangaluru' in district_name:
        base_lat, base_lng = 12.9141, 74.8560
    elif 'Hubballi' in district_name or 'Dharwad' in district_name:
        base_lat, base_lng = 15.3647, 75.1240
    elif 'Belagavi' in district_name:
        base_lat, base_lng = 15.8497, 74.4977
    elif 'Kalaburagi' in district_name:
        base_lat, base_lng = 17.3297, 76.8343
    else:
        # Generate safely inside bounds
        base_lat = 12.0 + random.random() * 6.0
        base_lng = 74.5 + random.random() * 3.5

    # Add small variance
    final_lat = base_lat + (random.random() - 0.5) * 0.1
    final_lng = base_lng + (random.random() - 0.5) * 0.1
    
    # Strictly enforce coordinates constraint
    final_lat, final_lng = clamp_to_karnataka(final_lat, final_lng)

    return {
        "id": f"loc-{random.randint(1000,9999)}",
        "address": "Generated Address",
        "district": district_name,
        "policeUnit": district_name,
        "state": "Karnataka",
        "latitude": final_lat,
        "longitude": final_lng,
    }

def map_case_to_fir(case, masters: Dict[str, Any]) -> Dict[str, Any]:
    # Resolve names from masters
    ch = masters["crime_heads"].get(case.CrimeMajorHeadID, "Others")
    
    # Infer crime group based on head (mocking logic)
    crime_group = "Medium"
    if ch in ["Murder", "Kidnapping", "Robbery"]:
        crime_group = "Critical"
    elif ch in ["Assault", "Cybercrime"]:
        crime_group = "High"
        
    status = "Open"
    if case.CaseStatusID == 2:
        status = "Closed"
        
    station = masters["units"].get(case.PoliceStationID)
    district_name = "Unknown District"
    if station:
        district_name = masters["districts"].get(station.DistrictID, "Unknown District")
        
    officer_name = masters["employees"].get(case.PolicePersonID, "Unknown Officer")
    
    return {
        "id": f"case-{case.CaseMasterID or hash(case.CrimeNo)}",
        "firNumber": case.CrimeNo,
        "crimeHead": ch,
        "description": f"Incident recorded at {district_name}",
        "crimeGroup": crime_group,
        "status": status,
        "reportedAt": case.CrimeRegisteredDate.isoformat() + "Z" if case.CrimeRegisteredDate else "",
        "location": generate_location(district_name),
        "district": district_name,
        "suspects": [], # Fetched on demand or via mocked accused_repo
        "vehicles": [],
        "weapons": [],
        "investigatingOfficer": officer_name
    }

def fetch_live_firs(limit: int = 200) -> List[Dict[str, Any]]:
    # 1. Fetch live cases
    cases = fir_service.get_filtered_cases()
    
    # 2. Pre-fetch masters
    districts = {d.DistrictID: d.DistrictName for d in master_service.get_all_districts()}
    units = {u.UnitID: u for u in master_service.get_all_police_units()}
    crime_heads = {ch.CrimeHeadID: ch.CrimeGroupName for ch in master_service.get_all_crime_heads()}
    employees = {e.EmployeeID: e.EmployeeName for e in master_service.get_all_employees()}
    
    masters = {
        "districts": districts,
        "units": units,
        "crime_heads": crime_heads,
        "employees": employees
    }
    
    firs = []
    for c in cases:
        firs.append(map_case_to_fir(c, masters))
        
    # Ensure they are sorted by date
    firs.sort(key=lambda x: x.get("reportedAt", ""), reverse=True)
    return firs[:limit]

@router.get("")
async def get_cases(limit: int = 200):
    return fetch_live_firs(limit)

@router.get("/{case_id}")
async def get_case(case_id: str):
    firs = fetch_live_firs(1000)
    for fir in firs:
        if fir["id"] == case_id:
            return fir
    return {"error": "Not found"}
