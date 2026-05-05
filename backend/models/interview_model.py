from pydantic import BaseModel
from typing import Optional, Literal

STATUS_ENUM = Literal["Scheduled", "Completed", "Cancelled"]
TYPE_ENUM   = Literal["HR Round", "Technical", "Final Round"]

class InterviewCreate(BaseModel):
    employee:     str
    date:         str
    time:         str
    type:         TYPE_ENUM
    meeting_link: Optional[str] = ""   # Google Meet / Zoom URL
    notes:        Optional[str] = ""

class InterviewUpdate(BaseModel):
    employee:     Optional[str]         = None
    date:         Optional[str]         = None
    time:         Optional[str]         = None
    type:         Optional[TYPE_ENUM]   = None
    status:       Optional[STATUS_ENUM] = None
    meeting_link: Optional[str]         = None
    notes:        Optional[str]         = None
