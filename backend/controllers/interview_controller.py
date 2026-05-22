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

def get_interviews(date: str = "", status: str = "", employee_id: str = "", company_id: str = None):
    query = {}
    if company_id: query["company_id"] = company_id
    if date: query["date"] = date
    if status: query["status"] = status
    if employee_id: query["employee"] = employee_id
    
    docs = list(interviews_col.find(query).sort("date", 1).sort("time", 1))
    return [serialize(d) for d in docs]

def get_upcoming_interviews(employee_id: str = "", company_id: str = None):
    query = {"status": "Scheduled"}
    if company_id: query["company_id"] = company_id
    if employee_id: query["employee"] = employee_id
    
    docs = list(interviews_col.find(query).sort("date", 1).limit(10))
    return [serialize(d) for d in docs]

def schedule_interview(data: InterviewCreate, current_username: str = None, company_id: str = None):
    payload = data.model_dump()
    payload["status"] = "Scheduled"
    payload["createdAt"] = datetime.now().isoformat()
    if company_id:
        payload["company_id"] = company_id
    
    res = interviews_col.insert_one(payload)
    
    if current_username:
        from config.db import users_col
        users_col.update_one(
            {"username": current_username, "isDemoUser": True},
            {"$inc": {"currentUsage.interviews": 1}}
        )
        
    return serialize(interviews_col.find_one({"_id": res.inserted_id}))

def update_interview(iid: str, data: InterviewUpdate, company_id: str = None):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    query = {"_id": ObjectId(iid)}
    if company_id:
        query["company_id"] = company_id
    interviews_col.update_one(query, {"$set": update_data})
    return serialize(interviews_col.find_one(query))

def delete_interview(iid: str, company_id: str = None):
    query = {"_id": ObjectId(iid)}
    if company_id:
        query["company_id"] = company_id
    interviews_col.delete_one(query)
    return {"message": "Interview cancelled"}
