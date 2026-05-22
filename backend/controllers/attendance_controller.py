from bson import ObjectId
from config.db import attendance_col, employees_col
from datetime import datetime, timezone
from fastapi import HTTPException

def serialize(doc) -> dict:
    if not doc: return None
    doc["_id"] = str(doc["_id"])
    # Robustly join employee name and username if missing
    if not doc.get("employee_name") or doc.get("employee_name") == "Unknown" or not doc.get("employee_username"):
        try:
            emp_query = {"_id": ObjectId(doc.get("employee_id"))}
            # For serialize we might not have company_id readily available unless passed,
            # but attendance controller isn't passing company_id to serialize.
            # Let's add it to serialize signature if needed, or rely on _id.
            emp = employees_col.find_one(emp_query)
            if emp:
                doc["employee_name"] = emp.get("name", "Unknown")
                doc["employee_username"] = emp.get("username", "Unknown")
            else:
                # If not in employees, maybe in users?
                from config.db import users_col
                user_doc = users_col.find_one({"_id": ObjectId(doc.get("employee_id"))})
                if user_doc:
                    doc["employee_username"] = user_doc.get("username", "Unknown")
                    # Try to find employee by name/username
                    emp_by_name = employees_col.find_one({"username": user_doc.get("username")})
                    if emp_by_name:
                        doc["employee_name"] = emp_by_name.get("name", "Unknown")
                    else:
                        doc["employee_name"] = user_doc.get("username", "Unknown")
        except:
            pass
    return doc

def get_attendance(employee_id: str = None, date: str = None, search: str = "", company_id: str = None):
    query = {}
    if company_id: query["company_id"] = company_id
    if employee_id: 
        query["employee_id"] = employee_id
    if date: 
        query["date"] = date
    
    docs = list(attendance_col.find(query).sort("date", -1))
    results = [serialize(d) for d in docs]
    
    if search:
        search = search.lower()
        results = [r for r in results if search in r.get("employee_name", "").lower() or search in r.get("employee_username", "").lower()]
        
    return results

def check_in_out(employee_id: str, type: str, company_id: str = None):
    now = datetime.now()
    today_str = now.strftime("%Y-%m-%d")
    time_str = now.strftime("%I:%M %p")
    
    query = {"employee_id": employee_id, "date": today_str}
    if company_id: query["company_id"] = company_id
    record = attendance_col.find_one(query)
    
    if type == "check-in":
        if record:
            raise HTTPException(status_code=400, detail="Already checked in today")
        
        status = "Present"
        if now.hour > 9 or (now.hour == 9 and now.minute > 30):
            status = "Late"
            
        # Fetch employee details to save username/name
        emp = None
        username = "Unknown"
        try:
            emp = employees_col.find_one({"_id": ObjectId(employee_id)})
            if emp:
                username = emp.get("username", "Unknown")
            else:
                # Try finding in users table
                from config.db import users_col
                u = users_col.find_one({"_id": ObjectId(employee_id)})
                if u: 
                    username = u.get("username")
                    # Sync back to employee if possible
                    emp = employees_col.find_one({"username": username})
        except:
            pass
        
        emp_name = emp["name"] if emp else (username if username != "Unknown" else "Staff Member")
        
        new_record = {
            "employee_id": employee_id,
            "employee_name": emp_name,
            "employee_username": username,
            "date": today_str,
            "status": status,
            "check_in": time_str,
            "check_out": None,
            "work_hours": 0
        }
        if company_id: new_record["company_id"] = company_id
        attendance_col.insert_one(new_record)
        return {"message": f"Checked in at {time_str}", "status": status}
    
    else: # check-out
        if not record:
            raise HTTPException(status_code=400, detail="Must check-in first")
        if record.get("check_out"):
            raise HTTPException(status_code=400, detail="Already checked out today")
            
        check_in_time = datetime.strptime(record["check_in"], "%I:%M %p")
        # Handle same-day duration
        duration = (now.hour - check_in_time.hour) + (now.minute - check_in_time.minute)/60
        
        attendance_col.update_one(
            {"_id": record["_id"]},
            {"$set": {"check_out": time_str, "work_hours": max(0, round(duration, 2))}}
        )
        return {"message": f"Checked out at {time_str}", "hours": round(duration, 2)}

def get_attendance_stats(employee_id: str = None, company_id: str = None):
    query = {}
    if company_id: query["company_id"] = company_id
    
    if employee_id:
        query["employee_id"] = employee_id
        docs = list(attendance_col.find(query))
        stats = {"Present": 0, "Late": 0, "Absent": 0, "On Leave": 0, "totalHours": 0}
        for d in docs:
            stats[d["status"]] = stats.get(d["status"], 0) + 1
            stats["totalHours"] += d.get("work_hours", 0)
        return stats
    else:
        # Admin stats for today
        today = datetime.now().strftime("%Y-%m-%d")
        emp_query = {"role": "employee"}
        if company_id: emp_query["company_id"] = company_id
        all_emps = list(employees_col.find(emp_query, {"name": 1, "username": 1}))
        total_employees = len(all_emps)
        
        att_query = {"date": today}
        if company_id: att_query["company_id"] = company_id
        
        present_docs = list(attendance_col.find(att_query))
        present_ids = {d["employee_id"] for d in present_docs}
        
        present_today = len(present_ids)
        late_query = {"date": today, "status": "Late"}
        if company_id: late_query["company_id"] = company_id
        late_today = attendance_col.count_documents(late_query)
        
        absent_employees = [e["name"] for e in all_emps if str(e["_id"]) not in present_ids]
        
        return {
            "total_employees": total_employees,
            "present_today": present_today,
            "late_today": late_today,
            "absent_today": max(0, total_employees - present_today),
            "absent_list": absent_employees,
            "attendance_percentage": round((present_today / total_employees * 100), 1) if total_employees > 0 else 0
        }
