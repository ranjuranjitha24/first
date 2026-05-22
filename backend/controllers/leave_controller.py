from bson import ObjectId
from config.db import leaves_col, employees_col
from models.leave_model import LeaveCreate, LeaveUpdate
from fastapi import HTTPException

def serialize(doc, company_id=None) -> dict:
    if not doc: return None
    doc["_id"] = str(doc["_id"])
    
    # Robustly join employee name and username
    if "employee_id" in doc:
        try:
            emp_query = {"_id": ObjectId(doc["employee_id"])}
            if company_id: emp_query["company_id"] = company_id
            emp = employees_col.find_one(emp_query)
            if emp:
                doc["employee_name"] = emp.get("name", "Unknown")
                doc["employee_username"] = emp.get("username", "Unknown")
            else:
                # Fallback to users collection if not found in employees
                from config.db import users_col
                user_query = {"_id": ObjectId(doc["employee_id"])}
                if company_id: user_query["company_id"] = company_id
                user_doc = users_col.find_one(user_query)
                if user_doc:
                    doc["employee_username"] = user_doc.get("username", "Unknown")
                    doc["employee_name"] = user_doc.get("username", "Unknown")
        except:
            doc["employee_name"] = doc.get("employee_name", "Unknown")
            doc["employee_username"] = doc.get("employee_username", "Unknown")
    return doc

def get_leave_by_id(lid: str, company_id: str = None):
    try:
        query = {"_id": ObjectId(lid)}
        if company_id: query["company_id"] = company_id
        doc = leaves_col.find_one(query)
        return serialize(doc, company_id)
    except:
        return None

def get_all_leaves(status: str = "", employee_id: str = "", company_id: str = None):
    query = {}
    if company_id: query["company_id"] = company_id
    if status: query["status"] = status
    if employee_id: query["employee_id"] = employee_id
    
    docs = list(leaves_col.find(query).sort("from_date", -1))
    return [serialize(d, company_id) for d in docs]

def create_leave(data: LeaveCreate, company_id: str = None):
    payload = data.model_dump()
    if company_id: payload["company_id"] = company_id
    # In a real app, we'd check if balance > 0 here.
    res = leaves_col.insert_one(payload)
    print(f"✅ Leave request created: {res.inserted_id} for Employee: {payload.get('employee_id')}")
    return serialize(leaves_col.find_one({"_id": res.inserted_id}), company_id)

def update_leave(lid: str, data: LeaveUpdate, company_id: str = None):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    # Get original leave to find user_id
    query = {"_id": ObjectId(lid)}
    if company_id: query["company_id"] = company_id
    leave = leaves_col.find_one(query)
    if not leave: raise HTTPException(status_code=404, detail="Leave not found")
    
    res = leaves_col.update_one(query, {"$set": update_data})
    updated_leave = leaves_col.find_one(query)
    
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
        
    return serialize(updated_leave, company_id)

def delete_leave(lid: str, company_id: str = None):
    query = {"_id": ObjectId(lid)}
    if company_id: query["company_id"] = company_id
    leaves_col.delete_one(query)
    return {"message": "Leave request deleted"}

def get_leave_balances(employee_id: str, company_id: str = None):
    # Mock balance for now, normally stored in employee or separate collection
    query = {"employee_id": employee_id, "status": "Approved"}
    if company_id: query["company_id"] = company_id
    return {
        "Sick": 12,
        "Casual": 10,
        "Earned": 18,
        "used": leaves_col.count_documents(query)
    }

def get_leave_stats(company_id: str = None):
    # Admin stats
    query = {}
    if company_id: query["company_id"] = company_id
    return {
        "pending": leaves_col.count_documents({**query, "status": "Pending"}),
        "approved": leaves_col.count_documents({**query, "status": "Approved"}),
        "rejected": leaves_col.count_documents({**query, "status": "Rejected"}),
        "by_type": list(leaves_col.aggregate([
            {"$match": query} if company_id else {"$match": {}},
            {"$group": {"_id": "$leave_type", "count": {"$sum": 1}}}
        ]))
    }
