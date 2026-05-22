from fastapi import APIRouter, Query, Depends
from models.review_model import ReviewCreate, ReviewUpdate
import controllers.review_controller as ctrl
from dependencies import get_current_user_required, check_admin

router = APIRouter()

@router.get("/")
def list_reviews(employee_id: str = Query(""), user: dict = Depends(get_current_user_required)):
    # Employees only see their own
    emp_id = user.get("employee_id") if user.get("role") == "employee" else employee_id
    return {"success": True, "data": ctrl.get_all_reviews(emp_id, company_id=user.get("company_id"))}

@router.get("/stats")
def get_stats(employee_id: str = Query(""), user: dict = Depends(get_current_user_required)):
    emp_id = user.get("employee_id") if user.get("role") == "employee" else employee_id
    if not emp_id: return {"success": False, "message": "Employee ID required"}
    return {"success": True, "data": ctrl.get_performance_stats(emp_id, company_id=user.get("company_id"))}

@router.post("/")
def add_review(data: ReviewCreate, user: dict = Depends(check_admin)):
    return {"success": True, "data": ctrl.create_review(data, company_id=user.get("company_id"))}

@router.put("/{rid}")
def update_review(rid: str, data: ReviewUpdate, user: dict = Depends(check_admin)):
    return {"success": True, "data": ctrl.update_review(rid, data, company_id=user.get("company_id"))}
