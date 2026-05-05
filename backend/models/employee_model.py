from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Literal
from datetime import datetime

ROLE_ENUM       = Literal["Frontend Developer","Backend Developer","UI/UX Designer","Product Manager","Data Analyst","DevOps Engineer","QA Engineer","HR Manager"]
EXPERIENCE_ENUM = Literal["Fresher (0-1 yr)","Junior (1-3 yrs)","Mid-Level (3-5 yrs)","Senior (5-8 yrs)","Lead (8+ yrs)"]

class EmployeeCreate(BaseModel):
    name:       str
    email:      EmailStr
    role:       ROLE_ENUM
    experience: EXPERIENCE_ENUM
    skills:     str

class EmployeeUpdate(BaseModel):
    name:       Optional[str]       = None
    email:      Optional[EmailStr]  = None
    role:       Optional[ROLE_ENUM] = None
    experience: Optional[EXPERIENCE_ENUM] = None
    skills:     Optional[str]       = None
