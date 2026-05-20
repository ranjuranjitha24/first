import hashlib
import time
import base64
import json
import secrets
from datetime import datetime
from config.db import users_col, notifications_col
from models.user_model import UserCreate, UserLogin, CandidateRegister, CandidateLogin
from fastapi import HTTPException


# ── Helpers ──────────────────────────────────────────────────

def hash_pw(pw: str) -> str:
    return hashlib.sha256(pw.encode()).hexdigest()


def make_token(identifier: str, role: str, employee_id: str = None,
               full_name: str = None, email: str = None) -> str:
    payload = {
        "username": identifier,   # kept as 'username' key for backward-compat
        "role": role,
        "exp": int(time.time()) + 3153600000   # 100 years
    }
    if employee_id:
        payload["employee_id"] = employee_id
    if full_name:
        payload["full_name"] = full_name
    if email:
        payload["email"] = email
    return base64.b64encode(json.dumps(payload).encode()).decode()


def verify_token(token: str) -> dict:
    try:
        payload = json.loads(base64.b64decode(token).decode())
        if "exp" in payload and payload["exp"] < time.time():
            raise HTTPException(status_code=401, detail="Token expired")
        return payload
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


# ── Admin / HR authentication (username-based) ───────────────

def register_user(data: UserCreate) -> dict:
    if users_col.find_one({"username": data.username}):
        raise HTTPException(status_code=400, detail="Username already exists")
    doc = {
        "username": data.username,
        "password": hash_pw(data.password),
        "role": data.role,
        "createdAt": datetime.now().isoformat()
    }
    users_col.insert_one(doc)
    return {"message": "User created"}


def login_user(data: UserLogin) -> dict:
    user = users_col.find_one({"username": data.username})

    # Auto-seed test accounts on first run
    if not user and data.username in ["admin", "user", "candidate"]:
        seed_admin()
        user = users_col.find_one({"username": data.username})

    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    if user["password"] != hash_pw(data.password):
        raise HTTPException(status_code=401, detail="Wrong password")

    role = user.get("role", "employee")
    employee_id = str(user.get("employee_id") or user.get("_id"))
    full_name = user.get("full_name", user.get("username"))
    email = user.get("email", "")
    token = make_token(data.username, role, employee_id, full_name, email)
    return {"token": token, "username": data.username, "role": role}


# ── Candidate self-registration (email-based) ────────────────

def register_candidate(data: CandidateRegister) -> dict:
    # Uniqueness: block duplicate emails
    if users_col.find_one({"email": data.email, "role": "candidate"}):
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    doc = {
        "username": data.email,          # email used as primary identifier
        "email": data.email,
        "full_name": data.full_name,
        "phone": data.phone,
        "resume": data.resume,
        "password": hash_pw(data.password),
        "role": "candidate",
        "skills": [],
        "experience": [],
        "education": [],
        "bio": "",
        "location": "",
        "createdAt": datetime.now().isoformat()
    }
    users_col.insert_one(doc)

    # Welcome notification
    notifications_col.insert_one({
        "recipient": data.email,
        "title": "Welcome to RecruiterPro!",
        "message": f"Hi {data.full_name}, your account is ready. Start exploring jobs!",
        "type": "success",
        "read": False,
        "createdAt": datetime.now().isoformat()
    })

    return {"message": "Account created successfully"}


def login_candidate(data: CandidateLogin) -> dict:
    user = users_col.find_one({"email": data.email, "role": "candidate"})

    # Fallback: also check legacy username-based candidate account
    if not user:
        user = users_col.find_one({"username": "candidate", "role": "candidate"})
        if user and data.email != "candidate":
            user = None   # not a match for this email

    if not user:
        raise HTTPException(status_code=401, detail="No account found with this email")
    if user["password"] != hash_pw(data.password):
        raise HTTPException(status_code=401, detail="Incorrect password")

    email = user.get("email", user.get("username"))
    full_name = user.get("full_name", email)
    employee_id = str(user.get("_id"))
    token = make_token(email, "candidate", employee_id, full_name, email)
    return {
        "token": token,
        "username": email,
        "email": email,
        "full_name": full_name,
        "role": "candidate"
    }


# ── Forgot / Reset password (email-based) ────────────────────
# Simple token stored in DB — no SMTP required for demo; token shown in response
# In production, email the reset link.

def forgot_password(email: str) -> dict:
    user = users_col.find_one({"email": email, "role": "candidate"})
    if not user:
        # Return generic message to avoid user enumeration
        return {"message": "If an account exists, a reset link has been sent."}

    reset_token = secrets.token_urlsafe(32)
    expiry = int(time.time()) + 3600  # 1 hour

    users_col.update_one(
        {"email": email},
        {"$set": {"reset_token": reset_token, "reset_token_exp": expiry}}
    )

    # In production: send email. For demo, return token directly.
    return {
        "message": "Password reset token generated.",
        "reset_token": reset_token   # Remove this in production; send via email
    }


def reset_password(token: str, new_password: str) -> dict:
    user = users_col.find_one({"reset_token": token})
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    if user.get("reset_token_exp", 0) < time.time():
        raise HTTPException(status_code=400, detail="Reset token has expired")

    users_col.update_one(
        {"reset_token": token},
        {"$set": {"password": hash_pw(new_password)},
         "$unset": {"reset_token": "", "reset_token_exp": ""}}
    )
    return {"message": "Password updated successfully"}


# ── Seed default users ────────────────────────────────────────

def seed_admin():
    from config.db import employees_col, jobs_col, candidates_col

    # Admin
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
            "employee_id": str(admin_res.inserted_id),
            "createdAt": datetime.now().isoformat()
        })
        print("✅ Admin created: admin / admin123")

    # Default employee
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
            "employee_id": str(user_res.inserted_id),
            "createdAt": datetime.now().isoformat()
        })
        print("✅ Employee created: user / user123")

    # Demo candidate (legacy username account for demo button)
    if users_col.count_documents({"username": "candidate"}) == 0:
        users_col.insert_one({
            "username": "candidate",
            "email": "candidate@demo.com",
            "full_name": "Demo Candidate",
            "password": hash_pw("candidate123"),
            "role": "candidate",
            "skills": ["React", "Python"],
            "experience": ["2 years at TechCorp as Frontend Dev"],
            "education": ["B.Tech Computer Science, 2022"],
            "bio": "Passionate developer looking for opportunities.",
            "location": "Bangalore",
            "createdAt": datetime.now().isoformat()
        })
        print("✅ Demo candidate: candidate@demo.com / candidate123")

    # Sample jobs
    if jobs_col.count_documents({}) == 0:
        jobs = [
            {"title": "Frontend Developer", "department": "Engineering",
             "location": "Bangalore", "type": "Full-time", "status": "Open",
             "salary": "₹8-12 LPA", "required_skills": "React, CSS, JavaScript",
             "createdAt": datetime.now().isoformat()},
            {"title": "Backend Developer", "department": "Engineering",
             "location": "Remote", "type": "Full-time", "status": "Open",
             "salary": "₹10-15 LPA", "required_skills": "Python, FastAPI, MongoDB",
             "createdAt": datetime.now().isoformat()},
            {"title": "UI/UX Designer", "department": "Design",
             "location": "Bangalore", "type": "Contract", "status": "Open",
             "salary": "₹6-10 LPA", "required_skills": "Figma, Adobe XD",
             "createdAt": datetime.now().isoformat()}
        ]
        jobs_col.insert_many(jobs)
        print("✅ Sample jobs seeded")

    # Sample candidates
    if candidates_col.count_documents({}) == 0:
        fe = jobs_col.find_one({"title": "Frontend Developer"}) or {"_id": "fe"}
        be = jobs_col.find_one({"title": "Backend Developer"}) or {"_id": "be"}
        ui = jobs_col.find_one({"title": "UI/UX Designer"}) or {"_id": "ui"}
        candidates_col.insert_many([
            {"name": "Aditya Verma", "email": "aditya@example.com",
             "job_id": str(fe["_id"]), "stage": "Applied", "createdAt": datetime.now().isoformat()},
            {"name": "Sneha Rao",    "email": "sneha@example.com",
             "job_id": str(be["_id"]), "stage": "Shortlisted", "createdAt": datetime.now().isoformat()},
            {"name": "John Doe",     "email": "john@example.com",
             "job_id": str(ui["_id"]), "stage": "Interview",   "createdAt": datetime.now().isoformat()},
        ])
        print("✅ Sample pipeline candidates seeded")
