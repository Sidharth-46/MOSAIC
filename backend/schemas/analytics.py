from pydantic import BaseModel
from typing import List, Optional

class KPICard(BaseModel):
    label: str
    value: str
    change: float
    changeLabel: str
    icon: str
    trend: str

class DashboardResponse(BaseModel):
    kpis: List[KPICard]

class CategoryData(BaseModel):
    name: str
    value: int
    percentage: float
    color: str

class HourlyData(BaseModel):
    hour: str
    count: int

class TrendData(BaseModel):
    month: str
    total: int
    theft: Optional[int] = 0
    assault: Optional[int] = 0
    robbery: Optional[int] = 0

class DistrictData(BaseModel):
    district: str
    totalCrimes: int
    resolved: int
    pending: int

class AnalyticsResponse(BaseModel):
    trends: List[TrendData]
    districts: List[DistrictData]
    categories: List[CategoryData]
    hourly: List[HourlyData]

class MapMarker(BaseModel):
    id: str
    latitude: float
    longitude: float
    crimeHead: str
    crimeGroup: str
    district: str

class MapResponse(BaseModel):
    markers: List[MapMarker]

class Node(BaseModel):
    id: str
    type: str
    label: str

class Link(BaseModel):
    source: str
    target: str
    label: str
    strength: float

class GraphResponse(BaseModel):
    nodes: List[Node]
    links: List[Link]
