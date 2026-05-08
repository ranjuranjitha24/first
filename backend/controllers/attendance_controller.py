from bson import ObjectId
from config.db import attendance_col, employees_col
from datetime import datetime, timezone
from fastapi import HTTPException

def serialize(doc) -> dict:
    if not doc: return None
    doc["_id"] = str(doc["_id"])
    return doc

def get_attendance(employee_id: str = None, date: str = None):
    query = {}
    if employee_id: query["employee_id"] = employee_id
    if date: query["date"] = date
    
    docs = list(attendance_col.find(query).sort("date", -1))
    return [serialize(d) for d in docs]

def check_in_out(employee_id: str, type: str):
    now = datetime.now()
    today_str = now.strftime("%Y-%m-%d")
    time_str = now.strftime("%I:%M %p")
    
    # Find existing record for today
    record = attendance_col.find_one({"employee_id": employee_id, "date": today_str})
    
    if type == "check-in":
        if record:
            raise HTTPException(status_code=400, detail="Already checked in today")
        
        # Determine status (e.g., after 9:30 AM is Late)
        status = "Present"
        if now.hour > 9 or (now.hour == 9 and now.minute > 30):
            status = "Late"
            
        new_record = {
            "employee_id": employee_id,
            "date": today_str,
            "status": status,
            "check_in": time_str,
            "check_out": None,
            "work_hours": 0
        }
        attendance_col.insert_one(new_record)
        return {"message": f"Checked in at {time_str}", "status": status}
    
    else: # check-out
        if not record:
            raise HTTPException(status_code=400, detail="Must check-in first")
        if record.get("check_out"):
            raise HTTPException(status_code=400, detail="Already checked out today")
            
        # Calculate work hours (simplified)
        check_in_time = datetime.strptime(record["check_in"], "%I:%M %p")
        # Note: This is simplified as it doesn't handle date crossover, 
        # but for a daily check-in it works.
        duration = now.hour - check_in_time.hour + (now.minute - check_in_time.minute)/60
        
        attendance_col.update_one(
            {"_id": record["_id"]},
            {"$set": {"check_out": time_str, "work_hours": round(duration, 2)}}
        )
        return {"message": f"Checked out at {time_str}", "hours": round(duration, 2)}

def get_attendance_stats(employee_id: str = None):
    query = {}
    if employee_id:
        query["employee_id"] = employee_id
    docs = list(attendance_col.find(query))
    stats = {"Present": 0, "Late": 0, "Absent": 0, "On Leave": 0, "totalHours": 0}
    for d in docs:
        stats[d["status"]] = stats.get(d["status"], 0) + 1
        stats["totalHours"] += d.get("work_hours", 0)
    return stats
