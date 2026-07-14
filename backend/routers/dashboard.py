from fastapi import APIRouter, Query
from typing import Optional
from services.fir_service import FIRService

router = APIRouter()
fir_service = FIRService()

@router.get("")
async def get_dashboard(
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
    
    total_firs = len(cases)
    # Assuming CaseStatusID: 1=Open/Pending, 2=Closed/Charge Sheeted
    pending = sum(1 for c in cases if c.CaseStatusID == 1)
    charge_sheets = sum(1 for c in cases if c.CaseStatusID == 2)
    # Mocking arrests based on charge sheets for demo since we don't fetch all arrests per case yet
    arrests = int(charge_sheets * 0.8)
    
    # Calculate some trends (mock trend calculation for now to keep frontend happy)
    kpis = [
        { "label": 'Registered FIRs', "value": f"{total_firs:,}", "change": 5.0, "changeLabel": 'vs last month', "icon": 'FileText', "trend": 'up' },
        { "label": 'Pending Investigations', "value": f"{pending:,}", "change": -2.1, "changeLabel": 'vs last month', "icon": 'Clock', "trend": 'down' },
        { "label": 'Charge Sheets Filed', "value": f"{charge_sheets:,}", "change": 1.5, "changeLabel": 'vs last month', "icon": 'CheckCircle', "trend": 'up' },
        { "label": 'Arrests Made', "value": f"{arrests:,}", "change": 3.0, "changeLabel": 'vs last month', "icon": 'Users', "trend": 'up' },
        { "label": 'Active Hotspots', "value": '12', "change": -2, "changeLabel": 'vs last week', "icon": 'Flame', "trend": 'down' },
        { "label": 'Average Investigation Time', "value": '42 days', "change": -4.5, "changeLabel": 'vs last quarter', "icon": 'Clock', "trend": 'down' }
    ]
    
    return {"kpis": kpis}
