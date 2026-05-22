from bson import ObjectId
from bson.errors import InvalidId
from fastapi import HTTPException
from config.db import candidates_col, jobs_col
from models.candidate_model import CandidateCreate, CandidateUpdate
from datetime import datetime, timezone

def serialize(doc, company_id=None) -> dict:
    if doc is None: return None
    doc["_id"] = str(doc["_id"])
    # Populate job title
    try:
        query = {"_id": ObjectId(doc.get("job_id", ""))}
        if company_id: query["company_id"] = company_id
        job = jobs_col.find_one(query)
        doc["job_title"] = job.get("title", "Unknown") if job else "Unknown"
    except Exception:
        doc["job_title"] = "Unknown"
    return doc

def get_all_candidates(stage: str = "", job_id: str = "", company_id: str = None) -> list:
    query = {}
    if company_id: query["company_id"] = company_id
    if stage:  query["stage"]  = stage
    if job_id: query["job_id"] = job_id
    return [serialize(d, company_id) for d in candidates_col.find(query).sort("createdAt", -1)]

def create_candidate(data: CandidateCreate, company_id: str = None) -> dict:
    payload = data.model_dump()
    payload["createdAt"] = datetime.now(timezone.utc).isoformat()
    if company_id: payload["company_id"] = company_id
    result = candidates_col.insert_one(payload)
    return serialize(candidates_col.find_one({"_id": result.inserted_id}), company_id)

def update_candidate(cid: str, data: CandidateUpdate, company_id: str = None) -> dict:
    try: oid = ObjectId(cid)
    except InvalidId: raise HTTPException(400, "Invalid candidate ID")
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    query = {"_id": oid}
    if company_id: query["company_id"] = company_id
    candidates_col.update_one(query, {"$set": update_data})
    return serialize(candidates_col.find_one(query), company_id)

def delete_candidate(cid: str, company_id: str = None) -> dict:
    try: oid = ObjectId(cid)
    except InvalidId: raise HTTPException(400, "Invalid candidate ID")
    query = {"_id": oid}
    if company_id: query["company_id"] = company_id
    candidates_col.delete_one(query)
    return {"message": "Candidate deleted"}

def get_pipeline_stats(company_id: str = None) -> dict:
    stages = ["Applied", "Shortlisted", "Interviewed", "Hired", "Rejected"]
    query = {}
    if company_id: query["company_id"] = company_id
    
    stats = {}
    for s in stages:
        q = query.copy()
        q["stage"] = s
        stats[s] = candidates_col.count_documents(q)
    return stats
