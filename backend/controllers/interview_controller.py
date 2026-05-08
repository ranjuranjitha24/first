from bson import ObjectId
from config.db import interviews_col, candidates_col
from models.interview_model import InterviewCreate, InterviewUpdate
from fastapi import HTTPException
from datetime import datetime

def serialize(doc) -> dict:
    if not doc: return None
    doc["_id"] = str(doc["_id"])
    # Populate candidate name
    cand = candidates_col.find_one({"_id": ObjectId(doc["candidate_id"])})
    doc["candidate_name"] = cand["name"] if cand else "Unknown"
    return doc

def get_interviews(date: str = "", status: str = "", employee_id: str = ""):
    query = {}
    if date: query["date"] = date
    if status: query["status"] = status
    if employee_id: query["employee"] = employee_id
    
    docs = list(interviews_col.find(query).sort("date", 1).sort("time", 1))
    return [serialize(d) for d in docs]

def get_upcoming_interviews(employee_id: str = ""):
    query = {"status": "Scheduled"}
    if employee_id: query["employee"] = employee_id
    
    docs = list(interviews_col.find(query).sort("date", 1).limit(10))
    return [serialize(d) for d in docs]

def schedule_interview(data: InterviewCreate):
    payload = data.model_dump()
    payload["status"] = "Scheduled"
    payload["createdAt"] = datetime.now().isoformat()
    
    res = interviews_col.insert_one(payload)
    return serialize(interviews_col.find_one({"_id": res.inserted_id}))

def update_interview(iid: str, data: InterviewUpdate):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    interviews_col.update_one({"_id": ObjectId(iid)}, {"$set": update_data})
    return serialize(interviews_col.find_one({"_id": ObjectId(iid)}))

def delete_interview(iid: str):
    interviews_col.delete_one({"_id": ObjectId(iid)})
    return {"message": "Interview cancelled"}
