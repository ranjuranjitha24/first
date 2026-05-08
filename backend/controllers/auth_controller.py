import hashlib
import time
import base64
import json
from config.db import users_col
from models.user_model import UserCreate, UserLogin
from fastapi import HTTPException, Depends, Header

def hash_pw(pw: str) -> str:
    return hashlib.sha256(pw.encode()).hexdigest()

def make_token(username: str, role: str, employee_id: str = None) -> str:
    # Adding expiry (1 day) to make it feel like a real JWT
    payload = {
        "username": username, 
        "role": role, 
        "exp": int(time.time()) + 86400
    }
    if employee_id:
        payload["employee_id"] = employee_id
    # Standard JWT-ish format: header.payload.signature
    # Here we just base64 the payload for simplicity as requested to keep architecture
    return base64.b64encode(json.dumps(payload).encode()).decode()

def verify_token(token: str) -> dict:
    try:
        payload = json.loads(base64.b64decode(token).decode())
        if payload.get("exp", 0) < time.time():
            raise HTTPException(status_code=401, detail="Token expired")
        return payload
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing authorization header")
    token = authorization.split(" ")[1]
    return verify_token(token)

def check_role(user: dict, allowed_roles: list):
    if user.get("role") not in allowed_roles:
        raise HTTPException(status_code=403, detail="Access denied")
    return True

def register_user(data: UserCreate) -> dict:
    if users_col.find_one({"username": data.username}):
        raise HTTPException(status_code=400, detail="Username already exists")
    doc = {"username": data.username, "password": hash_pw(data.password), "role": data.role}
    users_col.insert_one(doc)
    return {"message": "User created"}

def login_user(data: UserLogin) -> dict:
    user = users_col.find_one({"username": data.username})
    
    # Auto-seed test accounts if they don't exist
    if not user and data.username in ["user", "candidate"]:
        seed_admin()
        user = users_col.find_one({"username": data.username})

    if user:
        if user["password"] != hash_pw(data.password):
            raise HTTPException(status_code=401, detail="Wrong password")
        role = user.get("role", "employee") # Default to employee
        employee_id = str(user.get("_id"))
    else:
        raise HTTPException(status_code=401, detail="User not found")

    token = make_token(data.username, role, employee_id)
    return {"token": token, "username": data.username, "role": role}

def seed_admin():
    if users_col.count_documents({"username": "admin"}) == 0:
        users_col.insert_one({
            "username": "admin", 
            "password": hash_pw("admin123"), 
            "role": "admin"
        })
        print("✅ Admin created: admin | admin123")
    if users_col.count_documents({"username": "user"}) == 0:
        users_col.insert_one({
            "username": "user", 
            "password": hash_pw("user123"), 
            "role": "employee"
        })
        print("✅ Employee created: user | user123")
    if users_col.count_documents({"username": "candidate"}) == 0:
        users_col.insert_one({
            "username": "candidate", 
            "password": hash_pw("candidate123"), 
            "role": "candidate"
        })
        print("✅ Candidate created: candidate | candidate123")
    
    from config.db import candidates_col
    if candidates_col.count_documents({}) == 0:
        candidates_col.insert_many([
            {"name": "Aditya Verma", "email": "aditya@example.com", "job_title": "Frontend Developer", "status": "Applied", "skills": "React, CSS"},
            {"name": "Sneha Rao", "email": "sneha@example.com", "job_title": "Backend Developer", "status": "Shortlisted", "skills": "Python, FastAPI"},
            {"name": "John Doe", "email": "john@example.com", "job_title": "UI/UX Designer", "status": "Interview", "skills": "Figma, Adobe XD"}
        ])
        print("✅ Sample candidates seeded")
