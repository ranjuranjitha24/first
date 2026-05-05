from fastapi import APIRouter, Query
from models.job_model import JobCreate, JobUpdate
import controllers.job_controller as ctrl

router = APIRouter()

@router.get("/")
def list_jobs(status: str = Query("")):
    return {"success": True, "data": ctrl.get_all_jobs(status)}

@router.post("/")
def add_job(data: JobCreate):
    return {"success": True, "data": ctrl.create_job(data)}

@router.put("/{job_id}")
def update_job(job_id: str, data: JobUpdate):
    return {"success": True, "data": ctrl.update_job(job_id, data)}

@router.delete("/{job_id}")
def delete_job(job_id: str):
    return {"success": True, "data": ctrl.delete_job(job_id)}
