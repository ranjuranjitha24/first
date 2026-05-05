from bson import ObjectId
from bson.errors import InvalidId
from fastapi import HTTPException
from config.db import jobs_col
from models.job_model import JobCreate, JobUpdate
from datetime import datetime, timezone

def serialize(doc) -> dict:
    if doc is None: return None
    doc["_id"] = str(doc["_id"])
    return doc

def get_all_jobs(status: str = "") -> list:
    query = {"status": status} if status else {}
    return [serialize(d) for d in jobs_col.find(query).sort("createdAt", -1)]

def create_job(data: JobCreate) -> dict:
    payload = data.model_dump()
    payload["createdAt"] = datetime.now(timezone.utc).isoformat()
    result = jobs_col.insert_one(payload)
    return serialize(jobs_col.find_one({"_id": result.inserted_id}))

def update_job(job_id: str, data: JobUpdate) -> dict:
    try: oid = ObjectId(job_id)
    except InvalidId: raise HTTPException(400, "Invalid job ID")
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    jobs_col.update_one({"_id": oid}, {"$set": update_data})
    return serialize(jobs_col.find_one({"_id": oid}))

def delete_job(job_id: str) -> dict:
    try: oid = ObjectId(job_id)
    except InvalidId: raise HTTPException(400, "Invalid job ID")
    jobs_col.delete_one({"_id": oid})
    return {"message": "Job deleted"}
