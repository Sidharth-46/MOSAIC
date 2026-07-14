import zcatalyst_sdk
from typing import List, Dict, Any
from datetime import datetime, timedelta
import random

# For prototyping/fallback when Catalyst is not configured locally
from services.ingestion.providers.mock_provider import MockProvider

class CatalystClient:
    """
    Singleton wrapper for Zoho Catalyst Data Store queries using ZCQL.
    Includes a seamless fallback to local mock data if the environment 
    is not configured with Catalyst credentials, ensuring continuous prototyping.
    """
    _instance = None

    def __new__(cls, request=None):
        if cls._instance is None:
            cls._instance = super(CatalystClient, cls).__new__(cls)
            cls._instance.is_configured = False
            try:
                # Attempt to initialize Catalyst SDK
                if request:
                    cls._instance.app = zcatalyst_sdk.initialize(req=request)
                else:
                    cls._instance.app = zcatalyst_sdk.initialize()
                cls._instance.zcql = cls._instance.app.zcql()
                cls._instance.is_configured = True
            except Exception as e:
                print(f"Catalyst Client Error: {e}. Falling back to mock data.")
                cls._instance.mock_provider = MockProvider()
        return cls._instance

    def execute_query(self, query: str) -> List[Dict[str, Any]]:
        """Executes a ZCQL query against the Data Store."""
        if self.is_configured:
            try:
                return self.zcql.execute_query(query)
            except Exception as e:
                print(f"ZCQL Execution Error: {e}")
                raise e
        else:
            return self._mock_query(query)

    def insert_row(self, table_name: str, row_data: Dict[str, Any]) -> Dict[str, Any]:
        """Inserts a row into the Data Store."""
        if self.is_configured:
            try:
                # Assuming zcatalyst SDK usage for table row insertion
                table = self.app.datastore().table(table_name)
                return table.insert_row(row_data)
            except Exception as e:
                print(f"Catalyst Insert Error: {e}")
                return row_data
        else:
            # In-memory mock insertion (echoes back with a dummy ROWID)
            row_data["ROWID"] = random.randint(100000, 999999)
            print(f"[MOCK INSERT] {table_name}: {row_data}")
            return row_data

    def _mock_query(self, query: str) -> List[Dict[str, Any]]:
        """Fallback mock query engine for basic ZCQL prototyping."""
        from services.ingestion.transformer import Transformer
        transformer = Transformer()
        
        q = query.lower()
        if "casemaster" in q:
            return transformer.transform_batch("case", self.mock_provider.fetch_cases())
        elif "officer" in q:
            return transformer.transform_batch("officer", self.mock_provider.fetch_officers())
        elif "station" in q or "police_stations" in q or "unit" in q:
            units = transformer.transform_batch("unit", self.mock_provider.fetch_police_units())
            stations = transformer.transform_batch("station", self.mock_provider.fetch_police_stations())
            return units + stations
        elif "district" in q:
            return transformer.transform_batch("district", self.mock_provider.fetch_districts())
        elif "victim" in q:
            return transformer.transform_batch("victim", self.mock_provider.fetch_victims())
        elif "accused" in q:
            return transformer.transform_batch("accused", self.mock_provider.fetch_accused())
        elif "evidence" in q:
            return transformer.transform_batch("evidence", self.mock_provider.fetch_evidence())
        elif "chargesheet" in q:
            return transformer.transform_batch("chargesheet", self.mock_provider.fetch_chargesheets())
        elif "actsectionassociation" in q:
            return transformer.transform_batch("act_section", self.mock_provider.fetch_act_sections())
        elif "crimehead" in q:
            # Mock crime heads matching the ERD schema
            return [
                {"CrimeHeadID": 1, "CrimeGroupName": "Robbery", "Active": True},
                {"CrimeHeadID": 2, "CrimeGroupName": "Assault", "Active": True},
                {"CrimeHeadID": 3, "CrimeGroupName": "Burglary", "Active": True},
                {"CrimeHeadID": 4, "CrimeGroupName": "Fraud", "Active": True},
                {"CrimeHeadID": 5, "CrimeGroupName": "Vehicle Theft", "Active": True},
            ]
        elif "act" in q:
            return [
                {"ActID": transformer._resolve_lookup("acts", "BNS 2023"), "ActName": "BNS 2023", "Active": True},
                {"ActID": transformer._resolve_lookup("acts", "IPC 1860"), "ActName": "IPC 1860", "Active": True},
                {"ActID": transformer._resolve_lookup("acts", "NDPS Act"), "ActName": "NDPS Act", "Active": True}
            ]
        elif "section" in q:
            # Very simplistic section mocking
            return [{"SectionID": 1, "ActID": transformer._resolve_lookup("acts", "BNS 2023"), "SectionName": "Sec 100", "Active": True}]
        elif "court" in q:
            return [{"CourtID": 1, "CourtName": "District Court", "DistrictID": 1, "StateID": 1, "Active": True}]
        return []

def get_catalyst_client(request=None) -> CatalystClient:
    return CatalystClient(request=request)
