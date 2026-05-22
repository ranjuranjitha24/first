from fastapi import APIRouter, Query
from models.job_model import JobCreate, JobUpdate
import controllers.job_controller as ctrl
from dependencies import check_admin, get_current_user_required

router = APIRouter()

@router.get("/")
def list_jobs(status: str = Query(""), user: dict = Depends(get_current_user_required)):
    return {"success": True, "data": ctrl.get_all_jobs(status, company_id=user.get("company_id"))}

@router.post("/")
def add_job(data: JobCreate, user: dict = Depends(check_admin)):
    return {"success": True, "data": ctrl.create_job(data, company_id=user.get("company_id"))}

@router.put("/{job_id}")
def update_job(job_id: str, data: JobUpdate, user: dict = Depends(check_admin)):
    return {"success": True, "data": ctrl.update_job(job_id, data, company_id=user.get("company_id"))}

@router.delete("/{job_id}")
def delete_job(job_id: str, user: dict = Depends(check_admin)):
    return {"success": True, "data": ctrl.delete_job(job_id, company_id=user.get("company_id"))}
