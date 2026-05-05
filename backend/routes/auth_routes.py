from fastapi import APIRouter
from models.user_model import UserCreate, UserLogin
import controllers.auth_controller as ctrl

router = APIRouter()

@router.post("/register")
def register(data: UserCreate):
    return {"success": True, "data": ctrl.register_user(data)}

@router.post("/login")
def login(data: UserLogin):
    return {"success": True, "data": ctrl.login_user(data)}
