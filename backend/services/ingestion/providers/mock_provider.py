import random
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from faker import Faker
from .base import IngestionProvider

fake = Faker('en_IN')

KARNATAKA_DISTRICTS = [
    "Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban"
]

class MockProvider(IngestionProvider):
    """
    Simulates fetching incremental data from a mock external system.
    Generates dummy data using Faker.
    """
    
    def __init__(self):
        self._cache_districts = [{"ext_id": f"D{i}", "name": d, "region": "KA"} for i, d in enumerate(KARNATAKA_DISTRICTS)]
        self._cache_units = [{"ext_id": f"U{i}", "name": f"{d['name']} Unit", "district_ext_id": d["ext_id"]} for i, d in enumerate(self._cache_districts)]
        self._cache_stations = [{"ext_id": f"S{i}", "name": f"{u['name']} PS", "unit_ext_id": u["ext_id"], "district_ext_id": u["district_ext_id"], "lat": 12.9, "lng": 77.5} for i, u in enumerate(self._cache_units)]
        self._cache_officers = [{"ext_id": f"O{i}", "name": fake.name(), "badge": f"KA-{random.randint(1000,9999)}", "rank": "Inspector", "station_ext_id": random.choice(self._cache_stations)["ext_id"]} for i in range(10)]
    
    def fetch_districts(self, since: Optional[datetime] = None) -> List[Dict[str, Any]]:
        return self._cache_districts if not since else []

    def fetch_police_units(self, since: Optional[datetime] = None) -> List[Dict[str, Any]]:
        return self._cache_units if not since else []

    def fetch_police_stations(self, since: Optional[datetime] = None) -> List[Dict[str, Any]]:
        return self._cache_stations if not since else []

    def fetch_officers(self, since: Optional[datetime] = None) -> List[Dict[str, Any]]:
        # Simulate new officers if since is provided (just returning empty for simplicity unless full refresh)
        return self._cache_officers if not since else []

    def fetch_cases(self, since: Optional[datetime] = None) -> List[Dict[str, Any]]:
        # Always generate some new cases or return cached
        if not hasattr(self, '_cache_cases'):
            self._cache_cases = []
            for i in range(15):
                self._cache_cases.append({
                    "ext_case_id": f"C{random.randint(10000, 99999)}",
                    "fir_number": f"KA{datetime.now().year}{str(random.randint(1,99999)).zfill(5)}",
                    "reported_at": (datetime.now() - timedelta(days=random.randint(0, 5))).strftime('%Y-%m-%d %H:%M:%S'),
                    "status": "Open",
                    "description": fake.paragraph(),
                    "lat": 12.9 + random.uniform(-0.1, 0.1),
                    "lng": 77.5 + random.uniform(-0.1, 0.1),
                    "station_ext_id": random.choice(self._cache_stations)["ext_id"],
                    "crime_head_ext": random.choice(["Robbery", "Assault", "Burglary", "Fraud", "Vehicle Theft"]),
                    "officer_ext_id": random.choice(self._cache_officers)["ext_id"]
                })
        return self._cache_cases

    def fetch_victims(self, since: Optional[datetime] = None) -> List[Dict[str, Any]]:
        victims = []
        for c in self.fetch_cases():
            if random.random() > 0.3: # 70% chance of having a victim
                for _ in range(random.randint(1, 2)):
                    victims.append({
                        "ext_victim_id": f"V{random.randint(1000, 9999)}",
                        "case_ext_id": c["ext_case_id"],
                        "name": fake.name(),
                        "age": random.randint(18, 70),
                        "gender": random.choice(["Male", "Female"])
                    })
        return victims

    def fetch_accused(self, since: Optional[datetime] = None) -> List[Dict[str, Any]]:
        accused = []
        for c in self.fetch_cases():
            if random.random() > 0.2:
                for _ in range(random.randint(1, 3)):
                    accused.append({
                        "ext_accused_id": f"A{random.randint(1000, 9999)}",
                        "case_ext_id": c["ext_case_id"],
                        "name": fake.name(),
                        "age": random.randint(18, 70),
                        "gender": random.choice(["Male", "Female"])
                    })
        return accused

    def fetch_arrests(self, since: Optional[datetime] = None) -> List[Dict[str, Any]]:
        return []

    def fetch_evidence(self, since: Optional[datetime] = None) -> List[Dict[str, Any]]:
        evidence = []
        types = ["Physical", "Digital", "Documentary"]
        for c in self.fetch_cases():
            if random.random() > 0.4:
                for _ in range(random.randint(1, 4)):
                    evidence.append({
                        "ext_evidence_id": f"E{random.randint(1000, 9999)}",
                        "case_ext_id": c["ext_case_id"],
                        "type": random.choice(types),
                        "description": fake.catch_phrase(),
                        "seized_date": (datetime.now() - timedelta(days=random.randint(0, 5))).strftime('%Y-%m-%d %H:%M:%S')
                    })
        return evidence

    def fetch_chargesheets(self, since: Optional[datetime] = None) -> List[Dict[str, Any]]:
        cs = []
        for c in self.fetch_cases():
            if random.random() > 0.5:
                cs.append({
                    "ext_cs_id": f"CS{random.randint(1000, 9999)}",
                    "case_ext_id": c["ext_case_id"],
                    "date": (datetime.now() - timedelta(days=random.randint(0, 2))).strftime('%Y-%m-%d %H:%M:%S'),
                    "type": "Final",
                    "officer_ext_id": c["officer_ext_id"]
                })
        return cs
        
    def fetch_act_sections(self, since: Optional[datetime] = None) -> List[Dict[str, Any]]:
        acts = []
        for c in self.fetch_cases():
            for _ in range(random.randint(1, 3)):
                acts.append({
                    "ext_assoc_id": f"AS{random.randint(1000, 9999)}",
                    "case_ext_id": c["ext_case_id"],
                    "act_name": random.choice(["BNS 2023", "IPC 1860", "NDPS Act"]),
                    "section_name": f"Sec {random.randint(100, 500)}"
                })
        return acts
