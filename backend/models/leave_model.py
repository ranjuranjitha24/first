from pydantic import BaseModel
from typing import Optional, Literal

class LeaveCreate(BaseModel):
    employee_id: str
    leave_type: Literal["Sick", "Casual", "Earned", "Unpaid"] = "Casual"
    from_date: str   # YYYY-MM-DD
    to_date: str     # YYYY-MM-DD
    reason: str
    status: Literal["Pending", "Approved", "Rejected"] = "Pending"

class LeaveUpdate(BaseModel):
    status: Optional[Literal["Pending", "Approved", "Rejected"]] = None
    reason: Optional[str] = None
