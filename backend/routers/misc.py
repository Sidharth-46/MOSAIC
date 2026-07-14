from fastapi import APIRouter
from typing import Dict, Any

router = APIRouter()

MOCK_MISC_DATA = {
    "dummyChatHistory": [
        { "id": 'msg-1', "role": 'user', "content": 'Show me the recent chain snatching FIRs in Hubballi.', "timestamp": '2026-07-13T09:00:00Z' },
        { "id": 'msg-2', "role": 'assistant', "content": 'Welcome to the Investigative Copilot. Connected to live backend...', "timestamp": '2026-07-13T09:00:15Z' }
    ],
    "suggestedPrompts": [
        'Show theft FIRs in Bengaluru Urban this month',
        'Find repeat accused',
        'Summarize FIR KA202600124',
        'Find similar FIRs',
        'Compare Mysuru and Belagavi crime trends',
        'Show active hotspots near Whitefield',
        'Show pending investigations'
    ],
    "dummyReportEntities": [
        { "type": 'AI Summary', "value": 'Victim reported chain snatched by two unknown bikers near the park entrance.', "confidence": 0.95 },
        { "type": 'Crime Head', "value": 'Chain Snatching', "confidence": 0.98 },
        { "type": 'Crime Sub Head', "value": 'Robbery - Street', "confidence": 0.85 },
        { "type": 'Applicable Acts', "value": 'BNS 2023', "confidence": 0.99 },
        { "type": 'Applicable Sections', "value": 'Sec 304, Sec 3(5)', "confidence": 0.92 },
        { "type": 'Victim', "value": 'Naveen S.', "confidence": 0.94 },
        { "type": 'Accused', "value": 'Unknown (2 individuals)', "confidence": 0.88 },
        { "type": 'Police Station', "value": 'Vidyanagar PS', "confidence": 0.96 },
        { "type": 'Investigation Status', "value": 'Pending Investigation', "confidence": 0.99 },
        { "type": 'Related FIRs', "value": 'KA202600122 (Similar MO)', "confidence": 0.82 },
        { "type": 'Timeline', "value": '06:15 AM - Incident, 07:00 AM - Reported', "confidence": 0.91 }
    ],
    "responsibleAIMetrics": [
        { "label": 'Model Confidence', "value": 94, "status": 'Good', "description": 'Overall confidence score across all risk assessments and predictions.' },
        { "label": 'Bias Indicator', "value": 82, "status": 'Warning', "description": 'Slight bias detected in risk score generation for semi-urban borders. Recalibration scheduled.' },
        { "label": 'Data Quality', "value": 98, "status": 'Good', "description": 'Data ingestion quality and completeness from core police databases.' },
        { "label": 'Prediction Reliability', "value": 92, "status": 'Good', "description": 'Consistency of model outputs across multiple prediction runs.' }
    ]
}

from services.graph_service import GraphService
from services.fir_intelligence_service import FIRIntelligenceService
from services.resource_allocation_service import ResourceAllocationService

graph_service = GraphService()
fir_intel = FIRIntelligenceService()
resource_engine = ResourceAllocationService()

@router.get("")
async def get_misc():
    # Simulate data ingestion hook / real-time AI parsing
    sample_brief_facts = "The complainant Naveen S. reported that while walking near the park, two unknown individuals on a black Pulsar motorcycle snatched his gold chain and threatened him with a knife."
    sample_case_id = 999123
    
    parsed_entities = fir_intel.analyze_brief_facts(sample_brief_facts, sample_case_id)
    
    # Calculate intelligent resource allocation dynamically
    dynamic_patrol_zones = resource_engine.generate_patrol_zones()
    
    # Dynamically inject the AI parsed entities and patrol zones to serve the frontend
    response_data = dict(MOCK_MISC_DATA)
    response_data["dummyReportEntities"] = parsed_entities
    response_data["patrolZones"] = dynamic_patrol_zones
    
    return response_data

@router.get("/graph")
async def get_graph():
    return graph_service.generate_graph()

@router.get("/graph/{case_id}")
async def get_graph_by_case(case_id: str):
    return graph_service.generate_graph(target_case_id=case_id)
