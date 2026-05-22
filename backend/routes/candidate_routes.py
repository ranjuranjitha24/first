from fastapi import APIRouter, Query, Depends
from models.candidate_model import CandidateCreate, CandidateUpdate
import controllers.candidate_controller as ctrl
from dependencies import check_admin, get_current_user_required

router = APIRouter()

@router.get("/stats")
def pipeline_stats(user: dict = Depends(get_current_user_required)):
    return {"success": True, "data": ctrl.get_pipeline_stats(company_id=user.get("company_id"))}

@router.get("/")
def list_candidates(stage: str = Query(""), job_id: str = Query(""), user: dict = Depends(get_current_user_required)):
    return {"success": True, "data": ctrl.get_all_candidates(stage, job_id, company_id=user.get("company_id"))}

@router.post("/")
def add_candidate(data: CandidateCreate, user: dict = Depends(check_admin)):
    return {"success": True, "data": ctrl.create_candidate(data, company_id=user.get("company_id"))}

@router.put("/{cid}")
def update_candidate(cid: str, data: CandidateUpdate, user: dict = Depends(check_admin)):
    return {"success": True, "data": ctrl.update_candidate(cid, data, company_id=user.get("company_id"))}

@router.delete("/{cid}")
def delete_candidate(cid: str, user: dict = Depends(check_admin)):
    return {"success": True, "data": ctrl.delete_candidate(cid, company_id=user.get("company_id"))}
