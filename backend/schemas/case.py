from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from .core import PoliceStationResponse, CrimeHeadBase, OfficerResponse

class CaseMasterBase(BaseModel):
    id: str
    fir_number: str
    status: str
    description: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    reported_at: datetime
    
class CaseMasterResponse(CaseMasterBase):
    station: Optional[PoliceStationResponse] = None
    crime_head: Optional[CrimeHeadBase] = None
    investigating_officer: Optional[OfficerResponse] = None
    
    class Config:
        from_attributes = True

class VictimBase(BaseModel):
    id: str
    name: str
    age: int
    gender: str

class AccusedBase(BaseModel):
    id: str
    name: str
    age: int
    gender: str
    status: str

class CaseDetailResponse(CaseMasterResponse):
    victims: List[VictimBase] = []
    accused_persons: List[AccusedBase] = []
    
    class Config:
        from_attributes = True
