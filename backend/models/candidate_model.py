from pydantic import BaseModel, EmailStr
from typing import Optional, Literal

STAGE_ENUM = Literal["Applied", "Shortlisted", "Interviewed", "Hired", "Rejected"]

class CandidateCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = ""
    job_id: str
    resume_link: Optional[str] = ""
    stage: STAGE_ENUM = "Applied"
    notes: Optional[str] = ""

class CandidateUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    resume_link: Optional[str] = None
    stage: Optional[STAGE_ENUM] = None
    notes: Optional[str] = None
