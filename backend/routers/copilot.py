from fastapi import APIRouter
from pydantic import BaseModel
import re

router = APIRouter()

class CopilotRequest(BaseModel):
    message: str

from services.copilot_service import CopilotService

copilot_service = CopilotService()

@router.post("")
async def chat_copilot(req: CopilotRequest):
    response_text = copilot_service.generate_response(req.message)
    return {"response": response_text}
