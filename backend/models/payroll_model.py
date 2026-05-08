from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime

class PayrollCreate(BaseModel):
    employee_id: str
    month: str           # e.g., "May 2024"
    base_salary: float
    bonuses: float       = 0
    deductions: float    = 0
    tax: float           = 0
    status: Literal["Paid", "Pending", "Processing"] = "Pending"

class PayrollUpdate(BaseModel):
    status: Optional[Literal["Paid", "Pending", "Processing"]] = None
    bonuses: Optional[float] = None
    deductions: Optional[float] = None
    payment_date: Optional[str] = None
