from bson import ObjectId
from config.db import reviews_col, employees_col
from models.review_model import ReviewCreate, ReviewUpdate
from fastapi import HTTPException
from datetime import datetime

def serialize(doc, company_id=None) -> dict:
    if not doc: return None
    doc["_id"] = str(doc["_id"])
    if "employee_id" in doc and "employee_name" not in doc:
        emp_query = {"_id": ObjectId(doc["employee_id"])}
        if company_id: emp_query["company_id"] = company_id
        emp = employees_col.find_one(emp_query)
        doc["employee_name"] = emp["name"] if emp else "Unknown"
        doc["employee_role"] = emp["role"] if emp else "N/A"
    return doc

def get_all_reviews(employee_id: str = "", company_id: str = None):
    query = {}
    if company_id: query["company_id"] = company_id
    if employee_id: query["employee_id"] = employee_id
    docs = list(reviews_col.find(query).sort("period", -1))
    return [serialize(d, company_id) for d in docs]

def create_review(data: ReviewCreate, company_id: str = None):
    payload = data.model_dump()
    payload["createdAt"] = datetime.now().isoformat()
    if company_id: payload["company_id"] = company_id
    res = reviews_col.insert_one(payload)
    return serialize(reviews_col.find_one({"_id": res.inserted_id}), company_id)

def update_review(rid: str, data: ReviewUpdate, company_id: str = None):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    query = {"_id": ObjectId(rid)}
    if company_id: query["company_id"] = company_id
    reviews_col.update_one(query, {"$set": update_data})
    return serialize(reviews_col.find_one(query), company_id)

def get_performance_stats(employee_id: str, company_id: str = None):
    query = {"employee_id": employee_id}
    if company_id: query["company_id"] = company_id
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
