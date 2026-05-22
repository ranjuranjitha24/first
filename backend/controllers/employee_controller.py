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


def get_all_employees(search: str = "", role: str = "", company_id: str = None):
    query = {}
    if company_id:
        query["company_id"] = company_id
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


def get_employee(emp_id: str, company_id: str = None) -> dict:
    try:
        query = {"_id": ObjectId(emp_id)}
        if company_id:
            query["company_id"] = company_id
        doc = employees_col.find_one(query)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid employee ID")
    if not doc:
        raise HTTPException(status_code=404, detail="Employee not found")
    return serialize(doc)


def create_employee(data: EmployeeCreate, current_username: str = None, company_id: str = None) -> dict:
    # Check duplicate email
    if employees_col.find_one({"email": data.email}):
        raise HTTPException(status_code=400, detail="Email already exists")
    
    payload = data.model_dump()
    # Remove auth fields from employee document
    username = payload.pop("username", None)
    password = payload.pop("password", None)
    
    payload["createdAt"] = datetime.now(timezone.utc).isoformat()
    if company_id:
        payload["company_id"] = company_id
    result = employees_col.insert_one(payload)
    emp_id = str(result.inserted_id)
    
    # Auto-create user account for this employee
    from controllers.auth_controller import hash_pw
    from config.db import users_col
    
    auth_username = username or data.email
    auth_password = hash_pw(password or "welcome123")
    
    if not users_col.find_one({"username": auth_username}):
        users_col.insert_one({
            "username": auth_username,
            "password": auth_password,
            "role": "employee",
            "employee_id": emp_id,
            "company_id": company_id
        })

    # Increment demo limit if applicable
    if current_username:
        users_col.update_one(
            {"username": current_username, "isDemoUser": True},
            {"$inc": {"currentUsage.employees": 1}}
        )

    return serialize(employees_col.find_one({"_id": result.inserted_id}))


def update_employee(emp_id: str, data: EmployeeUpdate, company_id: str = None) -> dict:
    try:
        oid = ObjectId(emp_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid employee ID")
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    query = {"_id": oid}
    if company_id:
        query["company_id"] = company_id

    old_doc = employees_col.find_one(query)
    if not old_doc:
        raise HTTPException(status_code=404, detail="Employee not found")

    employees_col.update_one(query, {"$set": update_data})
    
    # Update username if email changed
    if "email" in update_data and update_data["email"] != old_doc["email"]:
        from config.db import users_col
        users_col.update_one({"username": old_doc["email"]}, {"$set": {"username": update_data["email"]}})

    return serialize(employees_col.find_one({"_id": oid}))


def delete_employee(emp_id: str, company_id: str = None) -> dict:
    try:
        oid = ObjectId(emp_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid employee ID")
        
    query = {"_id": oid}
    if company_id:
        query["company_id"] = company_id
        
    doc = employees_col.find_one(query)
    if not doc:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    # Delete associated user account
    from config.db import users_col
    users_col.delete_one({"username": doc["email"]})

    employees_col.delete_one(query)
    # Also delete related interviews
    int_query = {"employee": emp_id}
    if company_id:
        int_query["company_id"] = company_id
    interviews_col.delete_many(int_query)
    return {"message": "Employee and their user account deleted"}


def get_stats(employee_id: str = "", company_id: str = None) -> dict:
    query = {}
    if company_id:
        query["company_id"] = company_id
    if employee_id:
        query["employee"] = employee_id
        
    total_interviews = interviews_col.count_documents(query)
    scheduled        = interviews_col.count_documents({**query, "status": "Scheduled"})
    completed        = interviews_col.count_documents({**query, "status": "Completed"})
    cancelled        = interviews_col.count_documents({**query, "status": "Cancelled"})
    
    if employee_id:
        # For employee, return their personal stats
        return {
            "totalInterviews": total_interviews,
            "scheduled":       scheduled,
            "completed":       completed,
            "cancelled":       cancelled,
            "totalEmployees": 1 # Just for dashboard fallback
        }

    emp_query = {}
    if company_id:
        emp_query["company_id"] = company_id
    total_employees  = employees_col.count_documents(emp_query)
    return {
        "totalEmployees":  total_employees,
        "totalInterviews": total_interviews,
        "scheduled":       scheduled,
        "completed":       completed,
        "cancelled":       cancelled,
    }
