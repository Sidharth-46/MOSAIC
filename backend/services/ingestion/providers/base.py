from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from datetime import datetime

class IngestionProvider(ABC):
    """
    Abstract Base Class for all data ingestion providers.
    All providers MUST implement these methods and return standardized lists of dictionaries.
    The dictionary keys must match the external schema, which will later be mapped by the Transformer.
    """
    
    @abstractmethod
    def fetch_districts(self, since: Optional[datetime] = None) -> List[Dict[str, Any]]:
        """Fetch district records."""
        pass
        
    @abstractmethod
    def fetch_police_units(self, since: Optional[datetime] = None) -> List[Dict[str, Any]]:
        """Fetch police unit records."""
        pass
        
    @abstractmethod
    def fetch_police_stations(self, since: Optional[datetime] = None) -> List[Dict[str, Any]]:
        """Fetch police station records."""
        pass

    @abstractmethod
    def fetch_officers(self, since: Optional[datetime] = None) -> List[Dict[str, Any]]:
        """Fetch officer records."""
        pass
        
    @abstractmethod
    def fetch_cases(self, since: Optional[datetime] = None) -> List[Dict[str, Any]]:
        """Fetch CaseMaster (FIR) records."""
        pass
        
    @abstractmethod
    def fetch_victims(self, since: Optional[datetime] = None) -> List[Dict[str, Any]]:
        """Fetch Victim records."""
        pass
        
    @abstractmethod
    def fetch_accused(self, since: Optional[datetime] = None) -> List[Dict[str, Any]]:
        """Fetch Accused records."""
        pass
        
    @abstractmethod
    def fetch_arrests(self, since: Optional[datetime] = None) -> List[Dict[str, Any]]:
        """Fetch Arrest records."""
        pass
        
    @abstractmethod
    def fetch_evidence(self, since: Optional[datetime] = None) -> List[Dict[str, Any]]:
        """Fetch Evidence records."""
        pass
        
    @abstractmethod
    def fetch_chargesheets(self, since: Optional[datetime] = None) -> List[Dict[str, Any]]:
        """Fetch Chargesheet records."""
        pass
