from bson import ObjectId
from bson.errors import InvalidId
from fastapi import HTTPException
from config.db import reviews_col, employees_col
from models.review_model import ReviewCreate, ReviewUpdate
from datetime import datetime, timezone

def serialize(doc) -> dict:
    if doc is None: return None
    doc["_id"] = str(doc["_id"])
    try:
        emp = employees_col.find_one({"_id": ObjectId(doc.get("employee_id", ""))})
        doc["employee_name"] = emp.get("name", "Unknown") if emp else "Unknown"
        doc["employee_role"] = emp.get("role", "") if emp else ""
    except Exception:
        doc["employee_name"] = "Unknown"; doc["employee_role"] = ""
    return doc

def get_all_reviews(employee_id: str = "") -> list:
    query = {}
    if employee_id: query["employee_id"] = employee_id
    return [serialize(d) for d in reviews_col.find(query).sort("createdAt", -1)]

def create_review(data: ReviewCreate) -> dict:
    if not 1 <= data.rating <= 5:
        raise HTTPException(400, "Rating must be between 1 and 5")
    payload = data.model_dump()
    payload["createdAt"] = datetime.now(timezone.utc).isoformat()
    result = reviews_col.insert_one(payload)
    return serialize(reviews_col.find_one({"_id": result.inserted_id}))

def update_review(rid: str, data: ReviewUpdate) -> dict:
    try: oid = ObjectId(rid)
    except InvalidId: raise HTTPException(400, "Invalid review ID")
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    reviews_col.update_one({"_id": oid}, {"$set": update_data})
    return serialize(reviews_col.find_one({"_id": oid}))

def delete_review(rid: str) -> dict:
    try: oid = ObjectId(rid)
    except InvalidId: raise HTTPException(400, "Invalid review ID")
    reviews_col.delete_one({"_id": oid})
    return {"message": "Review deleted"}
