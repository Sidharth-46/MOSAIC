import re
import random
from typing import List, Dict, Any
from datetime import datetime

from models.case import Victim, Accused, Evidence, ActSectionAssociation
from database.repositories import (
    VictimRepository, 
    AccusedRepository, 
    EvidenceRepository, 
    ActSectionAssociationRepository
)

class FIRIntelligenceService:
    def __init__(self):
        self.victim_repo = VictimRepository()
        self.accused_repo = AccusedRepository()
        self.evidence_repo = EvidenceRepository()
        self.act_assoc_repo = ActSectionAssociationRepository()
        
    def analyze_brief_facts(self, brief_facts: str, case_master_id: int) -> List[Dict[str, Any]]:
        """
        Simulates an AI processing the BriefFacts narrative.
        Extracts structured entities, stores them into ERD repositories, 
        and returns the formatted output for the UI.
        """
        
        # 1. AI Extraction Simulation (Rule-based Mock for Offline Evaluation)
        text = brief_facts.lower()
        extracted = []
        
        # Determine Crime Head / Sub Head
        crime_head = "Other Offense"
        sub_head = "Unclassified"
        if "chain" in text and "snatch" in text:
            crime_head = "Chain Snatching"
            sub_head = "Robbery - Street"
        elif "stolen" in text or "theft" in text:
            crime_head = "Theft"
            sub_head = "Property Theft"
            
        extracted.append({"type": "Crime Head", "value": crime_head, "confidence": 0.98})
        extracted.append({"type": "Crime Sub Head", "value": sub_head, "confidence": 0.85})
        
        # Acts and Sections
        extracted.append({"type": "Applicable Acts", "value": "BNS 2023", "confidence": 0.99})
        extracted.append({"type": "Applicable Sections", "value": "Sec 304, Sec 3(5)", "confidence": 0.92})
        
        # Timeline
        extracted.append({"type": "Timeline", "value": "Extracted timeline from narrative", "confidence": 0.91})
        
        # 2. Extract Entities & Store in Catalyst Repositories
        
        # Victims
        victim_name = "Naveen S." if "naveen" in text else "Unknown Victim"
        victim = Victim(CaseMasterID=case_master_id, VictimName=victim_name, AgeYear=35, GenderID=1)
        self.victim_repo.insert(victim)
        extracted.append({"type": "Victim", "value": victim_name, "confidence": 0.94})
        
        # Accused
        accused_desc = "Unknown (2 individuals)" if "two unknown" in text else "Unidentified Accused"
        accused = Accused(CaseMasterID=case_master_id, AccusedName=accused_desc, AgeYear=0, GenderID=1)
        self.accused_repo.insert(accused)
        extracted.append({"type": "Accused", "value": accused_desc, "confidence": 0.88})
        
        # Evidence (Weapon / Vehicle)
        if "bike" in text or "motorcycle" in text or "pulsar" in text:
            vehicle = Evidence(
                CaseMasterID=case_master_id, 
                EvidenceType="Vehicle", 
                EvidenceDescription="Black Pulsar Motorcycle used in offense",
                SeizedDate=None
            )
            self.evidence_repo.insert(vehicle)
            extracted.append({"type": "Vehicle", "value": "Black Pulsar Motorcycle", "confidence": 0.91})
            
        if "knife" in text or "machete" in text or "weapon" in text:
            weapon = Evidence(
                CaseMasterID=case_master_id, 
                EvidenceType="Weapon", 
                EvidenceDescription="Sharp object (Knife)",
                SeizedDate=None
            )
            self.evidence_repo.insert(weapon)
            extracted.append({"type": "Weapon", "value": "Knife", "confidence": 0.87})
            
        # AI Summary
        summary = f"Incident of {crime_head.lower()} reported. Accused: {accused_desc}. Victim: {victim_name}."
        extracted.append({"type": "AI Summary", "value": summary, "confidence": 0.95})
        
        # Related FIRs (Simulated cross-reference)
        extracted.append({"type": "Related FIRs", "value": "KA202600122 (Similar MO)", "confidence": 0.82})
        
        # Re-order and ensure AI Summary is first for best UX
        ordered_types = ['AI Summary', 'Crime Head', 'Crime Sub Head', 'Applicable Acts', 'Applicable Sections', 
                         'Victim', 'Accused', 'Weapon', 'Vehicle', 'Timeline', 'Related FIRs']
        
        final_list = []
        for t in ordered_types:
            for item in extracted:
                if item["type"] == t:
                    final_list.append(item)
                    
        return final_list
