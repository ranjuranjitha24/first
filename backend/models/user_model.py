from pydantic import BaseModel
from typing import Optional, Literal

class UserCreate(BaseModel):
    username: str
    password: str
    role: Literal["admin", "hr"] = "hr"

class UserLogin(BaseModel):
    username: str
    password: str
