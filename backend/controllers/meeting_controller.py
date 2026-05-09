from bson import ObjectId
from config.db import meetings_col, employees_col
from models.meeting_model import MeetingCreate, MeetingUpdate
from fastapi import HTTPException

def serialize(doc) -> dict:
    if not doc: return None
    doc["_id"] = str(doc["_id"])
    if "assigned_employee" in doc and "assigned_employee_name" not in doc:
        try:
            emp = employees_col.find_one({"_id": ObjectId(doc["assigned_employee"])})
            doc["assigned_employee_name"] = emp["name"] if emp else "Unknown"
        except:
            doc["assigned_employee_name"] = "Unknown"
    return doc

def get_all_meetings(employee_id: str = None, status: str = None):
    query = {}
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
    return [serialize(d) for d in docs]

from controllers.notification_controller import create_notification
from models.notification_model import NotificationCreate

def create_meeting(data: MeetingCreate):
    payload = data.model_dump()
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
        
    return serialize(meetings_col.find_one({"_id": res.inserted_id}))

def update_meeting(mid: str, data: MeetingUpdate):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    meetings_col.update_one({"_id": ObjectId(mid)}, {"$set": update_data})
    return serialize(meetings_col.find_one({"_id": ObjectId(mid)}))

def delete_meeting(mid: str):
    meetings_col.delete_one({"_id": ObjectId(mid)})
    return {"message": "Meeting deleted"}

def get_upcoming_meetings(employee_id: str):
    # Robust check for both string and ObjectId
    query = {"status": "Scheduled"}
    try:
        oid = ObjectId(employee_id)
        query["$or"] = [
            {"assigned_employee": employee_id},
            {"assigned_employee": oid}
        ]
    except:
        query["assigned_employee"] = employee_id

    docs = list(meetings_col.find(query).sort("date", 1).limit(5))
    return [serialize(d) for d in docs]
