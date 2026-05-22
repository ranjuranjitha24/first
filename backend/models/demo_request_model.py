from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class DemoRequestCreate(BaseModel):
    name: str
    company_name: str
    email: str
    phone: str
    message: Optional[str] = ""
    planType: Optional[str] = "Starter"


class DemoRequestUpdate(BaseModel):
    status: Optional[str] = None          # Pending / Approved / Rejected / Cancelled
    scheduled_date: Optional[str] = None  # YYYY-MM-DD
    scheduled_time: Optional[str] = None  # HH:MM
    demo_duration_minutes: Optional[int] = 30
    admin_notes: Optional[str] = None
    planType: Optional[str] = None
    trialDurationDays: Optional[int] = None
