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

def get_all_jobs(status: str = "", company_id: str = None) -> list:
    query = {}
    if status: query["status"] = status
    if company_id: query["company_id"] = company_id
    return [serialize(d) for d in jobs_col.find(query).sort("createdAt", -1)]

def create_job(data: JobCreate, company_id: str = None) -> dict:
    payload = data.model_dump()
    payload["createdAt"] = datetime.now(timezone.utc).isoformat()
    if company_id: payload["company_id"] = company_id
    result = jobs_col.insert_one(payload)
    return serialize(jobs_col.find_one({"_id": result.inserted_id}))

def update_job(job_id: str, data: JobUpdate, company_id: str = None) -> dict:
    try: oid = ObjectId(job_id)
    except InvalidId: raise HTTPException(400, "Invalid job ID")
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    query = {"_id": oid}
    if company_id: query["company_id"] = company_id
    jobs_col.update_one(query, {"$set": update_data})
    return serialize(jobs_col.find_one(query))

def delete_job(job_id: str, company_id: str = None) -> dict:
    try: oid = ObjectId(job_id)
    except InvalidId: raise HTTPException(400, "Invalid job ID")
    query = {"_id": oid}
    if company_id: query["company_id"] = company_id
    jobs_col.delete_one(query)
    return {"message": "Job deleted"}
