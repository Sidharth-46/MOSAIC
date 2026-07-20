from typing import List, Dict, Any
from datetime import datetime

class Transformer:
    """
    Transforms raw data from any IngestionProvider into the standardized 
    format required by the Karnataka Police ERD (and Catalyst Data Store).
    Resolves external identifiers into Catalyst ROWIDs.
    """
    
    def __init__(self):
        self._lookup_cache: Dict[str, Dict[str, int]] = {
            "states": {"KARNATAKA": 1}, # Mocking StateID=1 for Karnataka
            "districts": {},
            "units": {},
            "stations": {},
            "officers": {},
            "crime_heads": {"Robbery": 1, "Assault": 2, "Burglary": 3, "Fraud": 4, "Vehicle Theft": 5},
            "cases": {},
            "case_status": {"Open": 1, "Closed": 2},
            "unit_types": {"Station": 1, "Division": 2},
            "ranks": {"Inspector": 1, "Constable": 2},
            "designations": {"SHO": 1},
            "victims": {},
            "accused": {},
            "evidence": {},
            "chargesheets": {},
            "acts": {},
            "sections": {},
            "act_section_associations": {}
        }
        
    def _resolve_lookup(self, entity_type: str, ext_id: str) -> int:
        """
        Resolves an external ID to a Catalyst ROWID (int).
        Returns a mock ROWID if not found (for demonstration).
        """
        if not ext_id:
            return 1 # Fallback valid int for foreign keys
        if ext_id in self._lookup_cache[entity_type]:
            return self._lookup_cache[entity_type][ext_id]
        
        # Fallback mock ROWID generation
        mock_rowid = hash(ext_id) % 1000000 + 1000 # positive int
        self._lookup_cache[entity_type][ext_id] = mock_rowid
        return mock_rowid

    def transform_district(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        ext_id = raw_data.get("ext_id", "")
        return {
            "DistrictID": self._resolve_lookup("districts", ext_id) if ext_id else hash(raw_data.get("name", "Unknown")) % 1000 + 1,
            "DistrictName": raw_data.get("name", "Unknown District"),
            "StateID": self._lookup_cache["states"].get("KARNATAKA", 1),
            "Active": True
        }

    def transform_police_unit(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        ext_id = raw_data.get("ext_id", "")
        return {
            "UnitID": self._resolve_lookup("units", ext_id) if ext_id else hash(raw_data.get("name", "Unknown Unit")) % 1000 + 1,
            "UnitName": raw_data.get("name", "Unknown Unit"),
            "TypeID": self._lookup_cache["unit_types"].get("Division", 2),
            "StateID": self._lookup_cache["states"].get("KARNATAKA", 1),
            "DistrictID": self._resolve_lookup("districts", raw_data.get("district_ext_id")),
            "Active": True
        }

    def transform_police_station(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        ext_id = raw_data.get("ext_id", "")
        return {
            "UnitID": self._resolve_lookup("stations", ext_id) if ext_id else hash(raw_data.get("name", "Unknown Station")) % 1000 + 1,
            "UnitName": raw_data.get("name", "Unknown Station"),
            "TypeID": self._lookup_cache["unit_types"].get("Station", 1),
            "StateID": self._lookup_cache["states"].get("KARNATAKA", 1),
            "DistrictID": self._resolve_lookup("districts", raw_data.get("district_ext_id")) if raw_data.get("district_ext_id") else 1,
            "ParentUnit": self._resolve_lookup("units", raw_data.get("unit_ext_id")),
            "Active": True
        }

    def transform_officer(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "EmployeeID": self._resolve_lookup("officers", raw_data.get("ext_id")),
            "FirstName": raw_data.get("name", "Unknown"),
            "KGID": raw_data.get("badge", "UNKNOWN"),
            "RankID": self._lookup_cache["ranks"].get("Inspector", 1),
            "DesignationID": self._lookup_cache["designations"].get("SHO", 1),
            "UnitID": self._resolve_lookup("stations", raw_data.get("station_ext_id")),
            "DistrictID": 1
        }

    def transform_case(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        
        reported_at = raw_data.get("reported_at")
        if isinstance(reported_at, str):
            try:
                reported_at = datetime.strptime(reported_at, '%Y-%m-%d %H:%M:%S')
            except ValueError:
                reported_at = datetime.now()

        return {
            "CaseMasterID": self._resolve_lookup("cases", raw_data.get("ext_case_id")),
            "CrimeNo": raw_data.get("fir_number", "UNKNOWN"),
            "CrimeRegisteredDate": reported_at,
            "PoliceStationID": self._resolve_lookup("stations", raw_data.get("station_ext_id")),
            "PolicePersonID": self._resolve_lookup("officers", raw_data.get("officer_ext_id")),
            "CaseCategoryID": 1, # Mock FI Category
            "GravityOffenceID": 1, 
            "CrimeMajorHeadID": self._resolve_lookup("crime_heads", raw_data.get("crime_head_ext")),
            "CrimeMinorHeadID": 1,
            "CaseStatusID": self._lookup_cache["case_status"].get(raw_data.get("status", "Open"), 1),
            "CourtID": 1
        }

    def transform_victim(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "VictimMasterID": self._resolve_lookup("victims", raw_data.get("ext_victim_id")),
            "CaseMasterID": self._resolve_lookup("cases", raw_data.get("case_ext_id")),
            "VictimName": raw_data.get("name"),
            "AgeYear": raw_data.get("age"),
            "GenderID": 1 if raw_data.get("gender") == "Male" else 2
        }

    def transform_accused(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "AccusedMasterID": self._resolve_lookup("accused", raw_data.get("ext_accused_id")),
            "CaseMasterID": self._resolve_lookup("cases", raw_data.get("case_ext_id")),
            "AccusedName": raw_data.get("name"),
            "AgeYear": raw_data.get("age"),
            "GenderID": 1 if raw_data.get("gender") == "Male" else 2
        }

    def transform_evidence(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        seized_date = raw_data.get("seized_date")
        if isinstance(seized_date, str):
            try:
                seized_date = datetime.strptime(seized_date, '%Y-%m-%d %H:%M:%S')
            except ValueError:
                seized_date = datetime.now()

        return {
            "EvidenceID": self._resolve_lookup("evidence", raw_data.get("ext_evidence_id")),
            "CaseMasterID": self._resolve_lookup("cases", raw_data.get("case_ext_id")),
            "EvidenceType": raw_data.get("type"),
            "EvidenceDescription": raw_data.get("description"),
            "SeizedDate": seized_date,
            "Status": "Collected"
        }

    def transform_chargesheet(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        cs_date = raw_data.get("date")
        if isinstance(cs_date, str):
            try:
                cs_date = datetime.strptime(cs_date, '%Y-%m-%d %H:%M:%S')
            except ValueError:
                cs_date = datetime.now()

        return {
            "CSID": self._resolve_lookup("chargesheets", raw_data.get("ext_cs_id")),
            "CaseMasterID": self._resolve_lookup("cases", raw_data.get("case_ext_id")),
            "csdate": cs_date,
            "cstype": raw_data.get("type"),
            "PolicePersonID": self._resolve_lookup("officers", raw_data.get("officer_ext_id"))
        }

    def transform_act_section_assoc(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "ActSectionAssociationID": self._resolve_lookup("act_section_associations", raw_data.get("ext_assoc_id")),
            "CaseMasterID": self._resolve_lookup("cases", raw_data.get("case_ext_id")),
            "ActID": self._resolve_lookup("acts", raw_data.get("act_name")),
            "SectionID": self._resolve_lookup("sections", raw_data.get("section_name"))
        }

    def transform_batch(self, entity_type: str, raw_batch: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Applies transformation to a list of raw records."""
        transformers = {
            "district": self.transform_district,
            "unit": self.transform_police_unit,
            "station": self.transform_police_station,
            "officer": self.transform_officer,
            "case": self.transform_case,
            "victim": self.transform_victim,
            "accused": self.transform_accused,
            "evidence": self.transform_evidence,
            "chargesheet": self.transform_chargesheet,
            "act_section": self.transform_act_section_assoc
        }
        
        transform_func = transformers.get(entity_type)
        if not transform_func:
            raise ValueError(f"No transformer found for entity type: {entity_type}")
            
        return [transform_func(record) for record in raw_batch]
