from pydantic import BaseModel, EmailStr
from typing import Optional, Literal


# ── Admin / HR user creation (existing system) ──
class UserCreate(BaseModel):
    username: str
    password: str
    role: Literal["admin", "hr"] = "hr"


# ── Standard username/password login (admin & employee) ──
class UserLogin(BaseModel):
    username: str
    password: str


# ── Candidate self-registration via email ──
class CandidateRegister(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    phone: Optional[str] = ""
    resume: Optional[str] = ""


# ── Candidate email-based login ──
class CandidateLogin(BaseModel):
    email: EmailStr
    password: str


# ── Password reset request ──
class ForgotPasswordRequest(BaseModel):
    email: EmailStr


# ── Password reset confirm ──
class ResetPasswordConfirm(BaseModel):
    token: str
    new_password: str

# ── Setup initial password (forced change on first login) ──
class SetupPasswordRequest(BaseModel):
    username: str
    temp_password: str
    new_password: str
