from fastapi import APIRouter, Query, Depends
from models.review_model import ReviewCreate, ReviewUpdate
import controllers.review_controller as ctrl
from dependencies import get_current_user_required

router = APIRouter()

@router.get("/")
def list_reviews(employee_id: str = Query(""), user: dict = Depends(get_current_user_required)):
    if user.get("role") == "employee":
        employee_id = user.get("employee_id")
    return {"success": True, "data": ctrl.get_all_reviews(employee_id)}

@router.post("/")
def add_review(data: ReviewCreate, user: dict = Depends(get_current_user_required)):
    return {"success": True, "data": ctrl.create_review(data)}

@router.put("/{rid}")
def update_review(rid: str, data: ReviewUpdate, user: dict = Depends(get_current_user_required)):
    return {"success": True, "data": ctrl.update_review(rid, data)}

@router.delete("/{rid}")
def delete_review(rid: str, user: dict = Depends(get_current_user_required)):
    return {"success": True, "data": ctrl.delete_review(rid)}
