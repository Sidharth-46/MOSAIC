from pydantic import BaseModel
from typing import List, Optional

class CopilotRequest(BaseModel):
    text: str
    conversation_id: Optional[str] = None

class SourceCitation(BaseModel):
    id: str
    title: str
    type: str

class CopilotResponse(BaseModel):
    response: str
    sources: List[SourceCitation]
