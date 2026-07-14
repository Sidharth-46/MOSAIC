from pydantic import BaseModel
from typing import Optional, List

class DistrictBase(BaseModel):
    id: str
    name: str
    region: Optional[str] = None

class DistrictResponse(DistrictBase):
    pass

class PoliceStationBase(BaseModel):
    id: str
    name: str
    unit_id: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class PoliceStationResponse(PoliceStationBase):
    pass

class OfficerBase(BaseModel):
    id: str
    name: str
    badge_number: str
    rank: str
    station_id: str

class OfficerResponse(OfficerBase):
    pass

class CrimeGroupBase(BaseModel):
    id: str
    name: str

class CrimeHeadBase(BaseModel):
    id: str
    name: str
    group_id: str
