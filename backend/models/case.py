from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CaseMaster(BaseModel):
    CaseMasterID: Optional[int] = None
    CrimeNo: str
    CaseNo: Optional[str] = None
    CrimeRegisteredDate: Optional[datetime] = None
    PolicePersonID: int # FK -> Employee
    PoliceStationID: int # FK -> Unit
    CaseCategoryID: int # FK -> CaseCategory
    GravityOffenceID: int # FK -> GravityOffence
    CrimeMajorHeadID: int # FK -> CrimeHead
    CrimeMinorHeadID: int # FK -> CrimeSubHead
    CaseStatusID: int # FK -> CaseStatusMaster
    CourtID: Optional[int] = None # FK -> Court

class ComplainantDetails(BaseModel):
    ComplainantID: Optional[int] = None
    CaseMasterID: int # FK -> CaseMaster
    ComplainantName: Optional[str] = None
    AgeYear: Optional[int] = None
    OccupationID: Optional[int] = None # FK -> OccupationMaster
    ReligionID: Optional[int] = None # FK -> ReligionMaster
    CasteID: Optional[int] = None # FK -> CasteMaster
    GenderID: Optional[int] = None

class Victim(BaseModel):
    VictimMasterID: Optional[int] = None
    CaseMasterID: int # FK -> CaseMaster
    VictimName: Optional[str] = None
    AgeYear: Optional[int] = None
    GenderID: Optional[int] = None
    VictimPolice: Optional[str] = None

class Accused(BaseModel):
    AccusedMasterID: Optional[int] = None
    CaseMasterID: int # FK -> CaseMaster
    AccusedName: Optional[str] = None
    AgeYear: Optional[int] = None
    GenderID: Optional[int] = None
    PersonID: Optional[str] = None

class ArrestSurrender(BaseModel):
    ArrestSurrenderID: Optional[int] = None
    CaseMasterID: int # FK -> CaseMaster
    ArrestSurrenderTypeID: Optional[int] = None
    ArrestSurrenderDate: Optional[datetime] = None
    ArrestSurrenderStateId: Optional[int] = None # FK -> State
    ArrestSurrenderDistrictId: Optional[int] = None # FK -> District
    PoliceStationID: Optional[int] = None # FK -> Unit
    IOID: Optional[int] = None # FK -> Employee
    CourtID: Optional[int] = None # FK -> Court
    AccusedMasterID: int # FK -> Accused
    IsAccused: Optional[bool] = None
    IsComplainantAccused: Optional[bool] = None

class ActSectionAssociation(BaseModel):
    ActSectionAssociationID: Optional[int] = None # ROWID
    CaseMasterID: int # FK -> CaseMaster
    ActID: int # FK -> Act
    SectionID: int # FK -> Section
    ActOrderID: Optional[int] = None
    SectionOrderID: Optional[int] = None

class ChargesheetDetails(BaseModel):
    CSID: Optional[int] = None
    CaseMasterID: int # FK -> CaseMaster
    csdate: Optional[datetime] = None
    cstype: Optional[str] = None
    PolicePersonID: Optional[int] = None # FK -> Employee

class Evidence(BaseModel):
    EvidenceID: Optional[int] = None
    CaseMasterID: int # FK -> CaseMaster
    EvidenceType: str
    EvidenceDescription: Optional[str] = None
    SeizedDate: Optional[datetime] = None
    Status: str = 'Collected'
