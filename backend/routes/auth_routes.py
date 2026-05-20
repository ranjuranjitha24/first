from fastapi import APIRouter, Body
from models.user_model import UserCreate, UserLogin, CandidateRegister, CandidateLogin, ForgotPasswordRequest, ResetPasswordConfirm
import controllers.auth_controller as ctrl

router = APIRouter()

# ── Admin / HR ──
@router.post("/register")
def register(data: UserCreate):
    return {"success": True, "data": ctrl.register_user(data)}

@router.post("/login")
def login(data: UserLogin):
    return {"success": True, "data": ctrl.login_user(data)}

# ── Candidate (email-based) ──
@router.post("/candidate/register")
def candidate_register(data: CandidateRegister):
    return {"success": True, "data": ctrl.register_candidate(data)}

@router.post("/candidate/login")
def candidate_login(data: CandidateLogin):
    return {"success": True, "data": ctrl.login_candidate(data)}

# ── Password reset ──
@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordRequest):
    return {"success": True, "data": ctrl.forgot_password(data.email)}

@router.post("/reset-password")
def reset_password(data: ResetPasswordConfirm):
    return {"success": True, "data": ctrl.reset_password(data.token, data.new_password)}
