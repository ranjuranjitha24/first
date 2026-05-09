from pydantic import BaseModel
from typing import Optional, Literal

STATUS_ENUM = Literal["Open", "Closed", "On Hold"]

class JobCreate(BaseModel):
    title: str
    department: str
    location: str
    salary: Optional[str] = "Negotiable"
    type: Literal["Full-Time", "Part-Time", "Contract", "Internship"] = "Full-Time"
    description: str
    requirements: str
    required_skills: Optional[str] = ""
    deadline: Optional[str] = "" # YYYY-MM-DD
    status: STATUS_ENUM = "Open"

class JobUpdate(BaseModel):
    title: Optional[str] = None
    department: Optional[str] = None
    location: Optional[str] = None
    salary: Optional[str] = None
    type: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    required_skills: Optional[str] = None
    deadline: Optional[str] = None
    status: Optional[STATUS_ENUM] = None
