from fastapi import APIRouter
from services.master_service import MasterDataService

router = APIRouter()
master_service = MasterDataService()

@router.get("/districts")
async def get_districts():
    districts = master_service.get_all_districts()
    return [{"id": d.DistrictID, "name": d.DistrictName} for d in districts]

@router.get("/police-stations")
async def get_police_stations():
    units = master_service.get_all_police_units()
    # Filter for stations if TypeID == 1, or just return all units
    stations = [u for u in units if u.TypeID == 1]
    if not stations:
        # Fallback in case TypeID wasn't exactly 1 for stations
        stations = units
    return [{"id": u.UnitID, "name": u.UnitName, "district_id": u.DistrictID} for u in stations]

@router.get("/crime-heads")
async def get_crime_heads():
    crime_heads = master_service.get_all_crime_heads()
    return [{"id": ch.CrimeHeadID, "name": ch.CrimeGroupName} for ch in crime_heads]
