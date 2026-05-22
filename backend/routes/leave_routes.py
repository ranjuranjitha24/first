from fastapi import APIRouter, Query, Depends
from models.leave_model import LeaveCreate, LeaveUpdate
import controllers.leave_controller as ctrl
from dependencies import get_current_user_required, check_admin

router = APIRouter()

@router.get("/")
def list_leaves(status: str = Query(""), user: dict = Depends(get_current_user_required)):
    emp_id = user.get("employee_id") if user.get("role") == "employee" else ""
    return {"success": True, "data": ctrl.get_all_leaves(status, emp_id, company_id=user.get("company_id"))}

@router.get("/balances")
def get_balances(user: dict = Depends(get_current_user_required)):
    emp_id = user.get("employee_id")
    if not emp_id: return {"success": False, "message": "No employee linked"}
    return {"success": True, "data": ctrl.get_leave_balances(emp_id, company_id=user.get("company_id"))}

@router.get("/stats")
def get_stats(user: dict = Depends(check_admin)):
    return {"success": True, "data": ctrl.get_leave_stats(company_id=user.get("company_id"))}

@router.post("/")
def add_leave(data: LeaveCreate, user: dict = Depends(get_current_user_required)):
    # Auto-assign employee_id if user is employee
    if user.get("role") == "employee":
        data.employee_id = user.get("employee_id")
    elif not data.employee_id:
        return {"success": False, "message": "Employee ID is required"}
    
    return {"success": True, "data": ctrl.create_leave(data, company_id=user.get("company_id"))}

@router.put("/{lid}")
def update_leave(lid: str, data: LeaveUpdate, user: dict = Depends(get_current_user_required)):
    # Only Admin/HR can approve/reject
    if user.get("role") == "employee":
        return {"success": False, "message": "Employees cannot update leave status"}
    
    return {"success": True, "data": ctrl.update_leave(lid, data, company_id=user.get("company_id"))}

@router.delete("/{lid}")
def delete_leave(lid: str, user: dict = Depends(get_current_user_required)):
    # Employees can only delete their own PENDING leaves
    if user.get("role") == "employee":
        leave = ctrl.get_leave_by_id(lid, company_id=user.get("company_id"))
        if not leave:
            return {"success": False, "message": "Leave request not found"}
        if leave["employee_id"] != user.get("employee_id"):
            return {"success": False, "message": "Unauthorized"}
        if leave["status"] != "Pending":
            return {"success": False, "message": "Cannot delete non-pending leaves"}
            
    return {"success": True, "data": ctrl.delete_leave(lid, company_id=user.get("company_id"))}
