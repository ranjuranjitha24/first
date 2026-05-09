import hashlib
import time
import base64
import json
from datetime import datetime
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
        role = user.get("role", "employee") 
        # Crucial: Use the linked employee_id if it exists, otherwise fall back to user _id
        employee_id = str(user.get("employee_id") or user.get("_id"))
    else:
        raise HTTPException(status_code=401, detail="User not found")

    token = make_token(data.username, role, employee_id)
    return {"token": token, "username": data.username, "role": role}

def seed_admin():
    from config.db import employees_col
    if employees_col.count_documents({"email": "admin@hrpro.com"}) == 0:
        admin_res = employees_col.insert_one({
            "name": "Admin User", 
            "email": "admin@hrpro.com", 
            "role": "admin", 
            "department": "Management",
            "createdAt": datetime.now().isoformat()
        })
        users_col.insert_one({
            "username": "admin", 
            "password": hash_pw("admin123"), 
            "role": "admin",
            "employee_id": str(admin_res.inserted_id)
        })
        print("✅ Admin Employee & User created")
    
    if employees_col.count_documents({"email": "user@hrpro.com"}) == 0:
        user_res = employees_col.insert_one({
            "name": "Default Employee", 
            "email": "user@hrpro.com", 
            "role": "employee", 
            "department": "Engineering",
            "createdAt": datetime.now().isoformat()
        })
        users_col.insert_one({
            "username": "user", 
            "password": hash_pw("user123"), 
            "role": "employee",
            "employee_id": str(user_res.inserted_id)
        })
        print("✅ Default Employee & User created")
    if users_col.count_documents({"username": "candidate"}) == 0:
        users_col.insert_one({
            "username": "candidate", 
            "password": hash_pw("candidate123"), 
            "role": "candidate"
        })
        print("✅ Candidate created: candidate | candidate123")
    
    from config.db import candidates_col, jobs_col
    if jobs_col.count_documents({}) == 0:
        jobs = [
            {"title": "Frontend Developer", "department": "Engineering", "location": "Bangalore", "type": "Full-time", "status": "Open", "createdAt": datetime.now().isoformat()},
            {"title": "Backend Developer", "department": "Engineering", "location": "Remote", "type": "Full-time", "status": "Open", "createdAt": datetime.now().isoformat()},
            {"title": "UI/UX Designer", "department": "Design", "location": "Bangalore", "type": "Contract", "status": "Open", "createdAt": datetime.now().isoformat()}
        ]
        jobs_col.insert_many(jobs)
        print("✅ Sample jobs seeded")

    if candidates_col.count_documents({}) == 0:
        # Get job IDs safely
        fe_job = jobs_col.find_one({"title": "Frontend Developer"}) or {"_id": "fe_id"}
        be_job = jobs_col.find_one({"title": "Backend Developer"}) or {"_id": "be_id"}
        ui_job = jobs_col.find_one({"title": "UI/UX Designer"}) or {"_id": "ui_id"}
        
        candidates = [
            {"name": "Aditya Verma", "email": "aditya@example.com", "job_id": str(fe_job.get("_id")), "stage": "Applied", "skills": "React, CSS", "createdAt": datetime.now().isoformat()},
            {"name": "Sneha Rao", "email": "sneha@example.com", "job_id": str(be_job.get("_id")), "stage": "Shortlisted", "skills": "Python, FastAPI", "createdAt": datetime.now().isoformat()},
            {"name": "John Doe", "email": "john@example.com", "job_id": str(ui_job.get("_id")), "stage": "Interview", "skills": "Figma, Adobe XD", "createdAt": datetime.now().isoformat()},
            {"name": "Laksh", "email": "laksh@example.com", "job_id": str(fe_job.get("_id")), "stage": "Applied", "skills": "JavaScript, Tailwind", "createdAt": datetime.now().isoformat()}
        ]
        candidates_col.insert_many(candidates)
        print("✅ Sample candidates seeded (including Laksh)")
