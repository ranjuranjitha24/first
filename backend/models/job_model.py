from pydantic import BaseModel
from typing import Optional, Literal

STATUS_ENUM = Literal["Open", "Closed", "On Hold"]

class JobCreate(BaseModel):
    title: str
    department: str
    location: str
    type: Literal["Full-Time", "Part-Time", "Contract", "Internship"] = "Full-Time"
    description: str
    requirements: str
    status: STATUS_ENUM = "Open"

class JobUpdate(BaseModel):
    title: Optional[str] = None
    department: Optional[str] = None
    location: Optional[str] = None
    type: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    status: Optional[STATUS_ENUM] = None
