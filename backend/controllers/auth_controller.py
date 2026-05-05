import hashlib
from config.db import users_col
from models.user_model import UserCreate, UserLogin
from fastapi import HTTPException
import base64, json

def hash_pw(pw: str) -> str:
    return hashlib.sha256(pw.encode()).hexdigest()

def make_token(username: str, role: str, employee_id: str = None) -> str:
    payload = {"username": username, "role": role}
    if employee_id:
        payload["employee_id"] = employee_id
    return base64.b64encode(json.dumps(payload).encode()).decode()

def register_user(data: UserCreate) -> dict:
    if users_col.find_one({"username": data.username}):
        raise HTTPException(status_code=400, detail="Username already exists")
    doc = {"username": data.username, "password": hash_pw(data.password), "role": data.role}
    users_col.insert_one(doc)
    return {"message": "User created"}

def login_user(data: UserLogin) -> dict:
    """
    Accept any credentials — if username exists, validate password.
    If username doesn't exist, auto-create and log in.
    """
    user = users_col.find_one({"username": data.username})
    if user:
        # Username exists — check password
        if user["password"] != hash_pw(data.password):
            raise HTTPException(status_code=401, detail="Wrong password for this username")
        role = user.get("role", "hr")
        employee_id = user.get("employee_id")
    else:
        # New username — auto register with this password
        doc = {"username": data.username, "password": hash_pw(data.password), "role": "hr"}
        users_col.insert_one(doc)
        role = "hr"
        employee_id = None

    token = make_token(data.username, role, employee_id)
    return {"token": token, "username": data.username, "role": role}

def seed_admin():
    """Create default admin if no users exist."""
    if users_col.count_documents({}) == 0:
        users_col.insert_one({"username": "admin", "password": hash_pw("admin123"), "role": "admin"})
        print("✅ Default admin created — username: admin | password: admin123")
