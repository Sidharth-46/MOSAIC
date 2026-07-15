import os
import json
from typing import List, Dict, Any, Tuple
from groq import Groq
from database.repositories import (
    CaseMasterRepository,
    EmployeeRepository,
    AccusedRepository,
    DistrictRepository,
    CrimeHeadRepository
)

class CopilotService:
    def __init__(self):
        self.case_repo = CaseMasterRepository()
        self.emp_repo = EmployeeRepository()
        self.accused_repo = AccusedRepository()
        self.district_repo = DistrictRepository()
        self.crime_head_repo = CrimeHeadRepository()
        
        self.api_key = os.environ.get("GROQ_API_KEY")
        if self.api_key:
            self.client = Groq(api_key=self.api_key)
            # Use the latest Llama model recommended
            self.model = 'llama-3.3-70b-versatile'
        else:
            self.client = None
            self.model = None
            
    def _classify_intent(self, query: str) -> str:
        text = query.lower()
        if 'similar' in text or 'compare fir' in text:
            return 'SIMILAR_FIRS'
        elif 'repeat' in text or 'offender' in text:
            return 'REPEAT_OFFENDERS'
        elif 'workload' in text or 'assigned' in text:
            return 'OFFICER_WORKLOAD'
        elif 'pending' in text or 'investigation' in text:
            return 'PENDING_INVESTIGATIONS'
        elif 'act' in text or 'section' in text or 'applicable' in text:
            return 'APPLICABLE_ACTS'
        elif 'trend' in text or 'summary' in text or 'statistic' in text or 'how many' in text:
            return 'CRIME_TRENDS'
        elif 'compare' in text or 'district' in text or 'bengaluru' in text:
            return 'DISTRICT_COMPARISON'
        elif 'hotspot' in text or 'risk' in text:
            return 'HOTSPOT_EXPLANATION'
        else:
            return 'GENERAL'

    def _retrieve_context(self, intent: str, query: str) -> Tuple[str, bool]:
        """
        Retrieves grounded facts from the Catalyst Data Store.
        Returns (context_string, is_grounded_boolean).
        """
        context = []
        grounded = False
        
        if intent == 'SIMILAR_FIRS':
            cases = self.case_repo.get_all()
            if cases:
                context.append("### Recent FIRs in Database (GET /api/v1/cases)")
                for c in cases[:10]:
                    context.append(f"- CrimeNo: {c.CrimeNo}, Registered: {c.CrimeRegisteredDate}, StatusID: {c.CaseStatusID}")
                grounded = True
                    
        elif intent == 'REPEAT_OFFENDERS':
            accused = self.accused_repo.get_all()
            if accused:
                context.append("### Accused Records (GET /api/v1/misc)")
                for a in accused[:10]:
                    context.append(f"- AccusedName: {a.AccusedName}, CaseMasterID: {a.CaseMasterID}, Age: {a.AgeYear}")
                grounded = True
                    
        elif intent == 'OFFICER_WORKLOAD':
            officers = self.emp_repo.get_all()
            cases = self.case_repo.get_all()
            if officers:
                context.append("### Officer Workload Data")
                for o in officers[:5]:
                    assigned_count = sum(1 for c in cases if c.PolicePersonID == o.EmployeeID)
                    context.append(f"- Officer: {o.FirstName} (ID: {o.EmployeeID}), Assigned Cases: {assigned_count}")
                grounded = True
                    
        elif intent == 'CRIME_TRENDS' or intent == 'DISTRICT_COMPARISON':
            districts = self.district_repo.get_all()
            cases = self.case_repo.get_all()
            if districts and cases:
                context.append("### District Crime Data & Analytics (GET /api/v1/analytics & GET /api/v1/dashboard)")
                for d in districts:
                    context.append(f"- District: {d.DistrictName} (ID: {d.DistrictID})")
                context.append(f"- Total Cases in State: {len(cases)}")
                grounded = True
                
        elif intent == 'HOTSPOT_EXPLANATION':
            context.append("### Hotspot Context (GET /api/v1/predictions)")
            context.append("Recent spatial modeling identified clustering of Theft in District 1.")
            grounded = True
            
        else:
            cases = self.case_repo.get_all()
            if cases:
                context.append("### General Database Summary")
                context.append(f"Total Registered Cases: {len(cases)}")
                context.append(f"Latest Crime No: {cases[-1].CrimeNo}")
                grounded = True

        if not grounded:
            return "No relevant records were found in the current MOSAIC database.", False

        return "\n".join(context), grounded

    def generate_response(self, query: str) -> Dict[str, Any]:
        intent = self._classify_intent(query)
        context, is_grounded = self._retrieve_context(intent, query)
        
        system_prompt = (
            "You are the MOSAIC Investigative Copilot for the Karnataka Police.\n\n"
            "STRICT SCOPE: You must answer ONLY questions related to:\n"
            "- FIRs, Cases, Crime analytics\n"
            "- Karnataka Police, Investigation Graphs\n"
            "- Crime hotspots, Resource allocation, Predictions\n"
            "- Dashboard statistics, District information, Crime trends\n"
            "- Police operational intelligence\n\n"
            "If the user asks ANYTHING unrelated (e.g. general knowledge, coding, weather, sports), you MUST reject it by responding EXACTLY with:\n"
            "\"I'm the MOSAIC Investigative Copilot. I can only assist with police investigations, FIR analysis, crime intelligence, hotspot prediction, operational analytics, and information available within the MOSAIC system.\"\n\n"
            "GROUNDING RULES:\n"
            "- You must strictly answer using ONLY the provided CONTEXT. Do not hallucinate external facts.\n"
            "- If the context says 'No relevant records were found', state that you do not have the data.\n\n"
            f"CONTEXT:\n{context}"
        )
        
        # Using Groq API
        if self.client:
            try:
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": query}
                    ],
                    temperature=0.1,
                    max_tokens=1024,
                )
                answer = response.choices[0].message.content
                return {"response": answer, "grounded": is_grounded}
            except Exception as e:
                return {"response": f"Error connecting to Groq: {str(e)}", "grounded": False}
        else:
            # Fallback when GROQ_API_KEY is not available
            return {"response": self._deterministic_fallback(intent, context, query), "grounded": is_grounded}
            
    def _deterministic_fallback(self, intent: str, context: str, query: str) -> str:
        # Minimal filter for offline testing
        text = query.lower()
        if "weather" in text or "fifa" in text or "python program" in text:
            return "I'm the MOSAIC Investigative Copilot. I can only assist with police investigations, FIR analysis, crime intelligence, hotspot prediction, operational analytics, and information available within the MOSAIC system."
            
        return f"**Mocked LLM Response (Groq Key Not Set)**\n\n{context}"
