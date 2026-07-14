from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class State(BaseModel):
    StateID: Optional[int] = None # Maps to Catalyst ROWID
    StateName: str
    NationalityID: Optional[int] = None
    Active: bool = True

class District(BaseModel):
    DistrictID: Optional[int] = None
    DistrictName: str
    StateID: int # FK
    Active: bool = True

class UnitType(BaseModel):
    UnitTypeID: Optional[int] = None
    UnitTypeName: str
    CityDistState: Optional[str] = None
    Hierarchy: Optional[int] = None
    Active: bool = True

class Unit(BaseModel):
    UnitID: Optional[int] = None
    UnitName: str
    TypeID: int # FK
    ParentUnit: Optional[int] = None # FK
    NationalityID: Optional[int] = None
    StateID: int # FK
    DistrictID: int # FK
    Active: bool = True

class Rank(BaseModel):
    RankID: Optional[int] = None
    RankName: str
    Hierarchy: Optional[int] = None
    Active: bool = True

class Designation(BaseModel):
    DesignationID: Optional[int] = None
    DesignationName: str
    Active: bool = True
    SortOrder: Optional[int] = None

class Employee(BaseModel):
    EmployeeID: Optional[int] = None
    DistrictID: int # FK
    UnitID: int # FK
    RankID: int # FK
    DesignationID: int # FK
    KGID: Optional[str] = None
    FirstName: str
    EmployeeDOB: Optional[datetime] = None
    GenderID: Optional[int] = None
    BloodGroupID: Optional[int] = None
    PhysicallyChallenged: Optional[bool] = None
    AppointmentDate: Optional[datetime] = None

class Court(BaseModel):
    CourtID: Optional[int] = None
    CourtName: str
    DistrictID: int # FK
    StateID: int # FK
    Active: bool = True

class CaseCategory(BaseModel):
    CaseCategoryID: Optional[int] = None
    LookupValue: str

class GravityOffence(BaseModel):
    GravityOffenceID: Optional[int] = None
    LookupValue: str

class CaseStatusMaster(BaseModel):
    CaseStatusID: Optional[int] = None
    CaseStatusName: str

class CasteMaster(BaseModel):
    caste_master_id: Optional[int] = None
    caste_master_name: str

class ReligionMaster(BaseModel):
    ReligionID: Optional[int] = None
    ReligionName: str

class OccupationMaster(BaseModel):
    OccupationID: Optional[int] = None
    OccupationName: str

class Act(BaseModel):
    ActID: Optional[int] = None
    ActName: str
    Active: bool = True

class Section(BaseModel):
    SectionID: Optional[int] = None
    ActID: int # FK
    SectionName: str
    SectionDescription: Optional[str] = None
    Active: bool = True
