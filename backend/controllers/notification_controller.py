from bson import ObjectId
from config.db import notifications_col
from models.notification_model import NotificationCreate
from datetime import datetime

def serialize(doc) -> dict:
    if not doc: return None
    doc["_id"] = str(doc["_id"])
    return doc

def get_notifications(user_id: str, company_id: str = None):
    query = {"user_id": user_id}
    if company_id: query["company_id"] = company_id
    docs = list(notifications_col.find(query).sort("createdAt", -1))
    return [serialize(d) for d in docs]

def create_notification(data: NotificationCreate, company_id: str = None):
    payload = data.model_dump()
    payload["is_read"] = False
    payload["createdAt"] = datetime.now().isoformat()
    if company_id: payload["company_id"] = company_id
    res = notifications_col.insert_one(payload)
    return serialize(notifications_col.find_one({"_id": res.inserted_id}))

def mark_as_read(nid: str, company_id: str = None):
    query = {"_id": ObjectId(nid)}
    if company_id: query["company_id"] = company_id
    notifications_col.update_one(query, {"$set": {"is_read": True}})
    return {"message": "Marked as read"}

def mark_all_as_read(user_id: str, company_id: str = None):
    query = {"user_id": user_id}
    if company_id: query["company_id"] = company_id
    notifications_col.update_many(query, {"$set": {"is_read": True}})
    return {"message": "All marked as read"}

def get_unread_count(user_id: str, company_id: str = None):
    query = {"user_id": user_id, "is_read": False}
    if company_id: query["company_id"] = company_id
    return notifications_col.count_documents(query)
