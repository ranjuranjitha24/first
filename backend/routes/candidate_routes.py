from fastapi import APIRouter, Query
from models.candidate_model import CandidateCreate, CandidateUpdate
import controllers.candidate_controller as ctrl

router = APIRouter()

@router.get("/stats")
def pipeline_stats():
    return {"success": True, "data": ctrl.get_pipeline_stats()}

@router.get("/")
def list_candidates(stage: str = Query(""), job_id: str = Query("")):
    return {"success": True, "data": ctrl.get_all_candidates(stage, job_id)}

@router.post("/")
def add_candidate(data: CandidateCreate):
    return {"success": True, "data": ctrl.create_candidate(data)}

@router.put("/{cid}")
def update_candidate(cid: str, data: CandidateUpdate):
    return {"success": True, "data": ctrl.update_candidate(cid, data)}

@router.delete("/{cid}")
def delete_candidate(cid: str):
    return {"success": True, "data": ctrl.delete_candidate(cid)}
