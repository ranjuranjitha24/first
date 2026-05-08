from pydantic import BaseModel, Field
from typing import Optional, List

class KPI(BaseModel):
    name: str
    score: int # 1-100

class ReviewCreate(BaseModel):
    employee_id: str
    period: str          # e.g. "April 2024"
    rating: int          # 1-5
    performance: str     # Excellent, Good, Average, Poor
    comments: str
    achievements: Optional[str] = ""
    kpis: List[KPI] = []
    promotion_recommendation: bool = False

class ReviewUpdate(BaseModel):
    rating: Optional[int] = None
    performance: Optional[str] = None
    comments: Optional[str] = None
    achievements: Optional[str] = None
    promotion_recommendation: Optional[bool] = None
