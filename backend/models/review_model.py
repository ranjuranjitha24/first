from pydantic import BaseModel
from typing import Optional

class ReviewCreate(BaseModel):
    employee_id: str
    period: str          # e.g. "Q1 2025"
    rating: int          # 1-5
    performance: str     # "Excellent" | "Good" | "Average" | "Poor"
    comments: str
    goals_met: Optional[bool] = True

class ReviewUpdate(BaseModel):
    rating: Optional[int] = None
    performance: Optional[str] = None
    comments: Optional[str] = None
    goals_met: Optional[bool] = None
