from bson import ObjectId
from bson.errors import InvalidId
from fastapi import HTTPException
from config.db import interviews_col, employees_col
from models.interview_model import InterviewCreate, InterviewUpdate
from datetime import datetime, timezone


def serialize_interview(doc) -> dict:
    if doc is None:
        return None
    doc["_id"] = str(doc["_id"])
    # Populate employee details
    try:
        emp = employees_col.find_one({"_id": ObjectId(doc["employee"])})
        if emp:
            emp["_id"] = str(emp["_id"])
            doc["employee"] = {
                "_id":        emp["_id"],
                "name":       emp.get("name", ""),
                "email":      emp.get("email", ""),
                "role":       emp.get("role", ""),
                "experience": emp.get("experience", ""),
            }
        else:
            doc["employee"] = {"_id": doc["employee"], "name": "Unknown", "email": "", "role": "", "experience": ""}
    except Exception:
        doc["employee"] = {"_id": str(doc.get("employee", "")), "name": "Unknown", "email": "", "role": "", "experience": ""}
    return doc


def get_all_interviews(status: str = "", employee_id: str = "") -> list:
    query = {}
    if status:
        query["status"] = status
    if employee_id:
        query["employee"] = employee_id
    docs = list(interviews_col.find(query).sort([("date", 1), ("time", 1)]))
    return [serialize_interview(d) for d in docs]


def get_upcoming_interviews(employee_id: str = "") -> list:
    from datetime import date
    today = date.today().isoformat()
    query = {"status": "Scheduled", "date": {"$gte": today}}
    if employee_id:
        query["employee"] = employee_id
    docs = list(
        interviews_col.find(query)
        .sort([("date", 1), ("time", 1)])
        .limit(5)
    )
    return [serialize_interview(d) for d in docs]


def create_interview(data: InterviewCreate) -> dict:
    # Check slot conflict
    conflict = interviews_col.find_one({
        "date":   data.date,
        "time":   data.time,
        "status": "Scheduled",
    })
    if conflict:
        raise HTTPException(
            status_code=409,
            detail="This time slot is already booked. Please choose another time."
        )
    payload = data.model_dump()
    payload["status"]    = "Scheduled"
    payload["createdAt"] = datetime.now(timezone.utc).isoformat()
    result = interviews_col.insert_one(payload)
    return serialize_interview(interviews_col.find_one({"_id": result.inserted_id}))


def update_interview(int_id: str, data: InterviewUpdate) -> dict:
    try:
        oid = ObjectId(int_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid interview ID")
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}

    # Check slot conflict if date/time is changing
    if "date" in update_data or "time" in update_data:
        existing = interviews_col.find_one({"_id": oid})
        check_date = update_data.get("date", existing["date"] if existing else "")
        check_time = update_data.get("time", existing["time"] if existing else "")
        conflict = interviews_col.find_one({
            "date":   check_date,
            "time":   check_time,
            "status": "Scheduled",
            "_id":    {"$ne": oid}
        })
        if conflict:
            raise HTTPException(status_code=409, detail="Slot already taken.")

    interviews_col.update_one({"_id": oid}, {"$set": update_data})
    return serialize_interview(interviews_col.find_one({"_id": oid}))


def delete_interview(int_id: str) -> dict:
    try:
        oid = ObjectId(int_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid interview ID")
    doc = interviews_col.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="Interview not found")
    interviews_col.delete_one({"_id": oid})
    return {"message": "Interview deleted"}
