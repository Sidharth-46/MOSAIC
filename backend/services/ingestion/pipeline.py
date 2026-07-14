from datetime import datetime
from typing import Dict, Any, List

from .providers.base import IngestionProvider
from .providers.mock_provider import MockProvider
from .providers.csv_provider import CSVProvider
from .providers.api_provider import APIProvider
from .providers.database_provider import DatabaseProvider
from .transformer import Transformer
from .validation import Validator

import sys
import os
# Ensure backend modules are accessible
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from config import settings
from models.case import CaseMaster
from models.master import Employee, Unit, District

class DataIngestionPipeline:
    """
    Orchestrates the Production-Grade Data Ingestion Pipeline:
    DataSource -> Transformer -> Validation -> Catalyst Data Store
    """
    
    def __init__(self):
        self.provider: IngestionProvider = self._get_provider()
        self.transformer = Transformer()
        self.validator = Validator()
        self.last_sync_time = None 
        
    def _get_provider(self) -> IngestionProvider:
        provider_name = getattr(settings, "INGESTION_PROVIDER", "mock").lower()
        
        if provider_name == "mock":
            return MockProvider()
        elif provider_name == "csv":
            return CSVProvider()
        elif provider_name == "api":
            return APIProvider()
        elif provider_name == "database":
            return DatabaseProvider()
        else:
            raise ValueError(f"Unknown Ingestion Provider: {provider_name}")

    def _push_to_catalyst(self, table_name: str, valid_data: List[Dict[str, Any]]):
        """Mock push to Catalyst (this would use zcatalyst_sdk in production)."""
        if not valid_data:
            return
        print(f"Pushed {len(valid_data)} valid records to Catalyst Data Store table: {table_name}")
        # zcatalyst_sdk.initialize().datastore().table(table_name).insert_rows(valid_data)

    def trigger_analytics_refresh(self):
        print("Triggering Analytics Cache Refresh...")

    def trigger_prediction_refresh(self):
        print("Triggering Prediction Models Refresh...")

    def trigger_search_index_refresh(self):
        print("Triggering Search Index Refresh...")

    def run_pipeline(self):
        print(f"Starting Data Ingestion Pipeline using provider: {self.provider.__class__.__name__}")
        
        # 1. DataSource (Fetch)
        raw_districts = self.provider.fetch_districts(since=self.last_sync_time)
        raw_units = self.provider.fetch_police_units(since=self.last_sync_time)
        raw_stations = self.provider.fetch_police_stations(since=self.last_sync_time)
        raw_officers = self.provider.fetch_officers(since=self.last_sync_time)
        raw_cases = self.provider.fetch_cases(since=self.last_sync_time)
        
        # 2. Transformer & 3. Validation -> 4. Load
        if raw_districts:
            transformed = self.transformer.transform_batch("district", raw_districts)
            valid, invalid = self.validator.validate_batch(District, transformed)
            self._push_to_catalyst("District", valid)

        if raw_units or raw_stations:
            all_raw_units = (raw_units or []) + (raw_stations or [])
            # In a real scenario, we might distinguish stations from units if they have different transformers
            # Here we just use the transformers based on what they are. 
            # Our mock provider returns units and stations separately.
            if raw_units:
                transformed_u = self.transformer.transform_batch("unit", raw_units)
                valid_u, _ = self.validator.validate_batch(Unit, transformed_u)
                self._push_to_catalyst("Unit", valid_u)
            if raw_stations:
                transformed_s = self.transformer.transform_batch("station", raw_stations)
                valid_s, _ = self.validator.validate_batch(Unit, transformed_s)
                self._push_to_catalyst("Unit", valid_s)

        if raw_officers:
            transformed = self.transformer.transform_batch("officer", raw_officers)
            valid, invalid = self.validator.validate_batch(Employee, transformed)
            self._push_to_catalyst("Employee", valid)
            
        if raw_cases:
            transformed = self.transformer.transform_batch("case", raw_cases)
            valid, invalid = self.validator.validate_batch(CaseMaster, transformed)
            self._push_to_catalyst("CaseMaster", valid)

        # Post-Sync Hooks
        if raw_cases or raw_officers:
            self.trigger_analytics_refresh()
            self.trigger_prediction_refresh()
            self.trigger_search_index_refresh()
            
        # Update sync time
        self.last_sync_time = datetime.now()
        print(f"Pipeline execution complete. Next sync will fetch records modified after {self.last_sync_time}")

if __name__ == "__main__":
    service = DataIngestionPipeline()
    service.run_pipeline()
