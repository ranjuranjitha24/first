from fastapi import APIRouter, Depends, Query
from dependencies import get_current_user_required, check_admin
import controllers.attendance_controller as ctrl
from models.attendance_model import AttendanceCheck

router = APIRouter()

@router.get("/")
def get_attendance(
    employee_id: str = Query(None), 
    date: str = Query(None), 
    search: str = Query(""),
    user: dict = Depends(get_current_user_required)
):
    # If employee, they can only see their own attendance
    if user.get("role") == "employee":
        emp_id = user.get("employee_id")
    else:
        emp_id = employee_id
    
    return {"success": True, "data": ctrl.get_attendance(emp_id, date, search)}

@router.get("/stats")
def get_stats(employee_id: str = Query(None), user: dict = Depends(get_current_user_required)):
    if user.get("role") == "employee":
        emp_id = user.get("employee_id")
        if not emp_id:
            return {"success": False, "message": "employee_id required"}
    else:
        emp_id = employee_id
        
    return {"success": True, "data": ctrl.get_attendance_stats(emp_id)}

@router.post("/check")
def attendance_check(data: AttendanceCheck, user: dict = Depends(get_current_user_required)):
    # Verify employee_id matches if user is employee
    if user.get("role") == "employee" and data.employee_id != user.get("employee_id"):
        return {"success": False, "message": "Unauthorized"}
        
    res = ctrl.check_in_out(data.employee_id, data.type)
    return {"success": True, "data": res}
