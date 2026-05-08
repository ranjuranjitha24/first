from bson import ObjectId
from config.db import leaves_col, employees_col
from models.leave_model import LeaveCreate, LeaveUpdate
from fastapi import HTTPException

def serialize(doc) -> dict:
    if not doc: return None
    doc["_id"] = str(doc["_id"])
    # Join employee name if missing
    if "employee_id" in doc and "employee_name" not in doc:
        emp = employees_col.find_one({"_id": ObjectId(doc["employee_id"])})
        doc["employee_name"] = emp["name"] if emp else "Unknown"
    return doc

def get_all_leaves(status: str = "", employee_id: str = ""):
    query = {}
    if status: query["status"] = status
    if employee_id: query["employee_id"] = employee_id
    
    docs = list(leaves_col.find(query).sort("from_date", -1))
    return [serialize(d) for d in docs]

def create_leave(data: LeaveCreate):
    payload = data.model_dump()
    # In a real app, we'd check if balance > 0 here.
    res = leaves_col.insert_one(payload)
    return serialize(leaves_col.find_one({"_id": res.inserted_id}))

def update_leave(lid: str, data: LeaveUpdate):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    res = leaves_col.update_one({"_id": ObjectId(lid)}, {"$set": update_data})
    return serialize(leaves_col.find_one({"_id": ObjectId(lid)}))

def delete_leave(lid: str):
    leaves_col.delete_one({"_id": ObjectId(lid)})
    return {"message": "Leave request deleted"}

def get_leave_balances(employee_id: str):
    # Mock balance for now, normally stored in employee or separate collection
    return {
        "Sick": 12,
        "Casual": 10,
        "Earned": 18,
        "used": leaves_col.count_documents({"employee_id": employee_id, "status": "Approved"})
    }

def get_leave_stats():
    # Admin stats
    return {
        "pending": leaves_col.count_documents({"status": "Pending"}),
        "approved": leaves_col.count_documents({"status": "Approved"}),
        "rejected": leaves_col.count_documents({"status": "Rejected"}),
        "by_type": list(leaves_col.aggregate([
            {"$group": {"_id": "$leave_type", "count": {"$sum": 1}}}
        ]))
    }
