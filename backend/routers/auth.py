from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/login")
async def login(req: LoginRequest):
    # In a real scenario, this would query EmployeeRepository and hash passwords
    if "mosaic.gov.in" in req.email and req.password:
        return {
            "token": "mosaic_auth_token_v1",
            "user": {
                "name": "Datathon Inspector",
                "email": req.email,
                "role": "Inspector"
            }
        }
    raise HTTPException(status_code=401, detail="Invalid credentials")
