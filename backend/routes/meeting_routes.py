from fastapi import APIRouter, Depends, Query
from dependencies import get_current_user_required, check_admin
import controllers.meeting_controller as ctrl
from models.meeting_model import MeetingCreate, MeetingUpdate

router = APIRouter()

@router.get("/")
def list_meetings(
    employee_id: str = Query(None), 
    status: str = Query(None),
    user: dict = Depends(get_current_user_required)
):
    # Employees can only see their own meetings
    if user.get("role") == "employee":
        emp_id = user.get("employee_id")
        if not emp_id:
            # Fallback: find employee by username if token is old/missing id
            from config.db import employees_col
            emp = employees_col.find_one({"name": {"$regex": f"^{user.get('username')}$", "$options": "i"}})
            if emp: emp_id = str(emp["_id"])
    else:
        emp_id = employee_id
        
    return {"success": True, "data": ctrl.get_all_meetings(emp_id, status)}

@router.post("/")
def schedule_meeting(data: MeetingCreate, user: dict = Depends(check_admin)):
    return {"success": True, "data": ctrl.create_meeting(data)}

@router.put("/{mid}")
def update_meeting(mid: str, data: MeetingUpdate, user: dict = Depends(get_current_user_required)):
    # Basic protection: only Admin/HR or the assigned employee can update status?
    # Usually only Admin/HR should reschedule.
    return {"success": True, "data": ctrl.update_meeting(mid, data)}

@router.delete("/{mid}")
def delete_meeting(mid: str, user: dict = Depends(check_admin)):
    return {"success": True, "data": ctrl.delete_meeting(mid)}

@router.get("/upcoming")
def upcoming_meetings(user: dict = Depends(get_current_user_required)):
    emp_id = user.get("employee_id")
    if not emp_id and user.get("role") == "employee":
        from config.db import employees_col
        emp = employees_col.find_one({"name": {"$regex": f"^{user.get('username')}$", "$options": "i"}})
        if emp: emp_id = str(emp["_id"])
        
    if not emp_id: return {"success": False, "message": "Not an employee"}
    return {"success": True, "data": ctrl.get_upcoming_meetings(emp_id)}
