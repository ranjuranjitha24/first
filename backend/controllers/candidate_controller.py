from bson import ObjectId
from bson.errors import InvalidId
from fastapi import HTTPException
from config.db import candidates_col, jobs_col
from models.candidate_model import CandidateCreate, CandidateUpdate
from datetime import datetime, timezone

def serialize(doc) -> dict:
    if doc is None: return None
    doc["_id"] = str(doc["_id"])
    # Populate job title
    try:
        job = jobs_col.find_one({"_id": ObjectId(doc.get("job_id", ""))})
        doc["job_title"] = job.get("title", "Unknown") if job else "Unknown"
    except Exception:
        doc["job_title"] = "Unknown"
    return doc

def get_all_candidates(stage: str = "", job_id: str = "") -> list:
    query = {}
    if stage:  query["stage"]  = stage
    if job_id: query["job_id"] = job_id
    return [serialize(d) for d in candidates_col.find(query).sort("createdAt", -1)]

def create_candidate(data: CandidateCreate) -> dict:
    payload = data.model_dump()
    payload["createdAt"] = datetime.now(timezone.utc).isoformat()
    result = candidates_col.insert_one(payload)
    return serialize(candidates_col.find_one({"_id": result.inserted_id}))

def update_candidate(cid: str, data: CandidateUpdate) -> dict:
    try: oid = ObjectId(cid)
    except InvalidId: raise HTTPException(400, "Invalid candidate ID")
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    candidates_col.update_one({"_id": oid}, {"$set": update_data})
    return serialize(candidates_col.find_one({"_id": oid}))

def delete_candidate(cid: str) -> dict:
    try: oid = ObjectId(cid)
    except InvalidId: raise HTTPException(400, "Invalid candidate ID")
    candidates_col.delete_one({"_id": oid})
    return {"message": "Candidate deleted"}

def get_pipeline_stats() -> dict:
    stages = ["Applied", "Shortlisted", "Interviewed", "Hired", "Rejected"]
    return {s: candidates_col.count_documents({"stage": s}) for s in stages}
