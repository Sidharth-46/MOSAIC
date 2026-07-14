from typing import List, Optional
from models.case import CaseMaster, Victim, Accused, ArrestSurrender
from database.repositories import (
    CaseMasterRepository,
    VictimRepository,
    AccusedRepository,
    ArrestSurrenderRepository
)

class FIRService:
    def __init__(self):
        self.case_repo = CaseMasterRepository()
        self.victim_repo = VictimRepository()
        self.accused_repo = AccusedRepository()
        self.arrest_repo = ArrestSurrenderRepository()

    def get_all_cases(self) -> List[CaseMaster]:
        return self.case_repo.get_all()

    def get_case_by_id(self, case_id: int) -> Optional[CaseMaster]:
        return self.case_repo.get_by_id(case_id)
        
    def get_filtered_cases(
        self,
        district_id: Optional[int] = None,
        station_id: Optional[int] = None,
        crime_head_id: Optional[int] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        status_id: Optional[int] = None
    ) -> List[CaseMaster]:
        from datetime import datetime
        cases = self.get_all_cases()
        
        # In-memory filtering to support both MockProvider and Catalyst ZCQL gracefully
        filtered = []
        for case in cases:
            if station_id and case.PoliceStationID != station_id:
                continue
            if crime_head_id and case.CrimeMajorHeadID != crime_head_id:
                continue
            if status_id and case.CaseStatusID != status_id:
                continue
                
            # Date filtering
            if start_date or end_date:
                # Assuming CrimeRegisteredDate is datetime
                reg_date = case.CrimeRegisteredDate
                if reg_date:
                    if start_date:
                        sd = datetime.fromisoformat(start_date.replace('Z', '+00:00')) if 'T' in start_date else datetime.strptime(start_date, "%Y-%m-%d")
                        if reg_date < sd:
                            continue
                    if end_date:
                        ed = datetime.fromisoformat(end_date.replace('Z', '+00:00')) if 'T' in end_date else datetime.strptime(end_date, "%Y-%m-%d")
                        if reg_date > ed:
                            continue
                            
            # District filtering requires looking up station -> district
            if district_id:
                # We need to map PoliceStationID to DistrictID. We can fetch units.
                from services.master_service import MasterDataService
                master = MasterDataService()
                units = master.get_all_police_units()
                unit = next((u for u in units if u.UnitID == case.PoliceStationID), None)
                if not unit or unit.DistrictID != district_id:
                    continue
                    
            filtered.append(case)
            
        return filtered

    def get_case_victims(self, case_id: int) -> List[Victim]:
        # Typically requires a query with a where clause.
        # This is a stub for logic that will be implemented in the repo layer.
        all_victims = self.victim_repo.get_all()
        return [v for v in all_victims if v.CaseMasterID == case_id]

    def get_case_accused(self, case_id: int) -> List[Accused]:
        all_accused = self.accused_repo.get_all()
        return [a for a in all_accused if a.CaseMasterID == case_id]

    def get_case_arrests(self, case_id: int) -> List[ArrestSurrender]:
        all_arrests = self.arrest_repo.get_all()
        return [a for a in all_arrests if a.CaseMasterID == case_id]
