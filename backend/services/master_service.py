from typing import List, Optional, Any
from models.master import State, District, Employee, Unit
from database.repositories import (
    StateRepository,
    DistrictRepository,
    EmployeeRepository,
    UnitRepository
)

class MasterDataService:
    def __init__(self):
        self.state_repo = StateRepository()
        self.district_repo = DistrictRepository()
        self.employee_repo = EmployeeRepository()
        self.unit_repo = UnitRepository()

    def get_all_districts(self) -> List[District]:
        return self.district_repo.get_all()

    def get_district_by_id(self, district_id: int) -> Optional[District]:
        return self.district_repo.get_by_id(district_id)

    def get_all_police_units(self) -> List[Unit]:
        return self.unit_repo.get_all()
    
    def get_all_employees(self) -> List[Employee]:
        return self.employee_repo.get_all()
        
    def get_all_crime_heads(self) -> List[Any]:
        # Deferred import to prevent circular dependency
        from database.repositories import CrimeHeadRepository
        return CrimeHeadRepository().get_all()
