from bson import ObjectId
from config.db import notifications_col
from models.notification_model import NotificationCreate
from datetime import datetime

def serialize(doc) -> dict:
    if not doc: return None
    doc["_id"] = str(doc["_id"])
    return doc

def get_notifications(user_id: str):
    docs = list(notifications_col.find({"user_id": user_id}).sort("createdAt", -1))
    return [serialize(d) for d in docs]

def create_notification(data: NotificationCreate):
    payload = data.model_dump()
    payload["is_read"] = False
    payload["createdAt"] = datetime.now().isoformat()
    res = notifications_col.insert_one(payload)
    return serialize(notifications_col.find_one({"_id": res.inserted_id}))

def mark_as_read(nid: str):
    notifications_col.update_one({"_id": ObjectId(nid)}, {"$set": {"is_read": True}})
    return {"message": "Marked as read"}

def mark_all_as_read(user_id: str):
    notifications_col.update_many({"user_id": user_id}, {"$set": {"is_read": True}})
    return {"message": "All marked as read"}

def get_unread_count(user_id: str):
    return notifications_col.count_documents({"user_id": user_id, "is_read": False})
