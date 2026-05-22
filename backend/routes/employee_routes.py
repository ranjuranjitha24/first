from fastapi import APIRouter, Query, Depends
from models.employee_model import EmployeeCreate, EmployeeUpdate
import controllers.employee_controller as ctrl
from dependencies import check_admin, get_current_user_required, check_demo_limit

router = APIRouter()

@router.get("/stats")
def stats(user: dict = Depends(get_current_user_required)):
    emp_id = user.get("employee_id") if user.get("role") == "employee" else ""
    return {"success": True, "data": ctrl.get_stats(employee_id=emp_id, company_id=user.get("company_id"))}

@router.get("/")
def list_employees(search: str = Query(""), role: str = Query(""), user: dict = Depends(check_admin)):
    return {"success": True, "data": ctrl.get_all_employees(search, role, company_id=user.get("company_id"))}

@router.get("/{emp_id}")
def get_employee(emp_id: str, user: dict = Depends(check_admin)):
    return {"success": True, "data": ctrl.get_employee(emp_id, company_id=user.get("company_id"))}

@router.post("/")
def add_employee(data: EmployeeCreate, user: dict = Depends(check_admin), limit_check = Depends(check_demo_limit("employees"))):
    return {"success": True, "data": ctrl.create_employee(data, user.get("username"), company_id=user.get("company_id"))}

@router.put("/{emp_id}")
def update_employee(emp_id: str, data: EmployeeUpdate, user: dict = Depends(check_admin)):
    return {"success": True, "data": ctrl.update_employee(emp_id, data, company_id=user.get("company_id"))}

@router.delete("/{emp_id}")
def delete_employee(emp_id: str, user: dict = Depends(check_admin)):
    return {"success": True, "data": ctrl.delete_employee(emp_id, company_id=user.get("company_id"))}
