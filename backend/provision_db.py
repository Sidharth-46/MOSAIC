import os
import zcatalyst_sdk
import sys

# Ensure backend directory is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from services.ingestion.providers.mock_provider import MockProvider
from services.ingestion.transformer import Transformer

def provision_mock_data():
    app = zcatalyst_sdk.initialize()
    datastore = app.datastore()
    
    provider = MockProvider()
    transformer = Transformer()
    
    print("Provisioning Mock Data to Catalyst Datastore...")
    
    # 1. Districts
    districts = transformer.transform_batch("district", provider.fetch_districts())
    try:
        datastore.table("District").insert_rows(districts)
        print(f"Inserted {len(districts)} districts.")
    except Exception as e:
        print(f"Failed to insert districts: {e}")
        
    # 2. Units
    units = transformer.transform_batch("unit", provider.fetch_police_units())
    try:
        datastore.table("PoliceUnit").insert_rows(units)
        print(f"Inserted {len(units)} units.")
    except Exception as e:
        print(f"Failed to insert units: {e}")
        
    # 3. Stations
    stations = transformer.transform_batch("station", provider.fetch_police_stations())
    try:
        datastore.table("PoliceStation").insert_rows(stations)
        print(f"Inserted {len(stations)} stations.")
    except Exception as e:
        print(f"Failed to insert stations: {e}")
        
    print("Mock data provisioning completed (or skipped if tables are missing).")

if __name__ == "__main__":
    provision_mock_data()
