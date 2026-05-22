from bson import ObjectId
from config.db import meetings_col, employees_col
from models.meeting_model import MeetingCreate, MeetingUpdate
from fastapi import HTTPException

def serialize(doc, company_id=None) -> dict:
    if not doc: return None
    doc["_id"] = str(doc["_id"])
    if "assigned_employee" in doc and "assigned_employee_name" not in doc:
        try:
            emp_query = {"_id": ObjectId(doc["assigned_employee"])}
            if company_id: emp_query["company_id"] = company_id
            emp = employees_col.find_one(emp_query)
            doc["assigned_employee_name"] = emp["name"] if emp else "Unknown"
        except:
            doc["assigned_employee_name"] = "Unknown"
    return doc

def get_all_meetings(employee_id: str = None, status: str = None, company_id: str = None):
    query = {}
    if company_id: query["company_id"] = company_id
    if employee_id: 
        print(f"🔍 [Meeting Query] Searching for employee_id: {employee_id}")
        # Robust check for both string and ObjectId
        try:
            oid = ObjectId(employee_id)
            query["$or"] = [
                {"assigned_employee": employee_id},
                {"assigned_employee": oid}
            ]
        except:
            query["assigned_employee"] = employee_id
            
    if status: query["status"] = status
    
    docs = list(meetings_col.find(query).sort("date", 1).sort("time", 1))
    print(f"✅ [Meeting Query] Found {len(docs)} meetings")
    return [serialize(d, company_id) for d in docs]

from controllers.notification_controller import create_notification
from models.notification_model import NotificationCreate

def create_meeting(data: MeetingCreate, company_id: str = None):
    payload = data.model_dump()
    if company_id: payload["company_id"] = company_id
    res = meetings_col.insert_one(payload)
    
    # Create notification for employee
    try:
        create_notification(NotificationCreate(
            user_id=data.assigned_employee,
            title="📅 New Meeting Scheduled",
            message=f"You have a new meeting: {data.title} on {data.date} at {data.time}.",
            type="MEETING"
        ))
    except Exception as e:
        print(f"Notification Error: {e}")
        
    return serialize(meetings_col.find_one({"_id": res.inserted_id}), company_id)

def update_meeting(mid: str, data: MeetingUpdate, company_id: str = None):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    query = {"_id": ObjectId(mid)}
    if company_id: query["company_id"] = company_id
    meetings_col.update_one(query, {"$set": update_data})
    return serialize(meetings_col.find_one(query), company_id)

def delete_meeting(mid: str, company_id: str = None):
    query = {"_id": ObjectId(mid)}
    if company_id: query["company_id"] = company_id
    meetings_col.delete_one(query)
    return {"message": "Meeting deleted"}

def get_upcoming_meetings(employee_id: str, company_id: str = None):
    # Robust check for both string and ObjectId
    query = {"status": "Scheduled"}
    if company_id: query["company_id"] = company_id
    try:
        oid = ObjectId(employee_id)
        query["$or"] = [
            {"assigned_employee": employee_id},
            {"assigned_employee": oid}
        ]
    except:
        query["assigned_employee"] = employee_id

    docs = list(meetings_col.find(query).sort("date", 1).limit(5))
    return [serialize(d, company_id) for d in docs]
