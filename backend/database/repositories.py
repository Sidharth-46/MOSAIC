from typing import TypeVar, Generic, Type, List, Dict, Any, Optional
from pydantic import BaseModel
from catalyst_db.client import get_catalyst_client

T = TypeVar("T", bound=BaseModel)

class BaseRepository(Generic[T]):
    def __init__(self, table_name: str, model: Type[T]):
        self.table_name = table_name
        self.model = model
        self.client = get_catalyst_client()

    def _map_to_model(self, record: Dict[str, Any]) -> T:
        """Map a Catalyst record dictionary to a Pydantic model."""
        # Catalyst returns data under the table name key like {"CaseMaster": {"ROWID": 123, ...}}
        data = record.get(self.table_name, record)
        # Ensure ROWID maps to the PK field if it exists in the data
        return self.model(**data)

    def get_all(self) -> List[T]:
        query = f"SELECT * FROM {self.table_name}"
        records = self.client.execute_query(query)
        return [self._map_to_model(r) for r in records]

    def get_by_id(self, rowid: int) -> Optional[T]:
        query = f"SELECT * FROM {self.table_name} WHERE ROWID = {rowid}"
        records = self.client.execute_query(query)
        if records:
            return self._map_to_model(records[0])
        return None

    def insert(self, entity: T) -> T:
        """Inserts a Pydantic model into the repository and returns the model with updated ROWID."""
        # Dump model, excluding unset/none fields
        data = entity.model_dump(exclude_none=True)
        inserted_data = self.client.insert_row(self.table_name, data)
        return self.model(**inserted_data)

# Specific Repositories for Master Data
from models.master import State, District, Court, Employee, Unit, CaseCategory, GravityOffence

class StateRepository(BaseRepository[State]):
    def __init__(self):
        super().__init__("State", State)

class DistrictRepository(BaseRepository[District]):
    def __init__(self):
        super().__init__("District", District)

class EmployeeRepository(BaseRepository[Employee]):
    def __init__(self):
        super().__init__("Employee", Employee)

class UnitRepository(BaseRepository[Unit]):
    def __init__(self):
        super().__init__("Unit", Unit)

# Specific Repositories for Crime and Case Data
from models.case import CaseMaster, Victim, Accused, ArrestSurrender

class CaseMasterRepository(BaseRepository[CaseMaster]):
    def __init__(self):
        super().__init__("CaseMaster", CaseMaster)

class VictimRepository(BaseRepository[Victim]):
    def __init__(self):
        super().__init__("Victim", Victim)

class AccusedRepository(BaseRepository[Accused]):
    def __init__(self):
        super().__init__("Accused", Accused)

class ArrestSurrenderRepository(BaseRepository[ArrestSurrender]):
    def __init__(self):
        super().__init__("ArrestSurrender", ArrestSurrender)

from models.crime_master import CrimeHead

class CrimeHeadRepository(BaseRepository[CrimeHead]):
    def __init__(self):
        super().__init__("CrimeHead", CrimeHead)

class CourtRepository(BaseRepository[Court]):
    def __init__(self):
        super().__init__("Court", Court)

from models.master import Act, Section
class ActRepository(BaseRepository[Act]):
    def __init__(self):
        super().__init__("Act", Act)

class SectionRepository(BaseRepository[Section]):
    def __init__(self):
        super().__init__("Section", Section)

from models.case import ChargesheetDetails, Evidence, ActSectionAssociation

class ChargesheetDetailsRepository(BaseRepository[ChargesheetDetails]):
    def __init__(self):
        super().__init__("ChargesheetDetails", ChargesheetDetails)

class EvidenceRepository(BaseRepository[Evidence]):
    def __init__(self):
        super().__init__("Evidence", Evidence)

class ActSectionAssociationRepository(BaseRepository[ActSectionAssociation]):
    def __init__(self):
        super().__init__("ActSectionAssociation", ActSectionAssociation)
