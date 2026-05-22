from fastapi import APIRouter, Depends, Query
from dependencies import get_current_user_required, check_admin
import controllers.payroll_controller as ctrl
from models.payroll_model import PayrollCreate, PayrollUpdate

router = APIRouter()

@router.get("/")
def list_payroll(
    month: str = Query(""), 
    employee_id: str = Query(""), 
    user: dict = Depends(get_current_user_required)
):
    # Employees can only see their own payroll
    if user.get("role") == "employee":
        emp_id = user.get("employee_id")
    else:
        emp_id = employee_id
    
    return {"success": True, "data": ctrl.get_all_payroll(month, emp_id, company_id=user.get("company_id"))}

@router.get("/stats")
def get_stats(user: dict = Depends(check_admin)):
    return {"success": True, "data": ctrl.get_payroll_stats(company_id=user.get("company_id"))}

@router.post("/")
def add_payroll(data: PayrollCreate, user: dict = Depends(check_admin)):
    return {"success": True, "data": ctrl.create_payroll(data, company_id=user.get("company_id"))}

@router.put("/{pid}")
def update_payroll(pid: str, data: PayrollUpdate, user: dict = Depends(check_admin)):
    return {"success": True, "data": ctrl.update_payroll(pid, data, company_id=user.get("company_id"))}
