import zcatalyst_sdk
from faker import Faker
import random
from datetime import datetime, timedelta
import math
import uuid

# Mock engine failsafe to allow script syntax validation even if Catalyst isn't logged in locally
try:
    app = zcatalyst_sdk.initialize()
    datastore = app.datastore()
    CATALYST_READY = True
except Exception as e:
    print(f"Catalyst Initialization skipped (Simulation Mode): {e}")
    CATALYST_READY = False
    
fake = Faker('en_IN')

# Karnataka Bounding Box for realistic coordinates
KA_LAT_MIN, KA_LAT_MAX = 11.5, 18.5
KA_LNG_MIN, KA_LNG_MAX = 74.0, 78.5

# Real Karnataka Districts
KARNATAKA_DISTRICTS = [
    "Bagalkot", "Ballari (Bellary)", "Belagavi (Belgaum)", "Bengaluru (Bangalore) Rural", 
    "Bengaluru (Bangalore) Urban", "Bidar", "Chamarajanagar", "Chikballapur", "Chikkamagaluru (Chikmagalur)", 
    "Chitradurga", "Dakshina Kannada", "Davangere", "Dharwad", "Gadag", "Hassan", "Haveri", "Kalaburagi (Gulbarga)", 
    "Kodagu", "Kolar", "Koppal", "Mandya", "Mysuru (Mysore)", "Raichur", "Ramanagara", "Shivamogga (Shimoga)", 
    "Tumakuru (Tumkur)", "Udupi", "Uttara Kannada (Karwar)", "Vijayapura (Bijapur)", "Yadgir", "Vijayanagara"
]

CRIME_HEADS = [
    {"name": "Theft", "category": "Property"},
    {"name": "Assault", "category": "Violent"},
    {"name": "Robbery", "category": "Violent"},
    {"name": "Cyber Fraud", "category": "Cybercrime"},
    {"name": "Vehicle Theft", "category": "Property"},
    {"name": "Extortion", "category": "Organized"},
    {"name": "Murder", "category": "Violent"},
    {"name": "Drug Trafficking", "category": "Narcotics"}
]

def generate_ka_coordinates():
    lat = random.uniform(KA_LAT_MIN, KA_LAT_MAX)
    lng = random.uniform(KA_LNG_MIN, KA_LNG_MAX)
    return lat, lng

def insert_batch(table_name: str, rows: list) -> list:
    """Inserts rows into Catalyst and returns their assigned ROWIDs."""
    if not CATALYST_READY:
        # Return mock ROWIDs for simulation
        return [str(random.randint(1000000000000000000, 9000000000000000000)) for _ in rows]
        
    try:
        table = datastore.table(table_name)
        # Catalyst has limits per batch, usually 100 or 500
        batch_size = 100
        row_ids = []
        for i in range(0, len(rows), batch_size):
            batch = rows[i:i+batch_size]
            response = table.insert_rows(batch)
            # Response usually contains the inserted records with ROWID
            for record in response:
                row_ids.append(record.get('ROWID'))
        print(f"Successfully inserted {len(rows)} records into {table_name}.")
        return row_ids
    except Exception as e:
        print(f"Error inserting into {table_name}: {e}")
        return []

def seed_database():
    print("==========================================================")
    print(" Catalyst Data Store Seed Engine (Karnataka Police ERD)")
    print("==========================================================")
    print("Target Generation:")
    print("- 31 Districts")
    print("- 150 Police Stations")
    print("- 500 Officers")
    print("- 5000 FIRs (CaseMaster)")
    
    # 1. Seed Districts
    print("Seeding Districts...")
    districts_payload = [{"name": d, "region": "Karnataka State"} for d in KARNATAKA_DISTRICTS]
    district_ids = insert_batch("District", districts_payload)
    if not district_ids:
        print("Failed to seed districts. Aborting.")
        return

    # 2. Seed CrimeHeads
    print("Seeding CrimeHeads...")
    crime_head_ids = insert_batch("CrimeHead", CRIME_HEADS)
    
    # 3. Seed Police Units & Stations
    print("Seeding Police Units and Stations...")
    station_payload = []
    unit_ids = []
    
    # Create 5 Units per district (155 Units)
    for dist_id in district_ids:
        units = [{"name": f"Unit-{fake.city_suffix()}", "district_id": dist_id} for _ in range(5)]
        u_ids = insert_batch("PoliceUnit", units)
        unit_ids.extend(u_ids)
        
        # 1 Station per Unit (155 Stations)
        for u_id in u_ids:
            lat, lng = generate_ka_coordinates()
            station_payload.append({
                "name": f"{fake.last_name()} Police Station",
                "latitude": lat,
                "longitude": lng,
                "unit_id": u_id
            })
            
    station_ids = insert_batch("PoliceStation", station_payload)
    
    # 4. Seed Officers
    print("Seeding 500 Officers...")
    officers_payload = []
    ranks = ["Constable", "Head Constable", "ASI", "PSI", "Inspector", "DSP"]
    for _ in range(500):
        officers_payload.append({
            "name": fake.name(),
            "badge_number": f"KA-{random.randint(10000, 99999)}",
            "rank": random.choice(ranks),
            "station_id": random.choice(station_ids)
        })
    officer_ids = insert_batch("Officer", officers_payload)

    # 5. Seed Cases (5000 FIRs) & Related Entities
    print("Seeding 5000 CaseMasters and relations (Victims, Accused, Evidence)...")
    cases_payload = []
    
    for i in range(5000):
        lat, lng = generate_ka_coordinates()
        # FIR Example: KA202600001
        fir_number = f"KA{datetime.now().year}{str(i).zfill(5)}"
        reported_date = datetime.now() - timedelta(days=random.randint(0, 365))
        
        cases_payload.append({
            "fir_number": fir_number,
            "reported_at": reported_date.strftime('%Y-%m-%d %H:%M:%S'),
            "status": random.choice(["Open", "Under Investigation", "Chargesheet Filed", "Closed"]),
            "description": fake.text(max_nb_chars=200),
            "latitude": lat,
            "longitude": lng,
            "station_id": random.choice(station_ids),
            "crime_head_id": random.choice(crime_head_ids),
            "officer_id": random.choice(officer_ids)
        })

    # Since 5000 is large, insert in chunks and gather IDs
    case_ids = insert_batch("CaseMaster", cases_payload)

    if case_ids:
        print("Seeding Victims, Accused, and Evidence...")
        victims, accused, evidence = [], [], []
        for c_id in case_ids:
            # 1-2 Victims per case
            for _ in range(random.randint(1, 2)):
                victims.append({
                    "name": fake.name(),
                    "age": random.randint(18, 80),
                    "gender": random.choice(["Male", "Female"]),
                    "case_id": c_id
                })
            # 0-3 Accused per case
            for _ in range(random.randint(0, 3)):
                accused.append({
                    "name": fake.name(),
                    "age": random.randint(18, 60),
                    "gender": random.choice(["Male", "Female"]),
                    "status": random.choice(["Absconding", "Arrested", "Bailed"]),
                    "arrest_date": (datetime.now() - timedelta(days=random.randint(0, 30))).strftime('%Y-%m-%d %H:%M:%S'),
                    "case_id": c_id
                })
            # 0-2 Evidence items per case
            for _ in range(random.randint(0, 2)):
                evidence.append({
                    "item_type": random.choice(["Weapon", "Document", "Digital Device", "Vehicle"]),
                    "description": fake.text(max_nb_chars=100),
                    "collected_at": (datetime.now() - timedelta(days=random.randint(0, 30))).strftime('%Y-%m-%d %H:%M:%S'),
                    "case_id": c_id
                })
                
        insert_batch("Victim", victims)
        insert_batch("Accused", accused)
        insert_batch("Evidence", evidence)
        
    print("==========================================================")
    print(" Seeding Completed Successfully! ")
    print("==========================================================")

if __name__ == "__main__":
    seed_database()
