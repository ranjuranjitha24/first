from fastapi import APIRouter, Query
from models.employee_model import EmployeeCreate, EmployeeUpdate
import controllers.employee_controller as ctrl

router = APIRouter()

@router.get("/stats")
def stats():
    return {"success": True, "data": ctrl.get_stats()}

@router.get("/")
def list_employees(search: str = Query(""), role: str = Query("")):
    return {"success": True, "data": ctrl.get_all_employees(search, role)}

@router.get("/{emp_id}")
def get_employee(emp_id: str):
    return {"success": True, "data": ctrl.get_employee(emp_id)}

@router.post("/")
def add_employee(data: EmployeeCreate):
    return {"success": True, "data": ctrl.create_employee(data)}

@router.put("/{emp_id}")
def update_employee(emp_id: str, data: EmployeeUpdate):
    return {"success": True, "data": ctrl.update_employee(emp_id, data)}

@router.delete("/{emp_id}")
def delete_employee(emp_id: str):
    return {"success": True, "data": ctrl.delete_employee(emp_id)}
