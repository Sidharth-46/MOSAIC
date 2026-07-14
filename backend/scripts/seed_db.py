import asyncio
import sys
import os

# Add backend to path so we can import from models, etc.
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.connection import engine, Base, SessionLocal
from models.core import District, PoliceUnit, PoliceStation, Officer
from models.classification import CrimeGroup, CrimeHead
from models.case import CaseMaster
from datetime import datetime

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

async def seed():
    await init_db()
    
    async with SessionLocal() as session:
        print("Seeding database...")
        # 1. Districts
        districts = [
            District(id="d1", name="Bengaluru Urban", region="South"),
            District(id="d2", name="Mysuru", region="South"),
            District(id="d3", name="Mangaluru", region="Coastal"),
            District(id="d4", name="Hubballi-Dharwad", region="North"),
        ]
        session.add_all(districts)
        
        # 2. Units & Stations
        unit1 = PoliceUnit(id="pu1", name="East Division", district_id="d1")
        session.add(unit1)
        
        station1 = PoliceStation(id="ps1", name="Whitefield PS", unit_id="pu1", latitude=12.9698, longitude=77.7499)
        station2 = PoliceStation(id="ps2", name="Mysuru South PS", unit_id="pu1", latitude=12.2958, longitude=76.6394)
        session.add_all([station1, station2])
        
        # 3. Officers
        officer1 = Officer(id="o1", name="Ramesh K", badge_number="KA-102", rank="Inspector", station_id="ps1")
        session.add(officer1)
        
        # 4. Classification
        cg1 = CrimeGroup(id="cg1", name="High")
        cg2 = CrimeGroup(id="cg2", name="Medium")
        session.add_all([cg1, cg2])
        
        ch1 = CrimeHead(id="ch1", name="Robbery", group_id="cg1")
        ch2 = CrimeHead(id="ch2", name="Assault", group_id="cg2")
        session.add_all([ch1, ch2])
        
        await session.commit()
        
        # 5. Cases
        c1 = CaseMaster(
            id="case-1",
            fir_number="KA20260142",
            status="Open",
            description="Armed robbery at jewelry store",
            latitude=12.9698,
            longitude=77.7499,
            reported_at=datetime.utcnow(),
            station_id="ps1",
            crime_head_id="ch1",
            officer_id="o1"
        )
        session.add(c1)
        
        await session.commit()
        print("Database seeding completed.")

if __name__ == "__main__":
    asyncio.run(seed())
