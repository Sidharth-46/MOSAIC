import os
import sys
import random
import time
from datetime import datetime, timedelta

# Ensure backend directory is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import zcatalyst_sdk
from faker import Faker

fake = Faker('en_IN')

KARNATAKA_DISTRICTS = [
    "Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban",
    "Bidar", "Chamarajanagar", "Chikkaballapur", "Chikkamagaluru", "Chitradurga",
    "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Hassan",
    "Haveri", "Kalaburagi", "Kodagu", "Kolar", "Koppal", "Mandya",
    "Mysuru", "Raichur", "Ramanagara", "Shivamogga", "Tumakuru", "Udupi",
    "Uttara Kannada", "Vijayapura", "Yadgir", "Vijayanagara"
]

CRIME_HEADS = [
    ("Murder", "Violent Crime"),
    ("Attempt to Murder", "Violent Crime"),
    ("Culpable Homicide", "Violent Crime"),
    ("Rape", "Crime Against Women"),
    ("Kidnapping", "Violent Crime"),
    ("Dacoity", "Property Crime"),
    ("Robbery", "Property Crime"),
    ("Burglary", "Property Crime"),
    ("Theft", "Property Crime"),
    ("Auto Theft", "Property Crime"),
    ("Rioting", "Public Order"),
    ("Criminal Breach of Trust", "Economic Offence"),
    ("Cheating", "Economic Offence"),
    ("Forgery", "Economic Offence"),
    ("Counterfeiting", "Economic Offence"),
    ("Arson", "Property Crime"),
    ("Hurt", "Violent Crime"),
    ("Extortion", "Violent Crime"),
    ("Dowry Deaths", "Crime Against Women"),
    ("Cruelty by Husband", "Crime Against Women"),
    ("Molestation", "Crime Against Women"),
    ("Sexual Harassment", "Crime Against Women"),
    ("Cyber Fraud", "Cyber Crime"),
    ("Identity Theft", "Cyber Crime"),
    ("Phishing", "Cyber Crime"),
]
# Expand crime heads to 100
CRIME_HEADS_FULL = []
for i in range(100):
    if i < len(CRIME_HEADS):
        CRIME_HEADS_FULL.append({"name": CRIME_HEADS[i][0], "category": CRIME_HEADS[i][1]})
    else:
        CRIME_HEADS_FULL.append({"name": f"Other Offence Type {i}", "category": "Miscellaneous"})

def batch_insert(table, data, batch_size=100):
    for i in range(0, len(data), batch_size):
        batch = data[i:i+batch_size]
        try:
            table.insert_rows(batch)
            print(f"Inserted {len(batch)} rows")
        except Exception as e:
            print(f"Error inserting: {e}")
        time.sleep(0.5)

def seed(req=None):
    if req:
        app = zcatalyst_sdk.initialize(req=req)
    else:
        app = zcatalyst_sdk.initialize()
        
    datastore = app.datastore()
    
    print("Seeding Districts...")
    districts = [{"name": d, "region": "KA"} for d in KARNATAKA_DISTRICTS]
    batch_insert(datastore.table("District"), districts)
    
    print("Fetching inserted Districts...")
    inserted_districts = datastore.table("District").get_paged_rows(max_rows=100)[0]
    district_ids = [d["District"]["ROWID"] for d in inserted_districts]
    
    print("Seeding Police Units...")
    units = []
    for d in inserted_districts:
        units.append({"name": f"{d['District']['name']} City Police", "district_id": d["District"]["ROWID"]})
        units.append({"name": f"{d['District']['name']} District Police", "district_id": d["District"]["ROWID"]})
    batch_insert(datastore.table("PoliceUnit"), units)
    
    print("Fetching inserted Units...")
    inserted_units = datastore.table("PoliceUnit").get_paged_rows(max_rows=100)[0]
    
    print("Seeding Police Stations...")
    stations = []
    for i in range(150):
        unit = random.choice(inserted_units)
        stations.append({
            "name": f"{fake.city()} PS",
            "unit_id": unit["PoliceUnit"]["ROWID"],
            "latitude": 12.9 + random.uniform(-4.0, 4.0),
            "longitude": 77.5 + random.uniform(-3.0, 3.0)
        })
    batch_insert(datastore.table("PoliceStation"), stations)
    
    print("Fetching inserted Stations...")
    inserted_stations = []
    has_more = True
    next_token = None
    while has_more:
        rows, more, token = datastore.table("PoliceStation").get_paged_rows(max_rows=100, next_token=next_token)
        inserted_stations.extend(rows)
        has_more = more
        next_token = token
        
    print("Seeding Officers...")
    officers = []
    for i in range(500):
        station = random.choice(inserted_stations)
        officers.append({
            "name": fake.name(),
            "badge_number": f"KA-{random.randint(10000, 99999)}",
            "rank": random.choice(["Constable", "Head Constable", "ASI", "PSI", "PI", "DSP"]),
            "station_id": station["PoliceStation"]["ROWID"]
        })
    batch_insert(datastore.table("Officer"), officers)
    
    print("Fetching inserted Officers...")
    inserted_officers = []
    has_more = True
    next_token = None
    while has_more:
        rows, more, token = datastore.table("Officer").get_paged_rows(max_rows=100, next_token=next_token)
        inserted_officers.extend(rows)
        has_more = more
        next_token = token
        
    print("Seeding Crime Heads...")
    batch_insert(datastore.table("CrimeHead"), CRIME_HEADS_FULL)
    
    print("Fetching inserted Crime Heads...")
    inserted_crime_heads = []
    has_more = True
    next_token = None
    while has_more:
        rows, more, token = datastore.table("CrimeHead").get_paged_rows(max_rows=100, next_token=next_token)
        inserted_crime_heads.extend(rows)
        has_more = more
        next_token = token

    print("Seeding 5000 CaseMasters (FIRs)...")
    cases = []
    for i in range(5000):
        station = random.choice(inserted_stations)
        officer = random.choice(inserted_officers)
        crime_head = random.choice(inserted_crime_heads)
        reported_date = datetime.now() - timedelta(days=random.randint(0, 365))
        
        cases.append({
            "fir_number": f"FIR/{reported_date.year}/{str(i).zfill(5)}",
            "reported_at": reported_date.strftime('%Y-%m-%d %H:%M:%S'),
            "status": random.choice(["Under Investigation", "Charge Sheeted", "Closed", "Pending Trial"]),
            "description": fake.paragraph(),
            "latitude": float(station["PoliceStation"]["latitude"]) + random.uniform(-0.05, 0.05),
            "longitude": float(station["PoliceStation"]["longitude"]) + random.uniform(-0.05, 0.05),
            "station_id": station["PoliceStation"]["ROWID"],
            "crime_head_id": crime_head["CrimeHead"]["ROWID"],
            "officer_id": officer["Officer"]["ROWID"]
        })
    batch_insert(datastore.table("CaseMaster"), cases, batch_size=100)
    
    print("Seeding Completed Successfully!")

if __name__ == "__main__":
    seed()
