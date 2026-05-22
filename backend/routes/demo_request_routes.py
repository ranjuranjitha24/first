from fastapi import APIRouter, Depends, Query
from dependencies import get_current_user_required, check_super_admin
import controllers.demo_request_controller as ctrl
from models.demo_request_model import DemoRequestCreate, DemoRequestUpdate

router = APIRouter()


# ── PUBLIC (no auth) ──────────────────────────────────────────────
@router.post("/")
def submit_demo_request(data: DemoRequestCreate):
    """Public endpoint — anyone can submit a demo request from the landing page."""
    return {"success": True, "data": ctrl.create_demo_request(data)}


# ── ADMIN ONLY ────────────────────────────────────────────────────
@router.get("/")
def list_demo_requests(
    status: str = Query(None),
    user: dict = Depends(check_super_admin)
):
    """Admin: list all demo requests, optionally filtered by status."""
    return {"success": True, "data": ctrl.get_all_demo_requests(status)}


@router.get("/stats")
def demo_stats(user: dict = Depends(check_super_admin)):
    """Admin: get demo request counts by status."""
    return {"success": True, "data": ctrl.get_demo_stats()}


@router.get("/{req_id}")
def get_demo_request(req_id: str, user: dict = Depends(check_super_admin)):
    """Admin: get a single demo request."""
    doc = ctrl.get_demo_request_by_id(req_id)
    if not doc:
        return {"success": False, "message": "Demo request not found"}
    return {"success": True, "data": doc}


@router.put("/{req_id}")
def update_demo_request(req_id: str, data: DemoRequestUpdate, user: dict = Depends(check_super_admin)):
    """Admin: update demo request status, schedule, or notes."""
    return {"success": True, "data": ctrl.update_demo_request(req_id, data)}


@router.delete("/{req_id}")
def delete_demo_request(req_id: str, user: dict = Depends(check_super_admin)):
    """Admin: delete a demo request."""
    return {"success": True, "data": ctrl.delete_demo_request(req_id)}
