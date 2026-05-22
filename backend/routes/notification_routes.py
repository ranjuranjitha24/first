from fastapi import APIRouter, Depends
from dependencies import get_current_user_required
import controllers.notification_controller as ctrl

router = APIRouter()

@router.get("/")
def get_my_notifications(user: dict = Depends(get_current_user_required)):
    return {"success": True, "data": ctrl.get_notifications(user.get("employee_id"), company_id=user.get("company_id"))}

@router.get("/unread-count")
def unread_count(user: dict = Depends(get_current_user_required)):
    return {"success": True, "count": ctrl.get_unread_count(user.get("employee_id"), company_id=user.get("company_id"))}

@router.put("/{nid}/read")
def mark_read(nid: str, user: dict = Depends(get_current_user_required)):
    return {"success": True, "data": ctrl.mark_as_read(nid, company_id=user.get("company_id"))}

@router.put("/read-all")
def mark_all_read(user: dict = Depends(get_current_user_required)):
    return {"success": True, "data": ctrl.mark_all_as_read(user.get("employee_id"), company_id=user.get("company_id"))}
