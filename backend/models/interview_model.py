from pydantic import BaseModel, Field
from typing import Optional, Literal

STATUS_ENUM = Literal["Scheduled", "Completed", "Cancelled", "In Progress"]
TYPE_ENUM   = Literal["HR Round", "Technical", "Final Round", "Cultural Fit"]

class InterviewCreate(BaseModel):
    candidate_id: str
    interviewer: Optional[str] = "Staff" # Name to display
    employee: Optional[str] = None       # Employee ID
    date: str                            # YYYY-MM-DD
    time: str                            # HH:MM
    type: TYPE_ENUM
    meeting_link: Optional[str] = "https://meet.google.com/new"
    notes: Optional[str] = ""

class InterviewUpdate(BaseModel):
    status: Optional[STATUS_ENUM] = None
    feedback: Optional[str] = None
    rating: Optional[int] = None # 1-5
    notes: Optional[str] = None
    meeting_link: Optional[str] = None
