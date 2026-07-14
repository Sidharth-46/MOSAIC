from typing import Dict, Any, List
from catalyst_db.client import get_catalyst_client
import re

class CopilotEngine:
    """
    RAG (Retrieval-Augmented Generation) engine for the Investigative Copilot.
    Parses user queries, fetches relevant FIR data from Catalyst, and synthesizes responses.
    """
    def __init__(self):
        self.db_client = get_catalyst_client()
        # In a real environment, initialize LLM here (e.g., Langchain, Google Gemini API)
        # self.llm_client = ...

    def _extract_intent(self, query: str) -> Dict[str, Any]:
        """
        Extracts search parameters (entities) from the natural language query.
        (In production, this would be an LLM-based Named Entity Recognition step).
        """
        query_lower = query.lower()
        intent = {
            "crime_type": None,
            "district": None,
            "limit": 5
        }
        
        # Simple heuristic extraction
        crime_types = ["theft", "robbery", "assault", "murder", "cybercrime", "fraud"]
        for crime in crime_types:
            if crime in query_lower:
                intent["crime_type"] = crime.capitalize()
                
        districts = ["bengaluru", "mysuru", "mangalore", "hubballi", "belagavi"]
        for d in districts:
            if d in query_lower:
                intent["district"] = d.capitalize()
                
        return intent

    def _retrieve_context(self, intent: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Executes a ZCQL query against Catalyst to fetch relevant cases.
        """
        # Scaffolded ZCQL query based on intent
        # query = "SELECT ROWID, fir_number, reported_at, description, status FROM CaseMaster WHERE ..."
        
        # We use a broad query here and filter in-memory since ZCQL has limitations 
        # for dynamic text matching without search indexes
        raw_cases = self.db_client.execute_query("SELECT ROWID, fir_number, reported_at, description, status, crime_head_ext, district_id FROM CaseMaster")
        
        filtered_cases = []
        for row in raw_cases:
            case_data = row.get("CaseMaster", row)
            
            # Apply intent filters
            if intent["crime_type"] and intent["crime_type"].lower() not in str(case_data.get("crime_head_ext", "")).lower():
                continue
            if intent["district"] and intent["district"].lower() not in str(case_data.get("district_id", "")).lower():
                continue
                
            filtered_cases.append(case_data)
            
            if len(filtered_cases) >= intent["limit"]:
                break
                
        return filtered_cases

    def _synthesize_response(self, query: str, context: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Synthesizes a human-readable response based strictly on the retrieved context.
        (In production, this feeds into an LLM prompt: "Answer the query using ONLY this context: {context}")
        """
        if not context:
            return {
                "text": "I couldn't find any relevant cases in the database matching your query.",
                "sources": []
            }
            
        # Fallback deterministic synthesizer (Acting as an LLM)
        total_found = len(context)
        recent_cases = [c.get('fir_number', 'Unknown') for c in context[:3]]
        crime_types = set([c.get('crime_head_ext', 'Incident') for c in context])
        
        response_text = f"Based on our records, I found {total_found} relevant incidents matching your criteria.\n\n"
        response_text += f"The cases primarily involve **{', '.join(crime_types)}**. "
        response_text += f"Some of the most recent FIRs include {', '.join(recent_cases)}.\n\n"
        
        if len(context) > 0:
            sample = context[0]
            desc = sample.get("description", "")
            # Truncate description for summary
            desc_short = (desc[:100] + '...') if len(desc) > 100 else desc
            response_text += f"**Latest Case Snapshot ({sample.get('fir_number')}):** {desc_short} - Status is currently '{sample.get('status')}'.\n\n"
            
        response_text += "Would you like me to map these locations or assign them to an Investigating Officer?"
        
        sources = [
            {"id": c.get("ROWID", c.get("fir_number", "Unknown")), "title": f"FIR {c.get('fir_number')}", "type": "CaseMaster"}
            for c in context
        ]
        
        return {
            "text": response_text,
            "sources": sources
        }

    def chat(self, user_query: str) -> Dict[str, Any]:
        """Main entry point for the RAG pipeline."""
        print(f"Copilot processing query: {user_query}")
        
        # 1. Extract Intent
        intent = self._extract_intent(user_query)
        print(f"Extracted Intent: {intent}")
        
        # 2. Retrieve Context from Database
        context = self._retrieve_context(intent)
        print(f"Retrieved {len(context)} matching cases.")
        
        # 3. Generate Augmented Response
        result = self._synthesize_response(user_query, context)
        
        return result

copilot_engine = CopilotEngine()
