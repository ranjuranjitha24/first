from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime

class AttendanceCheck(BaseModel):
    employee_id: str
    type: Literal["check-in", "check-out"]
    timestamp: Optional[str] = None # ISO format

class AttendanceRecord(BaseModel):
    employee_id: str
    date: str # YYYY-MM-DD
    status: Literal["Present", "Late", "Absent", "On Leave"]
    check_in: Optional[str] = None
    check_out: Optional[str] = None
    work_hours: Optional[float] = 0
