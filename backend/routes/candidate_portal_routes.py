from fastapi import APIRouter, Depends, HTTPException
from dependencies import get_current_user_required
from config.db import jobs_col, candidates_col, interviews_col
from bson import ObjectId
from datetime import datetime

router = APIRouter()

def serialize(doc):
    if not doc: return None
    doc["_id"] = str(doc["_id"])
    return doc

@router.get("/jobs")
def get_public_jobs():
    # Only open jobs
    jobs = list(jobs_col.find({"status": "Open"}).sort("createdAt", -1))
    return {"success": True, "data": [serialize(j) for j in jobs]}

@router.get("/my-applications")
def get_my_apps(user: dict = Depends(get_current_user_required)):
    # Find applications by candidate email or username
    apps = list(candidates_col.find({"email": user["username"]}).sort("applied_date", -1))
    return {"success": True, "data": [serialize(a) for a in apps]}

@router.post("/apply")
def apply_job(data: dict, user: dict = Depends(get_current_user_required)):
    job_id = data.get("job_id")
    job = jobs_col.find_one({"_id": ObjectId(job_id)})
    if not job: raise HTTPException(status_code=404, detail="Job not found")
    
    # Create application
    application = {
        "name": user["username"], # Simplified for demo
        "email": user["username"],
        "job_title": job["title"],
        "job_id": job_id,
        "status": "Applied",
        "applied_date": datetime.now().strftime("%Y-%m-%d"),
        "resume": data.get("resume", ""),
        "createdAt": datetime.now().isoformat()
    }
    candidates_col.insert_one(application)
    return {"success": True, "message": "Applied successfully"}

@router.get("/my-interviews")
def get_my_interviews(user: dict = Depends(get_current_user_required)):
    # First find candidate record
    cand = candidates_col.find_one({"email": user["username"]})
    if not cand: return {"success": True, "data": []}
    
    interviews = list(interviews_col.find({"candidate_id": str(cand["_id"])}).sort("date", 1))
    return {"success": True, "data": [serialize(i) for i in interviews]}
