from bson import ObjectId
from bson.errors import InvalidId
from fastapi import HTTPException
from config.db import leaves_col, employees_col
from models.leave_model import LeaveCreate, LeaveUpdate
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

def get_all_leaves(status: str = "", employee_id: str = "") -> list:
    query = {}
    if status: query["status"] = status
    if employee_id: query["employee_id"] = employee_id
    return [serialize(d) for d in leaves_col.find(query).sort("createdAt", -1)]

def create_leave(data: LeaveCreate) -> dict:
    payload = data.model_dump()
    payload["createdAt"] = datetime.now(timezone.utc).isoformat()
    result = leaves_col.insert_one(payload)
    return serialize(leaves_col.find_one({"_id": result.inserted_id}))

def update_leave(lid: str, data: LeaveUpdate) -> dict:
    try: oid = ObjectId(lid)
    except InvalidId: raise HTTPException(400, "Invalid leave ID")
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    leaves_col.update_one({"_id": oid}, {"$set": update_data})
    return serialize(leaves_col.find_one({"_id": oid}))

def delete_leave(lid: str) -> dict:
    try: oid = ObjectId(lid)
    except InvalidId: raise HTTPException(400, "Invalid leave ID")
    leaves_col.delete_one({"_id": oid})
    return {"message": "Leave deleted"}
