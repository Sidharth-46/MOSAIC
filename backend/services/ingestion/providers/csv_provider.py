import csv
import os
from typing import List, Dict, Any, Optional
from datetime import datetime
from .base import IngestionProvider

class CSVProvider(IngestionProvider):
    """
    Reads data from historical CSV files located in a specified directory.
    Useful for batch imports of legacy records.
    """
    
    def __init__(self, data_dir: str = "/tmp/mosaic_data"):
        self.data_dir = data_dir

    def _read_csv(self, filename: str, since: Optional[datetime] = None, date_col: str = None) -> List[Dict[str, Any]]:
        filepath = os.path.join(self.data_dir, filename)
        if not os.path.exists(filepath):
            return []
            
        results = []
        with open(filepath, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if since and date_col and row.get(date_col):
                    try:
                        row_date = datetime.strptime(row[date_col], '%Y-%m-%d %H:%M:%S')
                        if row_date <= since:
                            continue
                    except ValueError:
                        pass
                results.append(row)
        return results

    def fetch_districts(self, since: Optional[datetime] = None) -> List[Dict[str, Any]]:
        return self._read_csv("districts.csv")

    def fetch_police_units(self, since: Optional[datetime] = None) -> List[Dict[str, Any]]:
        return self._read_csv("police_units.csv")

    def fetch_police_stations(self, since: Optional[datetime] = None) -> List[Dict[str, Any]]:
        return self._read_csv("police_stations.csv")

    def fetch_officers(self, since: Optional[datetime] = None) -> List[Dict[str, Any]]:
        return self._read_csv("officers.csv")

    def fetch_cases(self, since: Optional[datetime] = None) -> List[Dict[str, Any]]:
        return self._read_csv("cases.csv", since=since, date_col="reported_at")

    def fetch_victims(self, since: Optional[datetime] = None) -> List[Dict[str, Any]]:
        return self._read_csv("victims.csv")

    def fetch_accused(self, since: Optional[datetime] = None) -> List[Dict[str, Any]]:
        return self._read_csv("accused.csv")

    def fetch_arrests(self, since: Optional[datetime] = None) -> List[Dict[str, Any]]:
        return self._read_csv("arrests.csv", since=since, date_col="arrest_date")

    def fetch_evidence(self, since: Optional[datetime] = None) -> List[Dict[str, Any]]:
        return self._read_csv("evidence.csv", since=since, date_col="collected_at")

    def fetch_chargesheets(self, since: Optional[datetime] = None) -> List[Dict[str, Any]]:
        return self._read_csv("chargesheets.csv", since=since, date_col="filed_date")
