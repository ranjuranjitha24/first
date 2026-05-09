from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class MeetingCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    date: str # YYYY-MM-DD
    time: str # HH:MM
    meeting_link: Optional[str] = "https://meet.google.com/new"
    assigned_employee: Optional[str] = None # employee_id
    assigned_employee_name: Optional[str] = None
    status: str = "Scheduled"

class MeetingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[str] = None
    time: Optional[str] = None
    meeting_link: Optional[str] = None
    status: Optional[str] = None
