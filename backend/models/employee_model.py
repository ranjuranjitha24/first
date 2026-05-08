from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Literal
from datetime import datetime

ROLE_ENUM       = Literal["Frontend Developer","Backend Developer","UI/UX Designer","Product Manager","Data Analyst","DevOps Engineer","QA Engineer","HR Manager"]
EXPERIENCE_ENUM = Literal["Fresher (0-1 yr)","Junior (1-3 yrs)","Mid-Level (3-5 yrs)","Senior (5-8 yrs)","Lead (8+ yrs)"]
DEPT_ENUM       = Literal["Engineering", "Design", "Product", "Marketing", "Sales", "HR", "Finance", "Operations"]
STATUS_ENUM     = Literal["Active", "Inactive", "On Leave", "Deactivated"]

class EmployeeCreate(BaseModel):
    name:       str
    email:      EmailStr
    role:       ROLE_ENUM
    experience: EXPERIENCE_ENUM
    skills:     str
    department: Optional[DEPT_ENUM] = "Engineering"
    status:     Optional[STATUS_ENUM] = "Active"
    image_url:  Optional[str] = None
    username:   Optional[str] = None
    password:   Optional[str] = None

class EmployeeUpdate(BaseModel):
    name:       Optional[str]       = None
    email:      Optional[EmailStr]  = None
    role:       Optional[ROLE_ENUM] = None
    experience: Optional[EXPERIENCE_ENUM] = None
    skills:     Optional[str]       = None
    department: Optional[DEPT_ENUM] = None
    status:     Optional[STATUS_ENUM] = None
    image_url:  Optional[str] = None
