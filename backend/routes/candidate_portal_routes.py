from fastapi import APIRouter, Depends, Body
from dependencies import get_current_user_required
import controllers.candidate_portal_controller as ctrl
from config.db import jobs_col, candidates_col, interviews_col
from bson import ObjectId

router = APIRouter()


def serialize(doc):
    if not doc:
        return None
    doc["_id"] = str(doc["_id"])
    return doc


# ── Dashboard stats ───────────────────────────────────────────
@router.get("/stats")
def get_stats(user: dict = Depends(get_current_user_required)):
    return {"success": True, "data": ctrl.get_candidate_stats(user)}


# ── Profile ───────────────────────────────────────────────────
@router.get("/profile")
def get_profile(user: dict = Depends(get_current_user_required)):
    return {"success": True, "data": ctrl.get_candidate_profile(user)}

@router.put("/profile")
def update_profile(data: dict = Body(...), user: dict = Depends(get_current_user_required)):
    return {"success": True, "data": ctrl.update_candidate_profile(user, data)}


# ── Notifications ─────────────────────────────────────────────
@router.get("/notifications")
def get_notifications(user: dict = Depends(get_current_user_required)):
    return {"success": True, "data": ctrl.get_notifications(user)}

@router.put("/notifications/{notif_id}/read")
def mark_read(notif_id: str, user: dict = Depends(get_current_user_required)):
    return {"success": True, "data": ctrl.mark_notification_read(notif_id, user)}


# ── Jobs ──────────────────────────────────────────────────────
@router.get("/jobs")
def get_public_jobs(user: dict = Depends(get_current_user_required)):
    query = {"status": "Open"}
    company_id = user.get("company_id")
    if company_id: query["company_id"] = company_id
    jobs = list(jobs_col.find(query).sort("createdAt", -1))
    return {"success": True, "data": [serialize(j) for j in jobs]}


# ── Applications ──────────────────────────────────────────────
@router.get("/my-applications")
def get_my_apps(user: dict = Depends(get_current_user_required)):
    email = user.get("email") or user.get("username", "")
    apps = list(candidates_col.find({"email": email}).sort("createdAt", -1))
    return {"success": True, "data": [serialize(a) for a in apps]}

@router.post("/apply")
def apply_job(data: dict = Body(...), user: dict = Depends(get_current_user_required)):
    return {"success": True, "data": ctrl.apply_to_job(user, data)}


# ── Interviews ────────────────────────────────────────────────
@router.get("/my-interviews")
def get_my_interviews(user: dict = Depends(get_current_user_required)):
    email = user.get("email") or user.get("username", "")
    cand = candidates_col.find_one({"email": email})
    if not cand:
        return {"success": True, "data": []}
    interviews = list(
        interviews_col.find({"candidate_id": str(cand["_id"])}).sort("date", 1)
    )
    return {"success": True, "data": [serialize(i) for i in interviews]}
