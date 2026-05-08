from fastapi import APIRouter, Depends
from models.interview_model import InterviewCreate, InterviewUpdate
import controllers.interview_controller as ctrl
from dependencies import check_admin, get_current_user_required

router = APIRouter()

@router.get("/")
def list_interviews(user: dict = Depends(get_current_user_required)):
    emp_id = user.get("employee_id") if user.get("role") == "employee" else ""
    return {"success": True, "data": ctrl.get_interviews(employee_id=emp_id)}

@router.get("/upcoming")
def upcoming(user: dict = Depends(get_current_user_required)):
    emp_id = user.get("employee_id") if user.get("role") == "employee" else ""
    return {"success": True, "data": ctrl.get_upcoming_interviews(employee_id=emp_id)}

@router.post("/")
def add_interview(data: InterviewCreate, user: dict = Depends(check_admin)):
    return {"success": True, "data": ctrl.schedule_interview(data)}

@router.put("/{int_id}")
def update_interview(int_id: str, data: InterviewUpdate, user: dict = Depends(check_admin)):
    return {"success": True, "data": ctrl.update_interview(int_id, data)}

@router.delete("/{int_id}")
def delete_interview(int_id: str, user: dict = Depends(check_admin)):
    return {"success": True, "data": ctrl.delete_interview(int_id)}
