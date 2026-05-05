from fastapi import APIRouter, Query, Depends
from models.leave_model import LeaveCreate, LeaveUpdate
import controllers.leave_controller as ctrl
from dependencies import get_current_user_required

router = APIRouter()

@router.get("/")
def list_leaves(status: str = Query(""), user: dict = Depends(get_current_user_required)):
    emp_id = user.get("employee_id") if user.get("role") == "employee" else ""
    return {"success": True, "data": ctrl.get_all_leaves(status, emp_id)}

@router.post("/")
def add_leave(data: LeaveCreate, user: dict = Depends(get_current_user_required)):
    # Auto-assign employee_id if not provided and user is employee
    if user.get("role") == "employee" and not data.employee_id:
        data.employee_id = user.get("employee_id")
    return {"success": True, "data": ctrl.create_leave(data)}

@router.put("/{lid}")
def update_leave(lid: str, data: LeaveUpdate, user: dict = Depends(get_current_user_required)):
    return {"success": True, "data": ctrl.update_leave(lid, data)}

@router.delete("/{lid}")
def delete_leave(lid: str, user: dict = Depends(get_current_user_required)):
    return {"success": True, "data": ctrl.delete_leave(lid)}
