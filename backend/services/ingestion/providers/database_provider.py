from typing import List, Dict, Any, Optional
from datetime import datetime
from sqlalchemy import create_engine, text
from .base import IngestionProvider

class DatabaseProvider(IngestionProvider):
    """
    Connects to a legacy relational database (e.g., CCTNS Oracle/PostgreSQL replica).
    Executes raw SQL queries to fetch incremental updates.
    """
    
    def __init__(self, connection_string: str = "sqlite:///:memory:"):
        self.engine = create_engine(connection_string)

    def _fetch_query(self, query: str, since: Optional[datetime] = None) -> List[Dict[str, Any]]:
        try:
            with self.engine.connect() as conn:
                if since:
                    # Append since clause for incremental fetch
                    # Note: This is simplified. Real queries need proper WHERE clauses.
                    query = f"{query} WHERE updated_at > :since"
                    result = conn.execute(text(query), {"since": since})
                else:
                    result = conn.execute(text(query))
                    
                return [dict(row._mapping) for row in result]
        except Exception as e:
            print(f"Database Provider Error: {e}")
            return []

    def fetch_districts(self, since: Optional[datetime] = None) -> List[Dict[str, Any]]:
        return self._fetch_query("SELECT * FROM legacy_districts", since)

    def fetch_police_units(self, since: Optional[datetime] = None) -> List[Dict[str, Any]]:
        return self._fetch_query("SELECT * FROM legacy_police_units", since)

    def fetch_police_stations(self, since: Optional[datetime] = None) -> List[Dict[str, Any]]:
        return self._fetch_query("SELECT * FROM legacy_police_stations", since)

    def fetch_officers(self, since: Optional[datetime] = None) -> List[Dict[str, Any]]:
        return self._fetch_query("SELECT * FROM legacy_officers", since)

    def fetch_cases(self, since: Optional[datetime] = None) -> List[Dict[str, Any]]:
        return self._fetch_query("SELECT * FROM legacy_fir_master", since)

    def fetch_victims(self, since: Optional[datetime] = None) -> List[Dict[str, Any]]:
        return self._fetch_query("SELECT * FROM legacy_victims", since)

    def fetch_accused(self, since: Optional[datetime] = None) -> List[Dict[str, Any]]:
        return self._fetch_query("SELECT * FROM legacy_accused", since)

    def fetch_arrests(self, since: Optional[datetime] = None) -> List[Dict[str, Any]]:
        return self._fetch_query("SELECT * FROM legacy_arrests", since)

    def fetch_evidence(self, since: Optional[datetime] = None) -> List[Dict[str, Any]]:
        return self._fetch_query("SELECT * FROM legacy_evidence", since)

    def fetch_chargesheets(self, since: Optional[datetime] = None) -> List[Dict[str, Any]]:
        return self._fetch_query("SELECT * FROM legacy_chargesheets", since)
