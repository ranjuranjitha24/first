from bson import ObjectId
from config.db import reviews_col, employees_col
from models.review_model import ReviewCreate, ReviewUpdate
from fastapi import HTTPException
from datetime import datetime

def serialize(doc) -> dict:
    if not doc: return None
    doc["_id"] = str(doc["_id"])
    if "employee_id" in doc and "employee_name" not in doc:
        emp = employees_col.find_one({"_id": ObjectId(doc["employee_id"])})
        doc["employee_name"] = emp["name"] if emp else "Unknown"
        doc["employee_role"] = emp["role"] if emp else "N/A"
    return doc

def get_all_reviews(employee_id: str = ""):
    query = {}
    if employee_id: query["employee_id"] = employee_id
    docs = list(reviews_col.find(query).sort("period", -1))
    return [serialize(d) for d in docs]

def create_review(data: ReviewCreate):
    payload = data.model_dump()
    payload["createdAt"] = datetime.now().isoformat()
    res = reviews_col.insert_one(payload)
    return serialize(reviews_col.find_one({"_id": res.inserted_id}))

def update_review(rid: str, data: ReviewUpdate):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    reviews_col.update_one({"_id": ObjectId(rid)}, {"$set": update_data})
    return serialize(reviews_col.find_one({"_id": ObjectId(rid)}))

def get_performance_stats(employee_id: str):
    query = {"employee_id": employee_id}
    docs = list(reviews_col.find(query).sort("period", 1))
    
    ratings_over_time = [{"period": d["period"], "rating": d["rating"]} for d in docs]
    
    # Latest KPIs for Radar Chart
    latest = docs[-1] if docs else None
    kpis = latest.get("kpis", []) if latest else []
    
    return {
        "history": ratings_over_time,
        "latest_kpis": kpis,
        "avg_rating": sum(d["rating"] for d in docs)/len(docs) if docs else 0,
        "recommendations": reviews_col.count_documents({**query, "promotion_recommendation": True})
    }
