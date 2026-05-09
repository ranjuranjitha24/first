from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime

class NotificationCreate(BaseModel):
    user_id: str
    title: str
    message: str
    type: Literal["info", "success", "warning", "danger", "MEETING", "LEAVE", "REVIEW"] = "info"

class NotificationUpdate(BaseModel):
    is_read: bool = True
