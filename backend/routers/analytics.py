from fastapi import APIRouter
from typing import Dict, Any
import random

router = APIRouter()

from fastapi import APIRouter, Query
from typing import Optional
from services.fir_service import FIRService
from services.master_service import MasterDataService
from collections import defaultdict
import random # For fallback generation

router = APIRouter()
fir_service = FIRService()
master_service = MasterDataService()

@router.get("")
async def get_analytics(
    district_id: Optional[int] = Query(None),
    station_id: Optional[int] = Query(None),
    crime_head_id: Optional[int] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    status_id: Optional[int] = Query(None)
):
    cases = fir_service.get_filtered_cases(
        district_id=district_id,
        station_id=station_id,
        crime_head_id=crime_head_id,
        start_date=start_date,
        end_date=end_date,
        status_id=status_id
    )

    # Resolve Crime Heads for mapping names
    crime_heads_map = {ch.CrimeHeadID: ch.CrimeGroupName for ch in master_service.get_all_crime_heads()}
    
    # 1. Category Data
    cat_counts = defaultdict(int)
    for c in cases:
        ch_name = crime_heads_map.get(c.CrimeMajorHeadID, "Others")
        cat_counts[ch_name] += 1
    
    total_cases = len(cases) or 1
    colors = ['hsl(210, 100%, 56%)', 'hsl(0, 72%, 51%)', 'hsl(280, 70%, 55%)', 'hsl(40, 90%, 55%)', 'hsl(180, 70%, 45%)', 'hsl(215, 20%, 35%)']
    
    categoryData = []
    for idx, (name, count) in enumerate(sorted(cat_counts.items(), key=lambda x: x[1], reverse=True)[:6]):
        categoryData.append({
            "name": name,
            "value": count,
            "percentage": int((count / total_cases) * 100),
            "color": colors[idx % len(colors)]
        })
    
    if not categoryData:
        categoryData = [{ "name": 'No Data', "value": 1, "percentage": 100, "color": 'hsl(215, 20%, 35%)' }]

    # 2. Hourly Data
    hourly_counts = defaultdict(int)
    for c in cases:
        if c.CrimeRegisteredDate:
            hourly_counts[c.CrimeRegisteredDate.hour] += 1
            
    hourlyData = []
    for i in range(24):
        hourlyData.append({"hour": f"{str(i).zfill(2)}:00", "count": hourly_counts.get(i, 0)})

    # 3. Trend Data (Mocking month distribution of total cases for demonstration)
    months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    trendData = []
    base_val = len(cases) // 12
    for m in months:
        val = base_val + random.randint(-base_val//2, base_val) if base_val > 10 else random.randint(5, 50)
        trendData.append({
            "month": m,
            "total": val,
            "assault": int(val * 0.2),
            "burglary": int(val * 0.15)
        })

    # 4. District Stats
    district_counts = defaultdict(lambda: {"resolved": 0, "pending": 0})
    units_map = {u.UnitID: u.DistrictID for u in master_service.get_all_police_units()}
    dist_map = {d.DistrictID: d.DistrictName for d in master_service.get_all_districts()}
    
    for c in cases:
        did = units_map.get(c.PoliceStationID)
        dname = dist_map.get(did, "Unknown")
        if c.CaseStatusID == 1:
            district_counts[dname]["pending"] += 1
        else:
            district_counts[dname]["resolved"] += 1
            
    districtStats = []
    for dname, stats in district_counts.items():
        districtStats.append({
            "district": dname,
            "totalCrimes": stats["resolved"] + stats["pending"],
            "resolved": stats["resolved"],
            "pending": stats["pending"]
        })
        
    if not districtStats:
        districtStats = [{ "district": 'No Data', "totalCrimes": 0, "resolved": 0, "pending": 0 }]

    # Provide placeholders for seasonal and weekly data for now
    seasonalData = [
        { "season": 'Q1 (Jan-Mar)', "violent": 935, "property": 755, "cyber": 320 },
        { "season": 'Q2 (Apr-Jun)', "violent": 1010, "property": 845, "cyber": 365 },
        { "season": 'Q3 (Jul-Sep)', "violent": 1090, "property": 880, "cyber": 410 },
        { "season": 'Q4 (Oct-Dec)', "violent": 1145, "property": 945, "cyber": 450 }
    ]
    
    weeklyData = [
        { "day": 'Mon', "morning": 120, "afternoon": 145, "evening": 180, "night": 85 },
        { "day": 'Tue', "morning": 115, "afternoon": 135, "evening": 165, "night": 80 },
        { "day": 'Wed', "morning": 125, "afternoon": 140, "evening": 170, "night": 90 },
        { "day": 'Thu', "morning": 130, "afternoon": 150, "evening": 185, "night": 95 },
        { "day": 'Fri', "morning": 145, "afternoon": 170, "evening": 220, "night": 120 },
        { "day": 'Sat', "morning": 110, "afternoon": 185, "evening": 250, "night": 150 },
        { "day": 'Sun', "morning": 90, "afternoon": 150, "evening": 210, "night": 130 }
    ]

    return {
        "categoryData": categoryData,
        "hourlyData": hourlyData,
        "trendData": trendData,
        "districtStats": districtStats,
        "seasonalData": seasonalData,
        "weeklyData": weeklyData
    }
