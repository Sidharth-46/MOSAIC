from pydantic import BaseModel
from typing import Optional

class CrimeHead(BaseModel):
    CrimeHeadID: Optional[int] = None
    CrimeGroupName: str
    Active: bool = True

class CrimeSubHead(BaseModel):
    CrimeSubHeadID: Optional[int] = None
    CrimeHeadID: int # FK
    CrimeHeadName: str
    SeqID: Optional[int] = None

class Act(BaseModel):
    ActID: Optional[int] = None # Maps to Catalyst ROWID
    ActCode: str # Enforced Unique in Catalyst
    ActDescription: Optional[str] = None
    ShortName: Optional[str] = None
    Active: bool = True

class Section(BaseModel):
    SectionID: Optional[int] = None # Maps to Catalyst ROWID
    SectionCode: str
    ActCode: int # FK -> Act
    SectionDescription: Optional[str] = None
    Active: bool = True

class CrimeHeadActSection(BaseModel):
    CrimeHeadActSectionID: Optional[int] = None # ROWID
    CrimeHeadID: int # FK
    ActCode: int # FK -> Act
    SectionCode: str
