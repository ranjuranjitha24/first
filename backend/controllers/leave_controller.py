from bson import ObjectId
from config.db import leaves_col, employees_col
from models.leave_model import LeaveCreate, LeaveUpdate
from fastapi import HTTPException

def serialize(doc) -> dict:
    if not doc: return None
    doc["_id"] = str(doc["_id"])
    
    # Robustly join employee name and username
    if "employee_id" in doc:
        try:
            emp = employees_col.find_one({"_id": ObjectId(doc["employee_id"])})
            if emp:
                doc["employee_name"] = emp.get("name", "Unknown")
                doc["employee_username"] = emp.get("username", "Unknown")
            else:
                # Fallback to users collection if not found in employees
                from config.db import users_col
                user_doc = users_col.find_one({"_id": ObjectId(doc["employee_id"])})
                if user_doc:
                    doc["employee_username"] = user_doc.get("username", "Unknown")
                    doc["employee_name"] = user_doc.get("username", "Unknown")
        except:
            doc["employee_name"] = doc.get("employee_name", "Unknown")
            doc["employee_username"] = doc.get("employee_username", "Unknown")
    return doc

def get_leave_by_id(lid: str):
    try:
        doc = leaves_col.find_one({"_id": ObjectId(lid)})
        return serialize(doc)
    except:
        return None

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
    print(f"✅ Leave request created: {res.inserted_id} for Employee: {payload.get('employee_id')}")
    return serialize(leaves_col.find_one({"_id": res.inserted_id}))

def update_leave(lid: str, data: LeaveUpdate):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    # Get original leave to find user_id
    leave = leaves_col.find_one({"_id": ObjectId(lid)})
    if not leave: raise HTTPException(status_code=404, detail="Leave not found")
    
    res = leaves_col.update_one({"_id": ObjectId(lid)}, {"$set": update_data})
    updated_leave = leaves_col.find_one({"_id": ObjectId(lid)})
    
    # Send Notification if status changed
    if "status" in update_data:
        import controllers.notification_controller as notif_ctrl
        from models.notification_model import NotificationCreate
        
        status = update_data["status"]
        notif_title = f"Leave Request {status}"
        notif_msg = f"Your leave request for {leave.get('leave_type')} has been {status.lower()}."
        if update_data.get("manager_comment"):
            notif_msg += f" Remarks: {update_data['manager_comment']}"
            
        notif_ctrl.create_notification(NotificationCreate(
            user_id=leave["employee_id"],
            title=notif_title,
            message=notif_msg,
            type="success" if status == "Approved" else "danger"
        ))
        
    return serialize(updated_leave)

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
