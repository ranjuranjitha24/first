from bson import ObjectId
from bson.errors import InvalidId
from fastapi import HTTPException
from config.db import employees_col, interviews_col
from models.employee_model import EmployeeCreate, EmployeeUpdate
from datetime import datetime, timezone


def serialize(doc) -> dict:
    """Convert MongoDB doc to JSON-serializable dict."""
    if doc is None:
        return None
    doc["_id"] = str(doc["_id"])
    return doc


def get_all_employees(search: str = "", role: str = ""):
    query = {}
    if role:
        query["role"] = role
    if search:
        query["$or"] = [
            {"name":   {"$regex": search, "$options": "i"}},
            {"email":  {"$regex": search, "$options": "i"}},
            {"skills": {"$regex": search, "$options": "i"}},
        ]
    docs = list(employees_col.find(query).sort("createdAt", -1))
    return [serialize(d) for d in docs]


def get_employee(emp_id: str) -> dict:
    try:
        doc = employees_col.find_one({"_id": ObjectId(emp_id)})
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid employee ID")
    if not doc:
        raise HTTPException(status_code=404, detail="Employee not found")
    return serialize(doc)


def create_employee(data: EmployeeCreate) -> dict:
    # Check duplicate email
    if employees_col.find_one({"email": data.email}):
        raise HTTPException(status_code=400, detail="Email already exists")
    payload = data.model_dump()
    payload["createdAt"] = datetime.now(timezone.utc).isoformat()
    result = employees_col.insert_one(payload)
    
    # Auto-create user account for this employee
    from controllers.auth_controller import hash_pw
    from config.db import users_col
    if not users_col.find_one({"username": data.email}):
        users_col.insert_one({
            "username": data.email,
            "password": hash_pw("welcome123"),
            "role": "employee",
            "employee_id": str(result.inserted_id)
        })

    return serialize(employees_col.find_one({"_id": result.inserted_id}))


def update_employee(emp_id: str, data: EmployeeUpdate) -> dict:
    try:
        oid = ObjectId(emp_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid employee ID")
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    old_doc = employees_col.find_one({"_id": oid})
    if not old_doc:
        raise HTTPException(status_code=404, detail="Employee not found")

    employees_col.update_one({"_id": oid}, {"$set": update_data})
    
    # Update username if email changed
    if "email" in update_data and update_data["email"] != old_doc["email"]:
        from config.db import users_col
        users_col.update_one({"username": old_doc["email"]}, {"$set": {"username": update_data["email"]}})

    return serialize(employees_col.find_one({"_id": oid}))


def delete_employee(emp_id: str) -> dict:
    try:
        oid = ObjectId(emp_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid employee ID")
    doc = employees_col.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    # Delete associated user account
    from config.db import users_col
    users_col.delete_one({"username": doc["email"]})

    employees_col.delete_one({"_id": oid})
    # Also delete related interviews
    interviews_col.delete_many({"employee": emp_id})
    return {"message": "Employee and their user account deleted"}


def get_stats() -> dict:
    total_employees  = employees_col.count_documents({})
    total_interviews = interviews_col.count_documents({})
    scheduled        = interviews_col.count_documents({"status": "Scheduled"})
    completed        = interviews_col.count_documents({"status": "Completed"})
    cancelled        = interviews_col.count_documents({"status": "Cancelled"})
    return {
        "totalEmployees":  total_employees,
        "totalInterviews": total_interviews,
        "scheduled":       scheduled,
        "completed":       completed,
        "cancelled":       cancelled,
    }
