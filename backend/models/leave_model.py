from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime

LEAVE_TYPES = Literal["Sick", "Casual", "Earned", "Unpaid", "Paternity", "Maternity"]
LEAVE_STATUS = Literal["Pending", "Approved", "Rejected"]

class LeaveCreate(BaseModel):
    employee_id: Optional[str] = None
    leave_type: LEAVE_TYPES = "Casual"
    from_date: str   # YYYY-MM-DD
    to_date: str     # YYYY-MM-DD
    reason: str
    duration: Optional[int] = 1 # Number of days
    status: LEAVE_STATUS = "Pending"

class LeaveUpdate(BaseModel):
    status: Optional[LEAVE_STATUS] = None
    manager_comment: Optional[str] = None
    reason: Optional[str] = None

class LeaveBalance(BaseModel):
    employee_id: str
    sick: int = 12
    casual: int = 15
    earned: int = 18
