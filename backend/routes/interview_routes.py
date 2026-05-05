from fastapi import APIRouter, Query, Depends
from models.interview_model import InterviewCreate, InterviewUpdate
import controllers.interview_controller as ctrl
from dependencies import get_current_user_required

router = APIRouter()

@router.get("/upcoming")
def upcoming(user: dict = Depends(get_current_user_required)):
    emp_id = user.get("employee_id") if user.get("role") == "employee" else ""
    return {"success": True, "data": ctrl.get_upcoming_interviews(emp_id)}

@router.get("/")
def list_interviews(status: str = Query(""), user: dict = Depends(get_current_user_required)):
    emp_id = user.get("employee_id") if user.get("role") == "employee" else ""
    return {"success": True, "data": ctrl.get_all_interviews(status, emp_id)}

@router.post("/")
def add_interview(data: InterviewCreate, user: dict = Depends(get_current_user_required)):
    return {"success": True, "data": ctrl.create_interview(data)}

@router.put("/{int_id}")
def update_interview(int_id: str, data: InterviewUpdate, user: dict = Depends(get_current_user_required)):
    return {"success": True, "data": ctrl.update_interview(int_id, data)}

@router.delete("/{int_id}")
def delete_interview(int_id: str, user: dict = Depends(get_current_user_required)):
    return {"success": True, "data": ctrl.delete_interview(int_id)}
