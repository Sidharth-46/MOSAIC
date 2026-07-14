import random
from typing import Dict, Any, List

from database.repositories import (
    CaseMasterRepository, VictimRepository, AccusedRepository,
    UnitRepository, EmployeeRepository, ChargesheetDetailsRepository,
    EvidenceRepository, ActSectionAssociationRepository, ActRepository,
    SectionRepository, CourtRepository, CrimeHeadRepository
)

class GraphService:
    def __init__(self):
        self.case_repo = CaseMasterRepository()
        self.victim_repo = VictimRepository()
        self.accused_repo = AccusedRepository()
        self.unit_repo = UnitRepository()
        self.employee_repo = EmployeeRepository()
        self.cs_repo = ChargesheetDetailsRepository()
        self.evidence_repo = EvidenceRepository()
        self.assoc_repo = ActSectionAssociationRepository()
        self.act_repo = ActRepository()
        self.section_repo = SectionRepository()
        self.court_repo = CourtRepository()
        self.crime_head_repo = CrimeHeadRepository()
        
    def generate_graph(self, target_case_id: str = None) -> Dict[str, Any]:
        """
        Dynamically generates the investigation graph for a specific CaseMasterID 
        (or a default/random one if none provided).
        """
        all_cases = self.case_repo.get_all()
        if not all_cases:
            return {"nodes": [], "links": []}

        # Select target case
        case = None
        if target_case_id:
            case = next((c for c in all_cases if str(c.CaseMasterID) == target_case_id), None)
            # If not found by ID, maybe it's by CrimeNo
            if not case:
                case = next((c for c in all_cases if c.CrimeNo == target_case_id), None)
        
        if not case:
            case = all_cases[0] # Default to first

        case_master_id = case.CaseMasterID

        # Load related data for this case
        victims = [v for v in self.victim_repo.get_all() if v.CaseMasterID == case_master_id]
        accused = [a for a in self.accused_repo.get_all() if a.CaseMasterID == case_master_id]
        evidences = [e for e in self.evidence_repo.get_all() if e.CaseMasterID == case_master_id]
        chargesheets = [cs for cs in self.cs_repo.get_all() if cs.CaseMasterID == case_master_id]
        assocs = [a for a in self.assoc_repo.get_all() if a.CaseMasterID == case_master_id]
        
        station = self.unit_repo.get_by_id(case.PoliceStationID)
        officer = self.employee_repo.get_by_id(case.PolicePersonID)
        crime_head = self.crime_head_repo.get_by_id(case.CrimeMajorHeadID)
        
        crime_head_name = crime_head.CrimeGroupName if crime_head else "Unknown"

        nodes = []
        links = []

        def add_node(n_id, label, n_type, color, details):
            nodes.append({
                "id": str(n_id), "label": str(label), "type": n_type, 
                "color": color, "details": details
            })

        def add_link(source, target, label, strength=0.8):
            links.append({
                "source": str(source), "target": str(target), 
                "label": label, "strength": strength
            })

        # 1. Case Node
        c_id = f"case-{case_master_id}"
        add_node(
            c_id, case.CrimeNo, "CaseMaster", "#3b82f6", 
            {"firNumber": case.CrimeNo, "crimeHead": crime_head_name, "status": "Open", "registeredDate": case.CrimeRegisteredDate.strftime('%Y-%m-%d') if case.CrimeRegisteredDate else ''}
        )

        # 2. Police Station Node
        if station:
            s_id = f"ps-{station.UnitID}"
            add_node(s_id, station.UnitName, "Police Station", "#22c55e", {"district": "Unknown", "inspector": "N/A"})
            add_link(c_id, s_id, "Registered At", 0.8)

        # 3. Investigating Officer Node
        if officer:
            o_id = f"io-{officer.EmployeeID}"
            add_node(o_id, officer.FirstName, "Investigating Officer", "#06b6d4", {"badgeNumber": officer.KGID or "N/A"})
            add_link(c_id, o_id, "Investigated By", 0.9)

        # 4. Victim Nodes
        for v in victims:
            v_id = f"vic-{v.VictimMasterID}"
            add_node(v_id, v.VictimName, "Victim", "#8b5cf6", {"age": v.AgeYear, "gender": v.GenderID})
            add_link(v_id, c_id, "Victim Of", 0.8)

        # 5. Accused Nodes
        for a in accused:
            a_id = f"acc-{a.AccusedMasterID}"
            add_node(a_id, a.AccusedName, "Accused", "#ef4444", {"age": a.AgeYear, "gender": a.GenderID})
            add_link(a_id, c_id, "Named In", 1.0)
            
            # Link evidence to accused if any (mock association)
            if evidences and random.random() > 0.5:
                add_link(f"ev-{random.choice(evidences).EvidenceID}", a_id, "Identifies", 0.7)

        # 6. Evidence Nodes
        for e in evidences:
            e_id = f"ev-{e.EvidenceID}"
            add_node(e_id, f"Evidence {e.EvidenceID}", "Evidence", "#f59e0b", {"type": e.EvidenceType, "status": e.Status})
            add_link(e_id, c_id, "Collected For", 0.6)

        # 7. Acts and Sections (Via Association)
        acts_dict = {a.ActID: a for a in self.act_repo.get_all()}
        sections_dict = {s.SectionID: s for s in self.section_repo.get_all()}
        
        for assoc in assocs:
            act = acts_dict.get(assoc.ActID)
            section = sections_dict.get(assoc.SectionID)
            
            if act:
                act_id = f"act-{act.ActID}"
                # Prevent duplicate nodes if multiple associations point to same act
                if not any(n['id'] == act_id for n in nodes):
                    add_node(act_id, act.ActName, "Acts", "#ec4899", {"fullTitle": act.ActName})
                add_link(c_id, act_id, "Falls Under", 0.5)

            if section:
                sec_id = f"sec-{section.SectionID}"
                if not any(n['id'] == sec_id for n in nodes):
                    add_node(sec_id, section.SectionName, "Sections", "#ec4899", {"description": section.SectionDescription or ""})
                add_link(c_id, sec_id, "Applied Section", 0.8)

        # 8. Chargesheet and Court Nodes
        courts_dict = {c.CourtID: c for c in self.court_repo.get_all()}
        for cs in chargesheets:
            cs_id = f"cs-{cs.CSID}"
            add_node(cs_id, f"Chargesheet {cs.CSID}", "Chargesheet", "#64748b", {"filedDate": cs.csdate.strftime('%Y-%m-%d') if cs.csdate else '', "status": "Submitted"})
            add_link(c_id, cs_id, "Resulted In", 0.9)
            
            # In a real ERD, CS might link to Court. Here we'll link Case to Court directly or CS to Court.
            court = courts_dict.get(case.CourtID) or courts_dict.get(1)
            if court:
                crt_id = f"crt-{court.CourtID}"
                if not any(n['id'] == crt_id for n in nodes):
                    add_node(crt_id, court.CourtName, "Court", "#a8a29e", {"jurisdiction": court.CourtName})
                add_link(cs_id, crt_id, "Submitted To", 0.9)

        return {
            "nodes": nodes,
            "links": links
        }
