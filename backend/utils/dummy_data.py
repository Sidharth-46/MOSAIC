# Dummy data for backend endpoints to serve (Localized for Karnataka State Police)

dashboard_kpis = [
    {"label": "Registered FIRs", "value": 12847, "change": -3.2, "changeLabel": "vs last month", "icon": "Shield", "trend": "down"},
    {"label": "Active Hotspots", "value": 23, "change": 8.5, "changeLabel": "vs last week", "icon": "Flame", "trend": "up"},
    {"label": "Pending Investigation", "value": 3140, "change": -5.0, "changeLabel": "vs yesterday", "icon": "AlertTriangle", "trend": "down"},
    {"label": "Charge Sheets Filed", "value": "72.4%", "change": 4.1, "changeLabel": "vs last month", "icon": "FileText", "trend": "up"}
]

crimes_list = [
    {
        "id": "case-0001",
        "firNumber": "KA20260142",
        "crimeHead": "Robbery",
        "description": "Armed robbery at jewelry store",
        "crimeGroup": "High",
        "status": "Open",
        "district": "Bengaluru Urban",
        "reportedAt": "2026-07-10T14:30:00Z"
    },
    {
        "id": "case-0002",
        "firNumber": "KA20260156",
        "crimeHead": "Assault",
        "description": "Physical altercation outside pub",
        "crimeGroup": "Medium",
        "status": "Under Investigation",
        "district": "Mysuru",
        "reportedAt": "2026-07-11T23:15:00Z"
    }
]

analytics_trends = [
    {"month": "Jan", "total": 1840, "theft": 310, "assault": 250, "robbery": 150},
    {"month": "Feb", "total": 1780, "theft": 295, "assault": 240, "robbery": 140},
    {"month": "Mar", "total": 1920, "theft": 330, "assault": 265, "robbery": 165},
]

analytics_districts = [
    {"district": "Bengaluru Urban", "totalCrimes": 3820, "resolved": 2340, "pending": 1480},
    {"district": "Mysuru", "totalCrimes": 1540, "resolved": 1180, "pending": 360},
    {"district": "Hubballi-Dharwad", "totalCrimes": 1400, "resolved": 1050, "pending": 350},
]

map_markers = [
    {"id": "mk-1", "latitude": 12.9716, "longitude": 77.5946, "crimeHead": "Theft", "crimeGroup": "Medium", "district": "Bengaluru Urban"},
    {"id": "mk-2", "latitude": 12.2958, "longitude": 76.6394, "crimeHead": "Fraud", "crimeGroup": "High", "district": "Mysuru"},
    {"id": "mk-3", "latitude": 15.3647, "longitude": 75.1240, "crimeHead": "Chain Snatching", "crimeGroup": "Critical", "district": "Hubballi-Dharwad"},
]

predictions = [
    {
        "id": "pred-001",
        "area": "Whitefield",
        "district": "Bengaluru Urban",
        "predictedCrimeType": "Theft",
        "riskScore": 82,
        "confidence": 88
    }
]

graph_data = {
    "nodes": [
        {"id": "case-001", "type": "CaseMaster", "label": "KA20260142"},
        {"id": "acc-001", "type": "Accused", "label": "Rajiv M."},
    ],
    "links": [
        {"source": "acc-001", "target": "case-001", "label": "Named In", "strength": 0.9}
    ]
}

patrol_zones = [
    {
        "id": "pz-001", "name": "Whitefield IT Corridor", "district": "Bengaluru Urban",
        "priority": "High", "riskScore": 88, "suggestedOfficers": 8
    }
]
